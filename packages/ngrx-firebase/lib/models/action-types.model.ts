import { ActionCreator } from '@ngrx/store';

export type ActionCreatorWithParentIdPropAndPayloadProp = ActionCreator<string, (props: {
  [propKey: string]: any;
}) => any>;

export type ActionCreatorWithParentIdProp = ActionCreator<string, (props: {
  [parentIdProp: string]: string;
}) => any>;

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
