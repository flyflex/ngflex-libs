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

class AddEntitiesClass {
  public type = 'addEntities';
  constructor(public payload: any, public parentId?: string) { }
}
class UpdateEntitiesClass {
  public type = 'updateEntities';
  constructor(public payload: any, public parentId?: string) { }
}
class RemoveEntitiesClass {
  public type = 'removeEntities';
  constructor(public payload: any, public parentId?: string) { }
}
class LoadNoResultsEntitiesClass {
  public type = 'loadNoResultsEntities';
  constructor(public parentId?: string) { }
}

const actionsMocksClasses: ActionTypes = {
  loadNoResults: LoadNoResultsEntitiesClass,
  addMany: AddEntitiesClass,
  upsertMany: UpdateEntitiesClass,
  removeMany: RemoveEntitiesClass,
};

const actionsMocksCreators: ActionTypes = {
  loadNoResults: loadNoResultsMock,
  addMany: entityAddMock,
  upsertMany: entityUpdateMock,
  removeMany: entityRemoveMock,
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

  describe(`using classes NGRX syntax`, () => {
    describe('when mapping loadNoResults action', () => {
      describe('when including an existing parent ID through params', () => {
        it('should return the loadNoResults with matching parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToActions(
              actionsMocksClasses,
              {
                parentId: PARENT_ID,
                includeParentIdInPayload: false,
                parentIdPayloadKey: null,
                includeParentIdInNoResults: true,
              }
            ),
          ).subscribe(spy);

          expect(spy).lastCalledWith(new LoadNoResultsEntitiesClass(PARENT_ID));
        });
      });

      describe('when there is no parent id', () => {
        it('should return the loadNoResults without any parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToActions(
              actionsMocksClasses,
              {
                parentId: null,
                includeParentIdInPayload: false,
                parentIdPayloadKey: null,
                includeParentIdInNoResults: true,
              }
            ),
          ).subscribe(spy);

          expect(spy).lastCalledWith(new LoadNoResultsEntitiesClass());
        });
      });

      describe('when the option to include parent ID is set to false', () => {
        it('should return the loadNoResults with matching parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToActions(
              actionsMocksClasses,
              {
                parentId: PARENT_ID,
                includeParentIdInPayload: false,
                parentIdPayloadKey: null,
                includeParentIdInNoResults: false,
              }
            ),
          ).subscribe(spy);

          expect(spy).lastCalledWith(new LoadNoResultsEntitiesClass());
        });
      });

      describe('with no parent id', () => {
        it('should return the loadNoResults without parent id', () => {
          const firebaseActions = [{ actionName: 'loadNoResults' }];

          of(firebaseActions).pipe(
            mapToActions(actionsMocksClasses)
          ).subscribe(spy);

          expect(spy).lastCalledWith(new LoadNoResultsEntitiesClass());
        });
      });
    });

    describe('when mapping standard actions', () => {
      describe('by default', () => {
        describe('with parent Id', () => {
          it('should return actions with proper payload and parent id', () => {
            const callsArgs = JestUtils.getCallsSingleArgs(
              new AddEntitiesClass([action1.payload, action2.payload], PARENT_ID),
              new RemoveEntitiesClass([action3.payload], PARENT_ID),
              new UpdateEntitiesClass([action4.payload], PARENT_ID),
            );

            of(GROUPED_ACTIONS).pipe(
              mapToActions(
                actionsMocksClasses,
                {
                  parentId: PARENT_ID,
                }
              ),
            ).subscribe(spy);

            expect(spy.mock.calls).toEqual(callsArgs);
          });
        });

        describe('with no parent id', () => {
          it('should return actions with proper payload and empty parent id', () => {
            const callsArgs = JestUtils.getCallsSingleArgs(
              new AddEntitiesClass([action1.payload, action2.payload]),
              new RemoveEntitiesClass([action3.payload]),
              new UpdateEntitiesClass([action4.payload]),
            );

            of(GROUPED_ACTIONS).pipe(
              mapToActions(
                actionsMocksClasses,
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
              new AddEntitiesClass([
                {...action1.payload, [parentKey]: PARENT_ID },
                {...action2.payload, [parentKey]: PARENT_ID },
               ], PARENT_ID),
              new RemoveEntitiesClass([
                {...action3.payload, [parentKey]: PARENT_ID }
              ], PARENT_ID),
              new UpdateEntitiesClass([
                {...action4.payload, [parentKey]: PARENT_ID }
              ], PARENT_ID),
            );

            of(GROUPED_ACTIONS).pipe(
              mapToActions(
                actionsMocksClasses,
                {
                  parentId: PARENT_ID,
                  includeParentIdInPayload: true,
                  parentIdPayloadKey: parentKey,
                }
              ),
            ).subscribe(spy);

            expect(spy.mock.calls).toEqual(callsArgs);
          });
        });

        describe('when no parent id payload key is not given in options', () => {
          it('should return actions with payload but no parent id', () => {
            const callsArgs = JestUtils.getCallsSingleArgs(
              new AddEntitiesClass([action1.payload, action2.payload], PARENT_ID),
              new RemoveEntitiesClass([action3.payload], PARENT_ID),
              new UpdateEntitiesClass([action4.payload], PARENT_ID),
            );

            of(GROUPED_ACTIONS).pipe(
              mapToActions(
                actionsMocksClasses,
                {
                  parentId: PARENT_ID,
                  includeParentIdInPayload: true,
                }
              ),
            ).subscribe(spy);

            expect(spy.mock.calls).toEqual(callsArgs);
          });
        });
      });
    });
  });

  describe(`when using action creators from NGRX`, () => {
    describe('when mapping loadNoResults action', () => {
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
                useNgrxActionCreators: true,
                ngrxActionParentIdProp: 'parentId',
                ngrxActionPayloadProp: 'payloadProp',
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
                useNgrxActionCreators: true,
                ngrxActionParentIdProp: 'parentId2',
                ngrxActionPayloadProp: 'payloadProp'
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
                useNgrxActionCreators: true,
                ngrxActionParentIdProp: 'parentId',
                ngrxActionPayloadProp: 'payloadProp',
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
                useNgrxActionCreators: true,
                ngrxActionParentIdProp: 'parentIdKey',
                ngrxActionPayloadProp: 'payloadProp',
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
                  useNgrxActionCreators: true,
                  ngrxActionParentIdProp: 'parentIdKey',
                  ngrxActionPayloadProp: 'payloadProp',
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
                  useNgrxActionCreators: true,
                  ngrxActionParentIdProp: 'parentIdKey',
                  ngrxActionPayloadProp: 'payloadProp',
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
                  useNgrxActionCreators: true,
                  ngrxActionParentIdProp: 'parentIdKey',
                  ngrxActionPayloadProp: 'payloadProp',
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
                  useNgrxActionCreators: true,
                  ngrxActionParentIdProp: 'parentIdKey',
                  ngrxActionPayloadProp: 'payloadProp',
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
