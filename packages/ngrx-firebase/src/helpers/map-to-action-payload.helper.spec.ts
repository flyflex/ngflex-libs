import { DocumentChangeAction } from '@angular/fire/compat/firestore';

import { mapToActionPayload } from './map-to-action-payload.helper';

describe('mapToActionPayload', () => {
  it('should transform a document change action into an action payload including id and document data', () => {
    const documentAction = {
      payload: {
        doc: {
          id: 'someId',
          data: () => ({
            some: 'data1',
            other: 'data2',
          })
        }
      }
    } as DocumentChangeAction<any>;

    const expectedResult = {
      id: 'someId',
      some: 'data1',
      other: 'data2',
    };

    expect(mapToActionPayload(documentAction)).toEqual(expectedResult);
  });
});
