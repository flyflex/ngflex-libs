import { of } from 'rxjs';

import { SignalStoreMethodsMap } from '../../models/action-types.model';
import { JestUtils } from '../../tests/jest-utils';
import { mapToSignalStoreMethod } from './map-to-signal-store-method';

const actionsMocksCreators: SignalStoreMethodsMap = {
  loadNoResults: 'loadNoResultsMock',
  addMany: 'entityAddMock',
  upsertMany: 'entityUpdateMock',
  removeMany: 'entityRemoveMock',
};

const action1 = { type: 'added', payload: { id: 'id1', data: 'value1' } };
const action2 = { type: 'added', payload: { id: 'id2', data: 'value2' } };
const action3 = { type: 'removed', payload: { id: 'id3', data: 'value3' } };
const action4 = { type: 'modified', payload: { id: 'id2', data: 'changedValue2' } };
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

const PARENT_ID = 'someParentId1';

describe('mapToSignalStoreMethod', () => {
  let spy;

  beforeEach(() => {
    spy = jest.fn();
    spy.mockClear();
  });

  describe(`when using signal store method creators from NGRX`, () => {
    describe('when mapping loadNoResults action', () => {
      describe('with no parent id', () => {
        it('should return the loadNoResults without parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToSignalStoreMethod(actionsMocksCreators)
          ).subscribe(spy);

          expect(spy).toHaveBeenLastCalledWith({ methodName: actionsMocksCreators.loadNoResults });
        });
      });

      describe('when including an existing parent ID through params', () => {
        it('should return the loadNoResults with matching parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToSignalStoreMethod(
              actionsMocksCreators,
              {
                parentId: PARENT_ID,
                includeParentIdInPayload: false,
                parentIdPayloadKey: null,
                includeParentIdInNoResults: true,
                parentIdProp: 'parentId',
                payloadProp: 'payloadProp',
              }
            ),
          ).subscribe(spy);

          expect(spy).toHaveBeenLastCalledWith({ methodName: actionsMocksCreators.loadNoResults, payload: { parentId: PARENT_ID } });
        });
      });

      describe('when including an existing parent ID through params', () => {
        it('should return the loadNoResults with matching parent id key', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToSignalStoreMethod(
              actionsMocksCreators,
              {
                parentId: PARENT_ID,
                includeParentIdInPayload: false,
                parentIdPayloadKey: null,
                includeParentIdInNoResults: true,
                parentIdProp: 'parentId2',
                payloadProp: 'payloadProp'
              }
            ),
          ).subscribe(spy);

          expect(spy).toHaveBeenCalledWith({ methodName: actionsMocksCreators.loadNoResults, payload: { parentId2: PARENT_ID } });
        });
      });

      describe('when there is no parent id', () => {
        it('should return the loadNoResults without any parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToSignalStoreMethod(
              actionsMocksCreators,
              {
                parentId: null,
                includeParentIdInPayload: false,
                parentIdPayloadKey: null,
                includeParentIdInNoResults: true,
                parentIdProp: 'parentId',
                payloadProp: 'payloadProp',
              }
            ),
          ).subscribe(spy);

          expect(spy).toHaveBeenLastCalledWith({ methodName: actionsMocksCreators.loadNoResults });
        });
      });

      describe('when the option to include parent ID is set to false', () => {
        it('should return the loadNoResults with forced parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToSignalStoreMethod(
              actionsMocksCreators,
              {
                parentId: PARENT_ID,
                includeParentIdInPayload: false,
                parentIdPayloadKey: null,
                includeParentIdInNoResults: false,
                parentIdProp: 'parentIdKey',
                payloadProp: 'payloadProp',
              }
            ),
          ).subscribe(spy);

          expect(spy).toHaveBeenLastCalledWith({ methodName: actionsMocksCreators.loadNoResults });
        });
      });
    });

    describe('when mapping standard actions', () => {
      describe('by default', () => {
        describe('with parent Id', () => {
          it('should return methods with proper payload and parent id', () => {
            of(GROUPED_ACTIONS).pipe(
              mapToSignalStoreMethod(
                actionsMocksCreators,
                {
                  parentId: PARENT_ID,
                  parentIdProp: 'parentIdKey',
                  payloadProp: 'payloadProp',
                }
              ),
            ).subscribe(spy);

            expect(spy.mock.calls).toMatchSnapshot();
          });
        });

        describe('with no parent id', () => {
          it('should return methods with proper payload and empty parent id', () => {
            of(GROUPED_ACTIONS).pipe(
              mapToSignalStoreMethod(
                actionsMocksCreators,
                {
                  parentIdProp: 'parentIdKey',
                  payloadProp: 'payloadProp',
                }
              ),
            ).subscribe(spy);

            expect(spy.mock.calls).toMatchSnapshot();
          });
        });
      });

      describe('with option to include parent id in payload', () => {
        describe('when a parent id payload key is set in option', () => {
          it('should return methods with payload and parent id as given key value', () => {
            const parentKey = 'parentKey';

            of(GROUPED_ACTIONS).pipe(
              mapToSignalStoreMethod(
                actionsMocksCreators,
                {
                  parentId: PARENT_ID,
                  includeParentIdInPayload: true,
                  parentIdPayloadKey: parentKey,
                  parentIdProp: 'parentIdKey',
                  payloadProp: 'payloadProp',
                }
              ),
            ).subscribe(spy);

            expect(spy.mock.calls).toMatchSnapshot();
          });
        });

        describe('when no parent id payload key is not given in options', () => {
          it('should return methods with payload but no parent id', () => {
            of(GROUPED_ACTIONS).pipe(
              mapToSignalStoreMethod(
                actionsMocksCreators,
                {
                  parentId: PARENT_ID,
                  includeParentIdInPayload: true,
                  parentIdProp: 'parentIdKey',
                  payloadProp: 'payloadProp',
                }
              ),
            ).subscribe(spy);

            expect(spy.mock.calls).toMatchSnapshot();
          });
        });
      });
    });
  });
});
