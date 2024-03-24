import * as fireStore from '@angular/fire/firestore';
import { NEVER, from, of } from 'rxjs';

import { wrapCollectionChangesToNgrx } from './wrap-collection-changes-to-ngrx.operator';
import { mapDocumentActionToNgrxAction } from './map-document-action-to-ngrx-action.operator';

jest.mock('@angular/fire/firestore', () => ({
  collectionChanges: jest.fn(),
  collectionData: jest.fn(),
}));

jest.mock('./map-document-action-to-ngrx-action.operator', () => ({
  mapDocumentActionToNgrxAction: jest.fn(),
}));

describe('wrapCollectionChangesToNgrx', () => {
  const spy = jest.fn();

  beforeEach(() => {
    (fireStore.collectionData as jest.Mock).mockReset();
    (fireStore.collectionChanges as jest.Mock).mockReset();
    (mapDocumentActionToNgrxAction as jest.Mock).mockReset();
    spy.mockReset();
  });

  describe('when handleEmptyCollections is set to true', () => {
    it('should handle empty collections considering default option value to true', () => {
      const queryMock: any = {};
      const actions = {
        loadNoResults: jest.fn().mockReturnValue({ type: 'noResults' }).mockName('loadNoResults'),
      } as any;
      const ngrxOptions = { otherOption: 'value' } as any;

      (fireStore.collectionData as jest.Mock).mockReturnValue(of([]));
      (fireStore.collectionChanges as jest.Mock).mockReturnValue(NEVER);
      (mapDocumentActionToNgrxAction as jest.Mock).mockImplementation(() => (source) => source);

      wrapCollectionChangesToNgrx(queryMock, actions, ngrxOptions).subscribe(spy);

      expect(actions.loadNoResults).toHaveBeenCalled();
      expect(actions.loadNoResults).toHaveBeenCalledTimes(1);
      expect((mapDocumentActionToNgrxAction as jest.Mock)).toHaveBeenCalledWith(actions, ngrxOptions);

    });

    it('should handle empty collections', () => {
      const queryMock: any = {};
      const actions = {
        loadNoResults: jest.fn().mockReturnValue({ type: 'noResults' }).mockName('loadNoResults'),
      } as any;
      const ngrxOptions = { otherOption: 'value' };
      const mappingOptions = { handleEmptyCollections: true, ...ngrxOptions };

      (fireStore.collectionData as jest.Mock).mockReturnValue(of([]));
      (fireStore.collectionChanges as jest.Mock).mockReturnValue(of([]));
      (mapDocumentActionToNgrxAction as jest.Mock).mockImplementation(() => (source) => source);

      wrapCollectionChangesToNgrx(queryMock, actions, mappingOptions).subscribe(spy);

      expect(actions.loadNoResults).toHaveBeenCalled();
      expect(actions.loadNoResults).toHaveBeenCalledTimes(1);
      expect((mapDocumentActionToNgrxAction as jest.Mock)).toHaveBeenCalledWith(actions, ngrxOptions);
    });

    it('should handle non-empty collections', () => {
      const queryMock: any = {};
      const actions = {
        loadNoResults: jest.fn().mockReturnValue({ type: 'noResults' }).mockName('loadNoResults'),
      } as any;
      const ngrxOptions = { otherOption: 'value' };
      const mappingOptions = { handleEmptyCollections: true, ...ngrxOptions };

      const mockCollectionData = [{ id: 'doc1', data: 'sampleData' }];
      const mockCollectionChange = { type: 'added', payload: mockCollectionData };
      (fireStore.collectionData as jest.Mock).mockReturnValue(of(mockCollectionData));
      (fireStore.collectionChanges as jest.Mock).mockReturnValue(of(mockCollectionChange));
      (mapDocumentActionToNgrxAction as jest.Mock).mockImplementation(() => (source) => source);

      wrapCollectionChangesToNgrx(queryMock, actions, mappingOptions).subscribe(spy);

      expect(actions.loadNoResults).not.toHaveBeenCalled();
      expect((mapDocumentActionToNgrxAction as jest.Mock)).toHaveBeenCalledWith(actions, ngrxOptions);
      expect(spy).toHaveBeenLastCalledWith(mockCollectionChange);
    });

    describe('when no "loadNoResults" action is defined', () => {
      it('should directly process collection changes', () => {
        const queryMock: any = {}; // Mock Query
        const actions = {
          create: jest.fn().mockReturnValue({ type: 'create', payload: { any: 'data ' } }).mockName('createAction'),
        } as any;
        const mappingOptions = { handleEmptyCollections: true };

        const mockCollectionData = [{ id: 'doc1', data: 'sampleData' }];
        const mockCollectionChange = { type: 'added', payload: mockCollectionData };

        (fireStore.collectionChanges as jest.Mock).mockReturnValue(of(mockCollectionChange));
        (mapDocumentActionToNgrxAction as jest.Mock).mockImplementation(() => (source) => source);

        wrapCollectionChangesToNgrx(queryMock, actions, mappingOptions).subscribe(spy);

        expect(spy).toHaveBeenLastCalledWith(mockCollectionChange);
        expect(fireStore.collectionData).not.toHaveBeenCalled();
      });
    });
  });

  describe('when handleEmptyCollections is set to false', () => {
    it('should directly process collection changes', () => {
      const queryMock: any = {}; // Mock Query
      const actions = {
        create: jest.fn().mockName('createAction')
      } as any;
      const mappingOptions = { handleEmptyCollections: false };

      const mockCollectionData = [{ id: 'doc1', data: 'sampleData' }];
      const mockCollectionChange = { type: 'added', payload: mockCollectionData };
      const mockCollectionChange2 = { type: 'updated', payload: mockCollectionData };

      (fireStore.collectionChanges as jest.Mock).mockReturnValue(from([mockCollectionChange, mockCollectionChange2]));
      (mapDocumentActionToNgrxAction as jest.Mock).mockImplementation(() => (source) => source);

      wrapCollectionChangesToNgrx(queryMock, actions, mappingOptions).subscribe(spy);

      expect(spy).toHaveBeenCalledWith(mockCollectionChange);
      expect(spy).toHaveBeenLastCalledWith(mockCollectionChange2);
      expect(fireStore.collectionData).not.toHaveBeenCalled();
    });
  });
});
