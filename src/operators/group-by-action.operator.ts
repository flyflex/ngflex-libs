import { map } from 'rxjs/operators';

import { actionMap } from '../models/action-map.model';
import { DocumentChange } from '../models/document-change.model';
import { StoreAction } from '../models/store-action.model';
import { WithId } from '../models/with-id.model';

/**
 * Group DocumentChangeAction by action type compatible with ngrx entity actions
 */
export const groupByAction = <T>() => map((documentChanges: DocumentChange<T>[]): StoreAction<T>[] => {
  if (!documentChanges.length) {
    return [{ action: 'loadNoResults' }];
  }

  return Object.values(documentChanges.reduce((current: { [type: string]: StoreAction<T> }, documentChange: DocumentChange<T>) => {
    const actionType: string = documentChange.type;
    const action: string = actionMap[actionType];
    const payload: WithId<T>[] = [];

    current[actionType] = current[actionType] || {
      action,
      payload,
    };

    current[actionType].payload.push(documentChange.payload);

    return current;
  }, {}));
});
