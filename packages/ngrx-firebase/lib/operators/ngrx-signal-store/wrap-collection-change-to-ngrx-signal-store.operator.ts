import { collectionChanges, collectionData } from '@angular/fire/firestore';
import { DocumentData, Query } from 'firebase/firestore';
import { startWith, switchMap, take } from 'rxjs';

import { ActionOptions, SignalStoreMethodsMap } from '../../models';
import { SignalStoreMethod } from '../../models/signal-store-method.model';

import { mapDocumentActionToNgrxSignalStoreMethod } from './map-document-action-to-ngrx-signal-store-method.operator';

export const wrapCollectionChangesToNgrxSignalStore = <T>(
  query: Query<T, DocumentData>,
  methodsMap: SignalStoreMethodsMap,
  mappingOptions: Partial<ActionOptions<T>> & { handleEmptyCollections?: boolean },
) => {
  const { handleEmptyCollections = true, ...ngrxMappingOptions } = mappingOptions;

  const collChangeStream = collectionChanges(query).pipe(
    mapDocumentActionToNgrxSignalStoreMethod<T>(methodsMap, ngrxMappingOptions as Partial<ActionOptions<T>>),
  );

  if (handleEmptyCollections && !!methodsMap.loadNoResults) {
    return collectionData(query).pipe(
      take(1),
      switchMap((data) => {
        if (!data.length) {
          const loadNoResultsWithParentId: SignalStoreMethod<T> = { methodName: methodsMap.loadNoResults, payload: { [ngrxMappingOptions.parentIdProp]: ngrxMappingOptions.parentId } };
          const loadNoResultsNoPayload: SignalStoreMethod<T> = { methodName: methodsMap.loadNoResults };

          return collChangeStream.pipe(
            startWith(ngrxMappingOptions.includeParentIdInNoResults
              ? loadNoResultsWithParentId
              : loadNoResultsNoPayload,
            ),
          );
        }

        return collChangeStream;
      }),
    );
  }

  return collChangeStream;
}
