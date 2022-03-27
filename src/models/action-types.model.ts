import { ActionCreator } from '@ngrx/store';

export type AnyClass = new (...args: any[]) => any;

export type ActionTypes = {
  load?: ActionCreator<string> | AnyClass,
  loadNoResults?: ActionCreator<string> | AnyClass,
  loadFail?: ActionCreator<string> | AnyClass,
  addMany?: ActionCreator<string> | AnyClass,
  upsertMany?: ActionCreator<string> | AnyClass,
  removeMany?: ActionCreator<string> | AnyClass,
};
