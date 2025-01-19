import { pipe } from 'rxjs';

import { ActionOptions } from '../../models/action-options.model';
import { SignalStoreMethodsMap } from '../../models/signal-store-method-map.model';

import { fetchFirebaseStorageDocument } from '../fetch-firebase-storage-document.operator';
import { groupByAction } from '../group-by-action.operator';
import { mapToSignalStoreMethod } from './map-to-signal-store-method';

/**
 * Map Firebase document action to NGRX signal store method while fetching required documents
 */
export const mapDocumentActionToNgrxSignalStoreMethod = <T>(methodsMap: SignalStoreMethodsMap, options: Partial<ActionOptions<T>> = {}) => {
  const documentKeys = options.documentKeys || [];
  const angularFireStorage = options.angularFireStorage || null;
  const parentId = options.parentId || undefined;
  const includeParentIdInPayload = options.includeParentIdInPayload || false;
  const parentIdPayloadKey = options.parentIdPayloadKey || null;
  const includeParentIdInNoResults = options.includeParentIdInNoResults || false;
  const parentIdProp = options.parentIdProp || 'parentId';
  const payloadProp = options.payloadProp || 'payload';

  return pipe(
    fetchFirebaseStorageDocument<T>(
      documentKeys,
      angularFireStorage,
    ),
    groupByAction<T>(),
    mapToSignalStoreMethod(methodsMap,
      {
        parentId,
        includeParentIdInPayload,
        parentIdPayloadKey,
        includeParentIdInNoResults,
        parentIdProp,
        payloadProp,
      }),
  )
};
