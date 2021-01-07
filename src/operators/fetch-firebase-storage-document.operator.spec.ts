import { of } from 'rxjs';

import { ActionTypes } from '../models/action-types.model';
import { fetchFirebaseStorageDocument } from './fetch-firebase-storage-document.operator';

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

const FirestorageMock = {
  ref: (path) => ({
    getDownloadURL: () => of('urlForPath:' + path)
  }),
} as any;

describe('fetchFirebaseStorageDocument', () => {
  let spy;

  beforeEach(() => {
    spy = jest.fn();
  });

  describe('when there are no changes coming from stream', () => {
    it('should return an empty array', () => {
      of([]).pipe(
        fetchFirebaseStorageDocument(['image', 'document']),
      ).subscribe(spy);

      expect(spy).lastCalledWith([]);
    });
  });

  describe('when there are changes in the stream', () => {
    describe('with no document keys', () => {
      it('should return an action with doc id and data matching the changes type', () => {
        const change1 = {
          type: 'added',
          payload: { doc: { id: 'id1', data: () => ({ some: 'value1' }) } } };
        const change2 = { type: 'removed', payload: { doc: { id: 'id2', data: () => ({ some: 'value2' }) } } };

        of([change1, change2]).pipe(
          fetchFirebaseStorageDocument([] as any, FirestorageMock),
        ).subscribe(spy);

        expect(spy).lastCalledWith([
          { type: change1.type, payload: { id: change1.payload.doc.id, ...change1.payload.doc.data() } },
          { type: change2.type, payload: { id: change2.payload.doc.id, ...change2.payload.doc.data() } },
        ]);
      });
    });

    describe('with document keys but no firestorage', () => {
      it('should return an action with doc id and data matching the changes type', () => {
        const change1 = {
          type: 'added',
          payload: { doc: { id: 'id1', data: () => ({ some: 'value1' }) } } };
        const change2 = { type: 'removed', payload: { doc: { id: 'id2', data: () => ({ some: 'value2' }) } } };

        of([change1, change2]).pipe(
          fetchFirebaseStorageDocument(['image', 'document'] as any,  null),
        ).subscribe(spy);

        expect(spy).lastCalledWith([
          { type: change1.type, payload: { id: change1.payload.doc.id, ...change1.payload.doc.data() } },
          { type: change2.type, payload: { id: change2.payload.doc.id, ...change2.payload.doc.data() } },
        ]);
      });
    });

    describe('with both document keys and firestorage', () => {
      it('should retrieve document url when a path is found', () => {
        const change1 = {
          type: 'added',
          payload: { doc: {
            id: 'id1',
          data: () => ({
            some: 'value1',
            image: 'imgPath1',
          }),
        } } };
        const change2 = { type: 'removed', payload: { doc: {
          id: 'id2',
          data: () => ({
            some: 'value2',
            image: 'imgPath2',
            document: 'documentPath2',
          }),
        } } };

        of([change1, change2]).pipe(
          fetchFirebaseStorageDocument(['image', 'document'] as any,  FirestorageMock),
        ).subscribe(spy);

        expect(spy).lastCalledWith([
          {
            type: change1.type,
            payload: {
              id: change1.payload.doc.id,
              ...change1.payload.doc.data(),
              image: 'urlForPath:' + change1.payload.doc.data().image,
              document: null,
            }
          },
          {
            type: change2.type,
            payload: {
              id: change2.payload.doc.id,
              ...change2.payload.doc.data(),
              image: 'urlForPath:' + change2.payload.doc.data().image,
              document: 'urlForPath:' + change2.payload.doc.data().document,
            }
          },
        ]);
      });
    });
  });
});
