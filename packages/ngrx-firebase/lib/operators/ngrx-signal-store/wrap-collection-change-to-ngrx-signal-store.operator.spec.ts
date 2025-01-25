import * as fireStore from '@angular/fire/firestore';
import { NEVER, from, of } from 'rxjs';

import { mapDocumentActionToNgrxSignalStoreMethod } from './map-document-action-to-ngrx-signal-store-method.operator';
import { wrapCollectionChangesToNgrxSignalStore } from './wrap-collection-change-to-ngrx-signal-store.operator';

jest.mock('@angular/fire/firestore', () => ({
  collectionChanges: jest.fn(),
  collectionData: jest.fn(),
}));

jest.mock('./map-document-action-to-ngrx-signal-store-method.operator', () => ({
  mapDocumentActionToNgrxSignalStoreMethod: jest.fn(),
}));

describe('wrapCollectionChangesToNgrxSignalStore', () => {
  const spy = jest.fn();

  beforeEach(() => {
    (fireStore.collectionData as jest.Mock).mockReset();
    (fireStore.collectionChanges as jest.Mock).mockReset();
    (mapDocumentActionToNgrxSignalStoreMethod as jest.Mock).mockReset();
    spy.mockReset();
  });

  describe('when handleEmptyCollections is set to true', () => {
    it('should handle empty collections considering default option value to true', () => {
      const queryMock: any = {};
      const methodsMap = {
        loadNoResults: 'loadNoResults',
      } as any;
      const ngrxOptions = { otherOption: 'value' } as any;

      (fireStore.collectionData as jest.Mock).mockReturnValue(of([]));
      (fireStore.collectionChanges as jest.Mock).mockReturnValue(NEVER);
      (mapDocumentActionToNgrxSignalStoreMethod as jest.Mock).mockImplementation(() => (source) => source);

      wrapCollectionChangesToNgrxSignalStore(queryMock, methodsMap, ngrxOptions).subscribe(spy);

      expect(spy).toHaveBeenCalledWith({ methodName: 'loadNoResults' });
      expect((mapDocumentActionToNgrxSignalStoreMethod as jest.Mock)).toHaveBeenCalledWith(methodsMap, ngrxOptions);

    });

    it('should include parentId in noresult action when required', () => {
      const queryMock: any = {};
      const methodsMap = {
        loadNoResults: 'loadNoResults',
      } as any;
      const ngrxOptions = {
        otherOption: 'value',
        includeParentIdInNoResults: true,
        parentId: 'parentId',
        parentIdProp: 'someParent',
      } as any;

      (fireStore.collectionData as jest.Mock).mockReturnValue(of([]));
      (fireStore.collectionChanges as jest.Mock).mockReturnValue(NEVER);
      (mapDocumentActionToNgrxSignalStoreMethod as jest.Mock).mockImplementation(() => (source) => source);

      wrapCollectionChangesToNgrxSignalStore(queryMock, methodsMap, ngrxOptions).subscribe(spy);

      expect(spy).toHaveBeenCalledWith({ methodName: 'loadNoResults', payload: { someParent: 'parentId' } });
      expect((mapDocumentActionToNgrxSignalStoreMethod as jest.Mock)).toHaveBeenCalledWith(methodsMap, ngrxOptions);

    });

    it('should handle empty collections', () => {
      const queryMock: any = {};
      const methodsMap = {
        loadNoResults: 'loadNoResults',
      } as any;
      const ngrxOptions = { otherOption: 'value' };
      const mappingOptions = { handleEmptyCollections: true, ...ngrxOptions };

      (fireStore.collectionData as jest.Mock).mockReturnValue(of([]));
      (fireStore.collectionChanges as jest.Mock).mockReturnValue(of([]));
      (mapDocumentActionToNgrxSignalStoreMethod as jest.Mock).mockImplementation(() => (source) => source);

      wrapCollectionChangesToNgrxSignalStore(queryMock, methodsMap, mappingOptions).subscribe(spy);

      expect(spy).toHaveBeenCalledWith({ methodName: 'loadNoResults' });
      expect((mapDocumentActionToNgrxSignalStoreMethod as jest.Mock)).toHaveBeenCalledWith(methodsMap, ngrxOptions);
    });

    it('should handle non-empty collections', () => {
      const queryMock: any = {};
      const methodsMap = {
        loadNoResults: 'loadNoResults',
      } as any;
      const ngrxOptions = { otherOption: 'value' };
      const mappingOptions = { handleEmptyCollections: true, ...ngrxOptions };

      const mockCollectionData = [{ id: 'doc1', data: 'sampleData' }];
      const mockCollectionChange = { type: 'added', payload: mockCollectionData };
      (fireStore.collectionData as jest.Mock).mockReturnValue(of(mockCollectionData));
      (fireStore.collectionChanges as jest.Mock).mockReturnValue(of(mockCollectionChange));
      (mapDocumentActionToNgrxSignalStoreMethod as jest.Mock).mockImplementation(() => (source) => source);

      wrapCollectionChangesToNgrxSignalStore(queryMock, methodsMap, mappingOptions).subscribe(spy);

      expect(spy).not.toHaveBeenCalledWith({ methodName: 'loadNoResults' });
      expect((mapDocumentActionToNgrxSignalStoreMethod as jest.Mock)).toHaveBeenCalledWith(methodsMap, ngrxOptions);
      expect(spy).toHaveBeenLastCalledWith(mockCollectionChange);
    });

    describe('when no "loadNoResults" action is defined', () => {
      it('should directly process collection changes', () => {
        const queryMock: any = {};
        const methodsMap = {
          create: 'createMethod',
        } as any;
        const mappingOptions = { handleEmptyCollections: true };

        const mockCollectionData = [{ id: 'doc1', data: 'sampleData' }];
        const mockCollectionChange = { type: 'added', payload: mockCollectionData };

        (fireStore.collectionChanges as jest.Mock).mockReturnValue(of(mockCollectionChange));
        (mapDocumentActionToNgrxSignalStoreMethod as jest.Mock).mockImplementation(() => (source) => source);

        wrapCollectionChangesToNgrxSignalStore(queryMock, methodsMap, mappingOptions).subscribe(spy);

        expect(spy).toHaveBeenLastCalledWith(mockCollectionChange);
        expect(fireStore.collectionData).not.toHaveBeenCalled();
      });
    });
  });

  describe('when handleEmptyCollections is set to false', () => {
    it('should directly process collection changes', () => {
      const queryMock: any = {};
      const methodsMap = {
        create: 'createMethod',
      } as any;
      const mappingOptions = { handleEmptyCollections: false };

      const mockCollectionData = [{ id: 'doc1', data: 'sampleData' }];
      const mockCollectionChange = { type: 'added', payload: mockCollectionData };
      const mockCollectionChange2 = { type: 'updated', payload: mockCollectionData };

      (fireStore.collectionChanges as jest.Mock).mockReturnValue(from([mockCollectionChange, mockCollectionChange2]));
      (mapDocumentActionToNgrxSignalStoreMethod as jest.Mock).mockImplementation(() => (source) => source);

      wrapCollectionChangesToNgrxSignalStore(queryMock, methodsMap, mappingOptions).subscribe(spy);

      expect(spy).toHaveBeenCalledWith(mockCollectionChange);
      expect(spy).toHaveBeenLastCalledWith(mockCollectionChange2);
      expect(fireStore.collectionData).not.toHaveBeenCalled();
    });
  });
});
