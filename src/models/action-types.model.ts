import { ActionCreator } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';

export type ActionCreatorWithParentIdPropAndPayloadProp = ActionCreator<string, (props: {
  [propKey: string]: any;
}) => (TypedAction<string> & any)>;

export type ActionCreatorWithParentIdProp = ActionCreator<string, (props: {
  [parentIdProp: string]: string;
}) => (TypedAction<string> & any)>;

export type ActionCreatorWithNoProp = ActionCreator<string>;

export type ActionTypes = {
  load?: ActionCreatorWithNoProp | ActionCreatorWithParentIdProp | ActionCreatorWithParentIdPropAndPayloadProp,
  loadNoResults?: ActionCreatorWithNoProp | ActionCreatorWithParentIdProp | ActionCreatorWithParentIdPropAndPayloadProp,
  loadFail?: ActionCreatorWithNoProp | ActionCreatorWithParentIdProp | ActionCreatorWithParentIdPropAndPayloadProp,
  addMany?: ActionCreatorWithNoProp | ActionCreatorWithParentIdProp | ActionCreatorWithParentIdPropAndPayloadProp,
  upsertMany?: ActionCreatorWithNoProp | ActionCreatorWithParentIdProp | ActionCreatorWithParentIdPropAndPayloadProp,
  removeMany?: ActionCreatorWithNoProp | ActionCreatorWithParentIdProp | ActionCreatorWithParentIdPropAndPayloadProp,
};
