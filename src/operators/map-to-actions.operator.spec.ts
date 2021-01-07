import { of } from 'rxjs';

import { JestUtils } from '../tests/jest-utils';
import { mapToActions } from './map-to-actions.operator';
import { ActionTypes } from '../models/action-types.model';

class AddEntities {
  public type = 'addEntities';
  constructor(public payload: any, public parentId?: string) { }
}
class UpdateEntities {
  public type = 'updateEntities';
  constructor(public payload: any, public parentId?: string) { }
}
class RemoveEntities {
  public type = 'removeEntities';
  constructor(public payload: any, public parentId?: string) { }
}
class LoadNoResultsEntities {
  public type = 'loadNoResultsEntities';
  constructor(public parentId?: string) { }
}

const actionsMocks: ActionTypes = {
  loadNoResults: LoadNoResultsEntities,
  addMany: AddEntities,
  upsertMany: UpdateEntities,
  removeMany: RemoveEntities,
};

const action1 = { type: 'added', payload: { id: 'id1', data: 'value1' } };
const action2 = { type: 'added', payload: { id: 'id2', data: 'value2' } };
const action3 = { type: 'removed', payload: { id: 'id3', data: 'value3' } };
const action4 = { type: 'modified', payload: { id: 'id2', data: 'changedValue2' } };
const GROUPED_ACTIONS = [
  {
    action: 'addMany',
    payload: [action1.payload, action2.payload],
  },
  {
    action: 'removeMany',
    payload: [action3.payload],
  },
  {
    action: 'upsertMany',
    payload: [action4.payload],
  },
];

const PARENT_ID = 'someParentId1';

describe('mapToActions', () => {
  let spy;

  beforeEach(() => {
    spy = jest.fn();
  });

  describe('when mapping loadNoResults action', () => {
    describe('when including an existing parent ID through params', () => {
      it('should return the loadNoResults with matching parent id', () => {
        const firebaseActions = [{ action: 'loadNoResults' }];

        of(firebaseActions).pipe(
          mapToActions(
            actionsMocks,
            PARENT_ID,
            false,
            null,
            true,
          ),
        ).subscribe(spy);

        expect(spy).lastCalledWith(new LoadNoResultsEntities(PARENT_ID));
      });
    });

    describe('when there is no parent id', () => {
      it('should return the loadNoResults without any parent id', () => {
        const firebaseActions = [{ action: 'loadNoResults' }];

        of(firebaseActions).pipe(
          mapToActions(
            actionsMocks,
            null,
            false,
            null,
            true,
          ),
        ).subscribe(spy);

        expect(spy).lastCalledWith(new LoadNoResultsEntities());
      });
    });

    describe('when the option to include parent ID is set to false', () => {
      it('should return the loadNoResults with matching parent id', () => {
        const firebaseActions = [{ action: 'loadNoResults' }];

        of(firebaseActions).pipe(
          mapToActions(
            actionsMocks,
            PARENT_ID,
            false,
            null,
            false,
          ),
        ).subscribe(spy);

        expect(spy).lastCalledWith(new LoadNoResultsEntities());
      });
    });

    describe('with no parent id', () => {
      it('should return the loadNoResults without parent id', () => {
        const firebaseActions = [{ action: 'loadNoResults' }];

        of(firebaseActions).pipe(
          mapToActions(actionsMocks)
        ).subscribe(spy);

        expect(spy).lastCalledWith(new LoadNoResultsEntities());
      });
    });
  });

  describe('when mapping standard actions', () => {
    describe('by default', () => {
      describe('with parent Id', () => {
        it('should return actions with proper payload and parent id', () => {
          const callsArgs = JestUtils.getCallsSingleArgs(
            new AddEntities([action1.payload, action2.payload], PARENT_ID),
            new RemoveEntities([action3.payload], PARENT_ID),
            new UpdateEntities([action4.payload], PARENT_ID),
          );

          of(GROUPED_ACTIONS).pipe(
            mapToActions(
              actionsMocks,
              PARENT_ID,
            ),
          ).subscribe(spy);

          expect(spy.mock.calls).toEqual(callsArgs);
        });
      });

      describe('with no parent id', () => {
        it('should return actions with proper payload and empty parent id', () => {
          const callsArgs = JestUtils.getCallsSingleArgs(
            new AddEntities([action1.payload, action2.payload]),
            new RemoveEntities([action3.payload]),
            new UpdateEntities([action4.payload]),
          );

          of(GROUPED_ACTIONS).pipe(
            mapToActions(
              actionsMocks,
            ),
          ).subscribe(spy);

          expect(spy.mock.calls).toEqual(callsArgs);
        });
      });
    });

    describe('with option to include parent id in payload', () => {
      describe('when a parent id payload key is set in option', () => {
        it('should return actions with payload and parent id as given key value', () => {
          const parentKey = 'parentKey';
          const callsArgs = JestUtils.getCallsSingleArgs(
            new AddEntities([
              {...action1.payload, [parentKey]: PARENT_ID },
              {...action2.payload, [parentKey]: PARENT_ID },
             ], PARENT_ID),
            new RemoveEntities([
              {...action3.payload, [parentKey]: PARENT_ID }
            ], PARENT_ID),
            new UpdateEntities([
              {...action4.payload, [parentKey]: PARENT_ID }
            ], PARENT_ID),
          );

          of(GROUPED_ACTIONS).pipe(
            mapToActions(
              actionsMocks,
              PARENT_ID,
              true,
              parentKey,
            ),
          ).subscribe(spy);

          expect(spy.mock.calls).toEqual(callsArgs);
        });
      });

      describe('when no parent id payload key is not given in options', () => {
        it('should return actions with payload but no parent id', () => {
          const callsArgs = JestUtils.getCallsSingleArgs(
            new AddEntities([action1.payload, action2.payload], PARENT_ID),
            new RemoveEntities([action3.payload], PARENT_ID),
            new UpdateEntities([action4.payload], PARENT_ID),
          );

          of(GROUPED_ACTIONS).pipe(
            mapToActions(
              actionsMocks,
              PARENT_ID,
              true,
            ),
          ).subscribe(spy);

          expect(spy.mock.calls).toEqual(callsArgs);
        });
      });
    });
  });
});
