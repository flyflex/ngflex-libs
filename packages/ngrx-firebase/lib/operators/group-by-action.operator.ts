import { map } from 'rxjs/operators';

import { actionMap } from '../models/action-map.model';
import { NgrxDocumentChange } from '../models/ngrx-document-change.model';
import { StoreAction } from '../models/store-action.model';
import { WithId } from '../models/with-id.model';

/**
 * Group DocumentChangeAction by action type compatible with ngrx entity actions
 */
export const groupByAction = <T>() => map((documentChanges: NgrxDocumentChange<T>[]): StoreAction<T>[] => {
  if (!documentChanges.length) {
    return [{ actionName: 'loadNoResults' }];
  }

  return Object.values(documentChanges.reduce((current: { [type: string]: StoreAction<T> }, documentChange: NgrxDocumentChange<T>) => {
    const actionType: string = documentChange.type;
    const actionName: string = actionMap[actionType];
    const payload: WithId<T>[] = [];

    current[actionType] = current[actionType] || {
      actionName,
      payload,
    };

    current[actionType].payload.push(documentChange.payload);

    return current;
  }, {}));
});
