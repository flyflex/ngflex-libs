import { DocumentChangeAction } from '@angular/fire/compat/firestore';

/**
 * Map a firestore document action to NGRX action payload
 */
export const mapToActionPayload = <T>(documentAction: DocumentChangeAction<T>) => {
  return {
    id: documentAction.payload.doc.id,
    ...documentAction.payload.doc.data(),
  };
};
