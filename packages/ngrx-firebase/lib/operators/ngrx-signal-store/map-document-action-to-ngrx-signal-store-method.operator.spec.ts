import { of } from 'rxjs';

import { fetchFirebaseStorageDocument } from '../fetch-firebase-storage-document.operator';
import { groupByAction } from '../group-by-action.operator';

import { mapDocumentActionToNgrxSignalStoreMethod } from './map-document-action-to-ngrx-signal-store-method.operator';
import { mapToSignalStoreMethod } from './map-to-signal-store-method';

jest.mock('../fetch-firebase-storage-document.operator');
jest.mock('../group-by-action.operator');
jest.mock('./map-to-signal-store-method');

const methodsMapMock = {
  loadNoResults: 'loadNoResults',
  addMany: 'addManyMethod',
  upsertMany: 'upserManyMethod',
  removeMany: 'removeManyMethod',
};

describe('map firebase document action to ngrx action operator', () => {
  let spy;

  beforeEach(() => {
    spy = jest.fn();


    (fetchFirebaseStorageDocument as jest.Mock).mockReturnValue((jest.fn().mockImplementation(data => data)));
    (groupByAction as jest.Mock).mockReturnValue((jest.fn().mockImplementation(data => data)));
    (mapToSignalStoreMethod as jest.Mock).mockReturnValue((jest.fn().mockImplementation(data => data)));
  });

  describe('mapDocumentActionToNgrxSignalStoreMethod', () => {
    describe('with no custom options values', () => {
      it('should have default options passed to observable stream operators', () => {
        const observable = of({ some: 'observableData' } as any);

        observable.pipe(
          mapDocumentActionToNgrxSignalStoreMethod(methodsMapMock),
        ).subscribe(spy);

        expect(spy).toHaveBeenLastCalledWith({ some: 'observableData' });

        expect(fetchFirebaseStorageDocument).toHaveBeenLastCalledWith([], null);
        expect(groupByAction).toHaveBeenCalled();
        expect(mapToSignalStoreMethod).toHaveBeenLastCalledWith(methodsMapMock, {
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
          mapDocumentActionToNgrxSignalStoreMethod(methodsMapMock, {
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
        expect(mapToSignalStoreMethod).toHaveBeenLastCalledWith(methodsMapMock, {
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
