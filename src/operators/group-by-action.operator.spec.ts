import { DocumentChangeType } from '@angular/fire/compat/firestore';
import { of } from 'rxjs';

import { groupByAction } from './group-by-action.operator';

const action1 = { type: 'added' as DocumentChangeType, payload: { id: 'id1', data: 'value1' } };
const action2 = { type: 'added' as DocumentChangeType, payload: { id: 'id2', data: 'value2' } };
const action3 = { type: 'removed' as DocumentChangeType, payload: { id: 'id3', data: 'value3' } };
const action4 = { type: 'modified' as DocumentChangeType, payload: { id: 'id2', data: 'changedValue2' } };
const GROUPED_ACTIONS = [
  {
    actionName: 'addMany',
    payload: [action1.payload, action2.payload],
  },
  {
    actionName: 'removeMany',
    payload: [action3.payload],
  },
  {
    actionName: 'upsertMany',
    payload: [action4.payload],
  },
];

describe('groupByAction', () => {
  let spy;

  beforeEach(() => {
    spy = jest.fn();
  });

  describe('when there are no actions', () => {
    it('should return an array containing only a "loadNoResults" action', () => {
      const observable = of([]);
      observable.pipe(
        groupByAction<any>()
      ).subscribe(spy);

      expect(spy).lastCalledWith([{ actionName: 'loadNoResults' }]);
    });
  });

  describe('when there are actions', () => {
    it('should return an array containing the actions grouped by similar types', () => {
      type entityType = { data: string };

      const observable = of([
        action1,
        action2,
        action3,
        action4,
      ]);
      observable.pipe(
        groupByAction<entityType>()
      ).subscribe(spy);

      expect(spy).lastCalledWith(GROUPED_ACTIONS);
    });
  });
});
