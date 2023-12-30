import { QueryDocumentSnapshot } from '@angular/fire/firestore';

/**
 * Map a firestore document action to NGRX action payload
 */
export const mapToActionPayload = <T>(documentAction: QueryDocumentSnapshot<T>) => {
  return {
    id: documentAction.id,
    ...documentAction.data(),
  };
};
