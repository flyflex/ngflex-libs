import { pipe } from 'rxjs';

import { ActionTypes } from '../models/action-types.model';
import { GroupByActionOptions } from '../models/group-by-action-options.model';

import { fetchFirebaseStorageDocument } from './fetch-firebase-storage-document.operator';
import { groupByAction } from './group-by-action.operator';
import { mapToActions } from './map-to-actions.operator';

/**
 * Map Firebase document action to NGRX ones while fetching required documents
 */
export const mapDocumentActionToNgrxAction = <T, A>(actionTypes: ActionTypes, options: Partial<GroupByActionOptions<T>> = {}) => {
  const documentKeys = options.documentKeys || [];
  const angularFireStorage = options.angularFireStorage || null;
  const parentId = options.parentId || undefined;
  const includeParentIdInPayload = options.includeParentIdInPayload || false;
  const parentIdPayloadKey = options.parentIdPayloadKey || null;
  const includeParentIdInNoResults = options.includeParentIdInNoResults || false;

  return pipe(
    fetchFirebaseStorageDocument<T>(
      documentKeys,
      angularFireStorage,
    ),
    groupByAction<T>(),
    mapToActions<T, A[]>(
      actionTypes,
      parentId,
      includeParentIdInPayload,
      parentIdPayloadKey,
      includeParentIdInNoResults,
    ),
  );
};
