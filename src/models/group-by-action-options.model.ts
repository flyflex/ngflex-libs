import { AngularFireStorage } from '@angular/fire/storage';

import { ActionTypes } from './action-types.model';

export interface GroupByActionOptions<T> {
  angularFireStorage: AngularFireStorage;
  documentKeys: (keyof T)[];
  actionTypes: ActionTypes;
  parentId: string;
  includeParentIdInPayload: boolean;
  parentIdPayloadKey: string;
  includeParentIdInNoResults: boolean;
}
