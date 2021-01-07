import { WithId } from './with-id.model';

export type StoreAction<T> = { action: string, payload?: WithId<T>[] };
