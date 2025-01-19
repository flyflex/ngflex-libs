import { switchMap } from 'rxjs/operators';

import { ActionOptions } from '../../models/action-options.model';
import { SignalStoreMethodsMap } from '../../models/action-types.model';
import { StoreAction } from '../../models/store-action.model';
import { SignalStoreMethod } from '../../models/signal-store-method.model';

/**
 * Map grouped firebase document actions to NGRX signal store method
 */

export const mapToSignalStoreMethod = <T>(
  methodsMap: SignalStoreMethodsMap,
  {
    parentId,
    includeParentIdInPayload,
    parentIdPayloadKey,
    includeParentIdInNoResults,
    parentIdProp,
    payloadProp,
  }: Partial<ActionOptions<T>> = {},
) =>
  switchMap((groupedActions: StoreAction<T>[]) =>
    groupedActions.map((storeAction: StoreAction<T>) => {
      if (storeAction.actionName === 'loadNoResults') {
        if (includeParentIdInNoResults && parentId) {
          return {
            methodName: methodsMap[storeAction.actionName],
            payload: {
              [parentIdProp]: parentId,
            }
          } as SignalStoreMethod<T>;
        } else {
          return {
            methodName: methodsMap[storeAction.actionName],
          } as SignalStoreMethod<T>;
        }
      }

      const payload = Array.isArray(storeAction.payload) && includeParentIdInPayload && parentIdPayloadKey
        ? storeAction.payload.map(entity => ({
          ...entity,
          [parentIdPayloadKey]: parentId,
        }))
        : storeAction.payload;

      return {
        methodName: methodsMap[storeAction.actionName],
        payload: {
          [payloadProp]: payload,
          [parentIdProp]: parentId,
        }
      } as SignalStoreMethod<T>;
    }),
  );
