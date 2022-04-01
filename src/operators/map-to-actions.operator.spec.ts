import { of } from 'rxjs';

import { JestUtils } from '../tests/jest-utils';
import { mapToActions } from './map-to-actions.operator';
import { ActionTypes } from '../models/action-types.model';

const createActionMockAdd = jest.fn();
const createActionMockUpdate = jest.fn();
const createActionMockRemove = jest.fn();
const createActionMockLoadNoResult = jest.fn();

const entityAddMock = jest.fn().mockReturnValue(createActionMockAdd);
const entityUpdateMock = jest.fn().mockReturnValue(createActionMockUpdate);
const entityRemoveMock = jest.fn().mockReturnValue(createActionMockRemove);
const loadNoResultsMock = jest.fn().mockReturnValue(createActionMockLoadNoResult);

const actionsMocksCreators: ActionTypes = {
  loadNoResults: loadNoResultsMock as any,
  addMany: entityAddMock as any,
  upsertMany: entityUpdateMock as any,
  removeMany: entityRemoveMock as any,
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

describe('mapToActions', () => {
  let spy;

  beforeEach(() => {
    spy = jest.fn();
    createActionMockAdd.mockClear();
    createActionMockUpdate.mockClear();
    createActionMockRemove.mockClear();
    createActionMockLoadNoResult.mockClear();
    entityAddMock.mockClear();
    entityUpdateMock.mockClear();
    entityRemoveMock.mockClear();
    loadNoResultsMock.mockClear();
  });

  describe(`when using action creators from NGRX`, () => {
    describe('when mapping loadNoResults action', () => {
      describe('with no parent id', () => {
        it('should return the loadNoResults without parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToActions(actionsMocksCreators)
          ).subscribe(spy);

          expect(spy).lastCalledWith(createActionMockLoadNoResult);
          expect(loadNoResultsMock).toHaveBeenCalledWith();
        });
      });

      describe('when including an existing parent ID through params', () => {
        it('should return the loadNoResults with matching parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToActions(
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

          expect(spy).lastCalledWith(createActionMockLoadNoResult);
          expect(loadNoResultsMock).toHaveBeenCalledWith({ parentId: PARENT_ID });
        });
      });

      describe('when including an existing parent ID through params', () => {
        it('should return the loadNoResults with matching parent id key', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToActions(
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

          expect(spy).lastCalledWith(createActionMockLoadNoResult);
          expect(loadNoResultsMock).toHaveBeenCalledWith({ parentId2: PARENT_ID });
        });
      });

      describe('when there is no parent id', () => {
        it('should return the loadNoResults without any parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToActions(
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

          expect(spy).lastCalledWith(createActionMockLoadNoResult);
          expect(loadNoResultsMock).toHaveBeenCalledWith();
        });
      });

      describe('when the option to include parent ID is set to false', () => {
        it('should return the loadNoResults with forced parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToActions(
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

          expect(spy).lastCalledWith(createActionMockLoadNoResult);
          expect(loadNoResultsMock).toHaveBeenCalledWith();
        });
      });
    });

    describe('when mapping standard actions', () => {
      describe('by default', () => {
        describe('with parent Id', () => {
          it('should return actions with proper payload and parent id', () => {
            const callsArgs = JestUtils.getCallsSingleArgs(
              createActionMockAdd,
              createActionMockRemove,
              createActionMockUpdate,
            );

            of(GROUPED_ACTIONS).pipe(
              mapToActions(
                actionsMocksCreators,
                {
                  parentId: PARENT_ID,
                  parentIdProp: 'parentIdKey',
                  payloadProp: 'payloadProp',
                }
              ),
            ).subscribe(spy);

            expect(spy.mock.calls).toEqual(callsArgs);
            expect(entityAddMock).toHaveBeenCalledWith({
              parentIdKey: PARENT_ID,
              payloadProp: [
                action1.payload,
                action2.payload,
              ],
            });
            expect(entityUpdateMock).toHaveBeenCalledWith({
              parentIdKey: PARENT_ID,
              payloadProp: [
                action4.payload,
              ],
            });
            expect(entityRemoveMock).toHaveBeenCalledWith({
              parentIdKey: PARENT_ID,
              payloadProp: [
                action3.payload,
              ],
            });
          });
        });

        describe('with no parent id', () => {
          it('should return actions with proper payload and empty parent id', () => {
            const callsArgs = JestUtils.getCallsSingleArgs(
              createActionMockAdd,
              createActionMockRemove,
              createActionMockUpdate,
            );

            of(GROUPED_ACTIONS).pipe(
              mapToActions(
                actionsMocksCreators,
                {
                  parentIdProp: 'parentIdKey',
                  payloadProp: 'payloadProp',
                }
              ),
            ).subscribe(spy);

            expect(spy.mock.calls).toEqual(callsArgs);
            expect(entityAddMock).toHaveBeenCalledWith({
              payloadProp: [
                action1.payload,
                action2.payload,
              ],
            });
            expect(entityUpdateMock).toHaveBeenCalledWith({
              payloadProp: [
                action4.payload,
              ],
            });
            expect(entityRemoveMock).toHaveBeenCalledWith({
              payloadProp: [
                action3.payload,
              ],
            });
          });
        });
      });

      describe('with option to include parent id in payload', () => {
        describe('when a parent id payload key is set in option', () => {
          it('should return actions with payload and parent id as given key value', () => {
            const parentKey = 'parentKey';
            const callsArgs = JestUtils.getCallsSingleArgs(
              createActionMockAdd,
              createActionMockRemove,
              createActionMockUpdate,
            );

            of(GROUPED_ACTIONS).pipe(
              mapToActions(
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

            expect(spy.mock.calls).toEqual(callsArgs);
            expect(entityAddMock).toHaveBeenCalledWith({
              parentIdKey: PARENT_ID,
              payloadProp: [
                {
                  ...action1.payload,
                  [parentKey]: PARENT_ID,
                },
                {
                  ...action2.payload,
                  [parentKey]: PARENT_ID,
                }


              ],
            });
            expect(entityUpdateMock).toHaveBeenCalledWith({
              parentIdKey: PARENT_ID,
              payloadProp: [
                {
                  ...action4.payload,
                  [parentKey]: PARENT_ID,
                },
              ],
            });
            expect(entityRemoveMock).toHaveBeenCalledWith({
              parentIdKey: PARENT_ID,
              payloadProp: [
                {
                  ...action3.payload,
                  [parentKey]: PARENT_ID,
                },
              ],
            });
          });
        });

        describe('when no parent id payload key is not given in options', () => {
          it('should return actions with payload but no parent id', () => {
            const callsArgs = JestUtils.getCallsSingleArgs(
              createActionMockAdd,
              createActionMockRemove,
              createActionMockUpdate,
            );

            of(GROUPED_ACTIONS).pipe(
              mapToActions(
                actionsMocksCreators,
                {
                  parentId: PARENT_ID,
                  includeParentIdInPayload: true,
                  parentIdProp: 'parentIdKey',
                  payloadProp: 'payloadProp',
                }
              ),
            ).subscribe(spy);

            expect(spy.mock.calls).toEqual(callsArgs);
            expect(entityAddMock).toHaveBeenCalledWith({
              parentIdKey: PARENT_ID,
              payloadProp: [
                action1.payload,
                action2.payload,
              ],
            });
            expect(entityUpdateMock).toHaveBeenCalledWith({
              parentIdKey: PARENT_ID,
              payloadProp: [
                action4.payload,
              ],
            });
            expect(entityRemoveMock).toHaveBeenCalledWith({
              parentIdKey: PARENT_ID,
              payloadProp: [
                action3.payload,
              ],
            });
          });
        });
      });
    });
  });
});
