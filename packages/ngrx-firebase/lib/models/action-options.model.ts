import { Storage } from '@angular/fire/storage';

import { ActionTypes } from './action-types.model';

export interface ActionOptions<T> {
  angularFireStorage: Storage;
  documentKeys: (keyof T)[];
  actionTypes: ActionTypes;
  parentId: string;
  includeParentIdInPayload: boolean;
  parentIdPayloadKey: string;
  includeParentIdInNoResults: boolean;
  parentIdProp: string;
  payloadProp: string;
}
