import { ActionCreator } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';

export type ActionCreatorWithParentIdPropAndPayloadProp = ActionCreator<string, (props: {
  [propKey: string]: any;
}) => (TypedAction<string> & any)>;

export type ActionCreatorWithParentIdProp = ActionCreator<string, (props: {
  [parentIdProp: string]: string;
}) => (TypedAction<string> & any)>;

export type ActionCreatorWithNoProp = ActionCreator<string>;

export type ActionCreatorType = ActionCreatorWithNoProp | ActionCreatorWithParentIdProp | ActionCreatorWithParentIdPropAndPayloadProp;

export type ActionTypes = {
  load?: ActionCreatorType,
  loadNoResults?: ActionCreatorType,
  loadFail?: ActionCreatorType,
  addMany?: ActionCreatorType,
  upsertMany?: ActionCreatorType,
  removeMany?: ActionCreatorType,
};
