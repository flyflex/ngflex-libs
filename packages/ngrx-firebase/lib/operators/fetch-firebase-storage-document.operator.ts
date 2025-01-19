import { DocumentChange } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref } from '@angular/fire/storage';

import { combineLatest, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NgrxDocumentChange } from '../models';

/**
 * Replace firebase storage document URL in firestore data
 */
export const fetchFirebaseStorageDocument = <T>(documentKeys: (keyof T)[], firestorage?: Storage) =>
  switchMap((changes: DocumentChange<T>[]) => !changes.length
    ? of([] as NgrxDocumentChange<T>[])
    : combineLatest(
      changes.map((documentChange: DocumentChange<T>) =>
        of(documentChange).pipe(
          switchMap((change: DocumentChange<T>) => {
            const id: string = change.doc.id;
            const data: T = change.doc.data();

            if (!documentKeys.length || !firestorage) {
              return of({
                type: change.type,
                payload: {
                  id,
                  ...data,
                }
              } as NgrxDocumentChange<T>);
            }

            return combineLatest([
              ...documentKeys.map((docKey: keyof T) => {
                const path: string | null = data[docKey] as unknown as string || null;

                const defaultData = { [docKey]: path };


                const imageRef = ref(firestorage, path);

                return path
                  ? from(getDownloadURL(imageRef)).pipe(
                    map((url: string) => {
                      return {
                        [docKey]: url,
                      };
                    })
                  )
                  : of(defaultData);
              })
            ]).pipe(
              map(documents => ({
                type: change.type,
                payload: {
                  id,
                  ...data,
                  ...Object.assign({}, ...documents),
                }
              } as NgrxDocumentChange<T>))
            );
          }),
          map(val => val as NgrxDocumentChange<T>),
        ),
      ),
    ));
