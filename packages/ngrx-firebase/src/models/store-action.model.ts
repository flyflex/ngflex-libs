import { WithId } from './with-id.model';

export type StoreAction<T> = { actionName: string, payload?: WithId<T>[] };
