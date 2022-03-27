import { ActionCreator } from '@ngrx/store';
import { switchMap } from 'rxjs/operators';

import { ActionOptions } from '../models/action-options.model';
import { ActionTypes, AnyClass } from '../models/action-types.model';
import { StoreAction } from '../models/store-action.model';

/**
 * Map grouped firebase document actions to NGRX actions
 */
export const mapToActions = <T, A>(
  actions: ActionTypes,
  {
    parentId,
    includeParentIdInPayload,
    parentIdPayloadKey,
    includeParentIdInNoResults,
    useNgrxClassSyntax,
    ngrxActionParentIdProp,
    ngrxActionPayloadProp,
  }: Partial<ActionOptions<T>> = {},
) =>
  switchMap((groupedActions: StoreAction<T>[]): A[] =>
    groupedActions.map((storeAction: StoreAction<T>) => {
      if (storeAction.actionName === 'loadNoResults') {
        if (includeParentIdInNoResults && parentId) {
          return useNgrxClassSyntax
            ? new (actions[storeAction.actionName] as AnyClass)(parentId)
            : (actions[storeAction.actionName] as ActionCreator<string>)({ [ngrxActionParentIdProp]: parentId });
        } else {
          return useNgrxClassSyntax
            ? new (actions[storeAction.actionName] as AnyClass)()
            : (actions[storeAction.actionName] as ActionCreator<string>)();
        }
      }

      const payload = Array.isArray(storeAction.payload) && includeParentIdInPayload && parentIdPayloadKey
        ? storeAction.payload.map(entity => ({
            ...entity,
            [parentIdPayloadKey]: parentId,
          }))
        : storeAction.payload;

      return useNgrxClassSyntax
      ? new (actions[storeAction.actionName] as AnyClass)(payload, parentId)
      : (actions[storeAction.actionName] as ActionCreator<string>)({
        [ngrxActionPayloadProp]: payload,
        [ngrxActionParentIdProp]: parentId,
      });
    })
  );
