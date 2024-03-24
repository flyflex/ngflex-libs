import * as fireStore from '@angular/fire/firestore';
import { of } from 'rxjs';

import { wrapCollectionChange } from './wrap-collection-changes.operator';
import { mapDocumentActionToNgrxAction } from './map-document-action-to-ngrx-action.operator';

jest.mock('@angular/fire/firestore', () => ({
  collectionChanges: jest.fn(),
  collectionData: jest.fn(),
}));

jest.mock('./map-document-action-to-ngrx-action.operator', () => ({
  mapDocumentActionToNgrxAction: jest.fn(),
}));

describe('wrapCollectionChange', () => {
  beforeEach(() => {
    (fireStore.collectionData as jest.Mock).mockReset();
    (fireStore.collectionChanges as jest.Mock).mockReset();
    (mapDocumentActionToNgrxAction as jest.Mock).mockReset();
  });

  describe('when handleEmptyCollections is set to true', () => {
    it('should handle empty collections considering default option value to true', (done) => {
      const queryMock: any = {};
      const actions = {
        loadNoResults: jest.fn().mockName('loadNoResults'),
      } as any;
      const ngrxOptions = { otherOption: 'value' } as any;

      (fireStore.collectionData as jest.Mock).mockReturnValue(of([]));
      (fireStore.collectionChanges as jest.Mock).mockReturnValue(of([]));
      (mapDocumentActionToNgrxAction as jest.Mock).mockImplementation(() => () => of([]));

      wrapCollectionChange(queryMock, actions, ngrxOptions).subscribe(() => {
        expect(actions.loadNoResults).toHaveBeenCalled();
        expect((mapDocumentActionToNgrxAction as jest.Mock)).toHaveBeenCalledWith(actions, ngrxOptions);

        done();
      });
    });

    it('should handle empty collections', (done) => {
      const queryMock: any = {};
      const actions = {
        loadNoResults: jest.fn().mockName('loadNoResults'),
      } as any;
      const ngrxOptions = { otherOption: 'value' };
      const mappingOptions = { handleEmptyCollections: true, ...ngrxOptions };

      (fireStore.collectionData as jest.Mock).mockReturnValue(of([]));
      (fireStore.collectionChanges as jest.Mock).mockReturnValue(of([]));
      (mapDocumentActionToNgrxAction as jest.Mock).mockImplementation(() => () => of([]));

      wrapCollectionChange(queryMock, actions, mappingOptions).subscribe(() => {
        expect(actions.loadNoResults).toHaveBeenCalled();
        expect((mapDocumentActionToNgrxAction as jest.Mock)).toHaveBeenCalledWith(actions, ngrxOptions);

        done();
      });
    });

    it('should handle non-empty collections', (done) => {
      const queryMock: any = {};
      const actions = {
        loadNoResults: jest.fn().mockName('loadNoResults'),
      } as any;
      const ngrxOptions = { otherOption: 'value' };
      const mappingOptions = { handleEmptyCollections: true, ...ngrxOptions };

      const mockCollectionData = [{ id: 'doc1', data: 'sampleData' }];
      const mockCollectionChange = { type: 'added', payload: mockCollectionData };
      (fireStore.collectionData as jest.Mock).mockReturnValue(of(mockCollectionData));
      (fireStore.collectionChanges as jest.Mock).mockReturnValue(of(mockCollectionChange));
      (mapDocumentActionToNgrxAction as jest.Mock).mockImplementation(() => (source) => source);

      wrapCollectionChange(queryMock, actions, mappingOptions).subscribe((result) => {
        expect(actions.loadNoResults).not.toHaveBeenCalled();
        expect((mapDocumentActionToNgrxAction as jest.Mock)).toHaveBeenCalledWith(actions, ngrxOptions);
        expect(result).toEqual(mockCollectionChange);

        done();
      });
    });

    describe('when no "loadNoResults" action is defined', () => {
      it('should directly process collection changes', (done) => {
        const queryMock: any = {}; // Mock Query
        const actions = {
          create: jest.fn().mockName('createAction')
        } as any;
        const mappingOptions = { handleEmptyCollections: true };

        const mockCollectionData = [{ id: 'doc1', data: 'sampleData' }];
        const mockCollectionChange = { type: 'added', payload: mockCollectionData };

        (fireStore.collectionChanges as jest.Mock).mockReturnValue(of(mockCollectionChange));
        (mapDocumentActionToNgrxAction as jest.Mock).mockImplementation(() => (source) => source);

        wrapCollectionChange(queryMock, actions, mappingOptions).subscribe((result) => {
          expect(result).toEqual(mockCollectionChange);
          expect(fireStore.collectionData).not.toHaveBeenCalled();

          done();
        });
      });
    });
  });

  describe('when handleEmptyCollections is set to false', () => {
    it('should directly process collection changes', (done) => {
      const queryMock: any = {}; // Mock Query
      const actions = {
        create: jest.fn().mockName('createAction')
      } as any;
      const mappingOptions = { handleEmptyCollections: false };

      const mockCollectionData = [{ id: 'doc1', data: 'sampleData' }];
      const mockCollectionChange = { type: 'added', payload: mockCollectionData };

      (fireStore.collectionChanges as jest.Mock).mockReturnValue(of(mockCollectionChange));
      (mapDocumentActionToNgrxAction as jest.Mock).mockImplementation(() => (source) => source);

      wrapCollectionChange(queryMock, actions, mappingOptions).subscribe((result) => {
        expect(result).toEqual(mockCollectionChange);
        expect(fireStore.collectionData).not.toHaveBeenCalled();

        done();
      });
    });
  });
});
