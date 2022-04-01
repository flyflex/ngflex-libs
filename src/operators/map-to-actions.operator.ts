import { TypedAction } from '@ngrx/store/src/models';
import { switchMap } from 'rxjs/operators';

import { ActionOptions } from '../models/action-options.model';
import {
  ActionCreatorWithParentIdProp,
  ActionCreatorWithParentIdPropAndPayloadProp,
  ActionCreatorWithNoProp,
  ActionTypes,
} from '../models/action-types.model';
import { StoreAction } from '../models/store-action.model';

/**
 * Map grouped firebase document actions to NGRX actions
 */

export const mapToActions = <T>(
  actions: ActionTypes,
  {
    parentId,
    includeParentIdInPayload,
    parentIdPayloadKey,
    includeParentIdInNoResults,
    parentIdProp,
    payloadProp,
  }: Partial<ActionOptions<T>> = {},
) =>
  switchMap((groupedActions: StoreAction<T>[]):
    (TypedAction<string> & any)[] =>
    groupedActions.map((storeAction: StoreAction<T>) => {
      if (storeAction.actionName === 'loadNoResults') {
        if (includeParentIdInNoResults && parentId) {
          return (actions[storeAction.actionName] as ActionCreatorWithParentIdProp)({ [parentIdProp]: parentId });
        } else {
          return (actions[storeAction.actionName] as ActionCreatorWithNoProp)();
        }
      }

      const payload = Array.isArray(storeAction.payload) && includeParentIdInPayload && parentIdPayloadKey
        ? storeAction.payload.map(entity => ({
          ...entity,
          [parentIdPayloadKey]: parentId,
        }))
        : storeAction.payload;

      return (actions[storeAction.actionName] as ActionCreatorWithParentIdPropAndPayloadProp)({
        [payloadProp]: payload,
        [parentIdProp]: parentId,
      });
    }),
  );
