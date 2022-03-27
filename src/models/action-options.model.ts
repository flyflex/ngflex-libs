import { AngularFireStorage } from '@angular/fire/compat/storage';

import { ActionTypes } from './action-types.model';

export interface ActionOptions<T> {
  angularFireStorage: AngularFireStorage;
  documentKeys: (keyof T)[];
  actionTypes: ActionTypes;
  parentId: string;
  includeParentIdInPayload: boolean;
  parentIdPayloadKey: string;
  includeParentIdInNoResults: boolean;
  useNgrxClassSyntax: boolean;
  ngrxActionParentIdProp: string;
  ngrxActionPayloadProp: string;
}
