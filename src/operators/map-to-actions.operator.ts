import { switchMap } from 'rxjs/operators';

import { ActionTypes } from '../models/action-types.model';
import { StoreAction } from '../models/store-action.model';

/**
 * Map grouped firebase document actions to NGRX actions
 */
export const mapToActions = <T, A>(
  actions: ActionTypes,
  parentId?: string,
  includeParentIdInPayload?: boolean,
  parentIdPayloadKey?: string,
  includeParentIdInNoResults?: boolean,
) =>
  switchMap((groupedActions: StoreAction<T>[]): A[] =>
    groupedActions.map((assetAction: StoreAction<T>) => {

      if (assetAction.action === 'loadNoResults' && includeParentIdInNoResults && parentId) {
        return new actions[assetAction.action](parentId);
      }

      const payload = Array.isArray(assetAction.payload) && includeParentIdInPayload && parentIdPayloadKey
        ? assetAction.payload.map(entity => ({
            ...entity,
            [parentIdPayloadKey]: parentId,
          }))
        : assetAction.payload;

      return new actions[assetAction.action](payload, parentId);
    })
  );
