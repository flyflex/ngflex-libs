import { of } from 'rxjs';

import { fetchFirebaseStorageDocument } from '../fetch-firebase-storage-document.operator';
import { groupByAction } from '../group-by-action.operator';

import { mapDocumentActionToNgrxAction } from './map-document-action-to-ngrx-action.operator';
import { mapToActions } from './map-to-actions.operator';

jest.mock('./fetch-firebase-storage-document.operator');
jest.mock('./group-by-action.operator');
jest.mock('./map-to-actions.operator');

const actionsMocks = {
  loadNoResults: jest.fn() as any,
  addMany: jest.fn() as any,
  upsertMany: jest.fn() as any,
  removeMany: jest.fn() as any,
};

describe('map firebase document action to ngrx action operator', () => {
  let spy;

  beforeEach(() => {
    spy = jest.fn();


    (fetchFirebaseStorageDocument as jest.Mock).mockReturnValue((jest.fn().mockImplementation(data => data)));
    (groupByAction as jest.Mock).mockReturnValue((jest.fn().mockImplementation(data => data)));
    (mapToActions as jest.Mock).mockReturnValue((jest.fn().mockImplementation(data => data)));
  });

  describe('mapDocumentActionToNgrxAction', () => {
    describe('with no custom options values', () => {
      it('should have default options passed to observable stream operators', () => {
        const observable = of({ some: 'observableData' } as any);

        observable.pipe(
          mapDocumentActionToNgrxAction(actionsMocks),
        ).subscribe(spy);

        expect(spy).toHaveBeenLastCalledWith({ some: 'observableData' });

        expect(fetchFirebaseStorageDocument).toHaveBeenLastCalledWith([], null);
        expect(groupByAction).toHaveBeenCalled();
        expect(mapToActions).toHaveBeenLastCalledWith(actionsMocks, {
          includeParentIdInPayload: false,
          parentIdPayloadKey: null,
          includeParentIdInNoResults: false,
          parentIdProp: 'parentId',
          payloadProp: 'payload',
        });
      });
    });

    describe('with custom options values', () => {
      it('should have these options values passed to observable stream operators', () => {
        const observable = of({ some: 'observableData' } as any);

        observable.pipe(
          mapDocumentActionToNgrxAction(actionsMocks, {
            documentKeys: ['document', 'image'],
            angularFireStorage: { fire: 'storageMock' } as any,
            parentId: 'some parentId',
            includeParentIdInPayload: true,
            parentIdPayloadKey: 'parentKey',
            includeParentIdInNoResults: true,
            parentIdProp: 'parentIdKey',
            payloadProp: 'payloadKey',
          }),
        ).subscribe(spy);

        expect(spy).toHaveBeenLastCalledWith({ some: 'observableData' });

        expect(fetchFirebaseStorageDocument).toHaveBeenLastCalledWith(['document', 'image'], { fire: 'storageMock' });
        expect(groupByAction).toHaveBeenCalled();
        expect(mapToActions).toHaveBeenLastCalledWith(actionsMocks, {
          parentId: 'some parentId',
          includeParentIdInPayload: true,
          parentIdPayloadKey: 'parentKey',
          includeParentIdInNoResults: true,
          parentIdProp: 'parentIdKey',
          payloadProp: 'payloadKey',
        }
        );
      });
    });
  });
});
