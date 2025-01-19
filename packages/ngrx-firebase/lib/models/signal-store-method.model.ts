import { WithId } from './with-id.model';

export type SignalStoreMethod<T> = { methodName: string, payload?: { payload?: WithId<T>[] } };
