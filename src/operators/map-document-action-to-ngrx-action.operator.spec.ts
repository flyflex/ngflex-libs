import { of } from 'rxjs';

import { fetchFirebaseStorageDocument } from './fetch-firebase-storage-document.operator';
import { groupByAction } from './group-by-action.operator';
import { mapToActions } from './map-to-actions.operator';
import { mapDocumentActionToNgrxAction } from './map-document-action-to-ngrx-action.operator';

jest.mock('./fetch-firebase-storage-document.operator');
jest.mock('./group-by-action.operator');
jest.mock('./map-to-actions.operator');

const actionsMocks = {
  loadNoResults: jest.fn(),
  addMany: jest.fn(),
  upsertMany: jest.fn(),
  removeMany: jest.fn(),
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

        expect(spy).lastCalledWith({ some: 'observableData' });

        expect(fetchFirebaseStorageDocument).lastCalledWith([], null);
        expect(groupByAction).toHaveBeenCalled();
        expect(mapToActions).lastCalledWith(actionsMocks, {
            includeParentIdInPayload: false,
            parentIdPayloadKey: null,
            includeParentIdInNoResults: false,
            useNgrxClassSyntax: false,
            ngrxActionParentIdProp: 'parentId',
            ngrxActionPayloadProp: 'payload',
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
            useNgrxClassSyntax: true,
            ngrxActionParentIdProp: 'parentIdKey',
            ngrxActionPayloadProp: 'payloadKey',
          }),
        ).subscribe(spy);

        expect(spy).lastCalledWith({ some: 'observableData' });

        expect(fetchFirebaseStorageDocument).lastCalledWith(['document', 'image'], { fire: 'storageMock' });
        expect(groupByAction).toHaveBeenCalled();
        expect(mapToActions).lastCalledWith(actionsMocks, {
            parentId: 'some parentId',
            includeParentIdInPayload: true,
            parentIdPayloadKey: 'parentKey',
            includeParentIdInNoResults: true,
            useNgrxClassSyntax: true,
            ngrxActionParentIdProp: 'parentIdKey',
            ngrxActionPayloadProp: 'payloadKey',
          }
        );
      });
    });
  });
});
