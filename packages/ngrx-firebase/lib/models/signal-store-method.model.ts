import { WithId } from './with-id.model';

export type SignalStoreMethod<T> = {
  methodName: string,
  payload?: {
    [payloadKey: string]: WithId<T>[] | undefined | string
  },
};
