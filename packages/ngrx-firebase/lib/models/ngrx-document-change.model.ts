import { DocumentChangeType } from '@angular/fire/firestore';

import { WithId } from './with-id.model';

export type NgrxDocumentChange<T> = {
  type: DocumentChangeType;
  payload: WithId<T>;
};
