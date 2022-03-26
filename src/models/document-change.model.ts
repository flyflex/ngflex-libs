import { DocumentChangeType } from '@angular/fire/compat/firestore';

import { WithId } from './with-id.model';

export type DocumentChange<T> = {
  type: DocumentChangeType;
  payload: WithId<T>;
};
