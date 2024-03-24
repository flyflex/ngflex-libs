import { collectionChanges, collectionData, Query, DocumentData } from '@angular/fire/firestore';
import { startWith, switchMap, take } from 'rxjs/operators';

import { ActionTypes, ActionOptions, ActionCreatorWithNoProp } from '../models';
import { mapDocumentActionToNgrxAction } from './map-document-action-to-ngrx-action.operator';

export const wrapCollectionChangesToNgrx = <T>(
  query: Query<T, DocumentData>,
  actions: ActionTypes,
  mappingOptions: Partial<ActionOptions<T>> & { handleEmptyCollections?: boolean },
) => {
  const { handleEmptyCollections = true, ...ngrxMappingOptions } = mappingOptions;

  const collChangeStream = collectionChanges(query).pipe(
    mapDocumentActionToNgrxAction<T>(actions, ngrxMappingOptions as Partial<ActionOptions<T>>),
  );

  if (handleEmptyCollections && !!actions.loadNoResults) {
    return collectionData(query).pipe(
      take(1),
      switchMap((data) => {
        if (!data.length) {
          return collChangeStream.pipe(
            startWith((actions.loadNoResults as ActionCreatorWithNoProp)()),
          );
        }

        return collChangeStream;
      }),
    );
  }

  return collChangeStream;
}
