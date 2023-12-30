import { DocumentChange, DocumentData } from '@angular/fire/firestore';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';

import { of, combineLatest, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/**
 * Replace firebase storage document URL in firestore data
 */
export const fetchFirebaseStorageDocument = <T>(documentKeys: (keyof T)[], firestorage?: Storage) =>
  switchMap((changes: DocumentChange<T, DocumentData>[]) => !changes.length ? of([]) : combineLatest(
    changes.map((documentChange: DocumentChange<T, DocumentData>) => of(documentChange).pipe(
      switchMap((change: DocumentChange<T, DocumentData>) => {
        const id: string = change.doc.id;
        const data: T = change.doc.data();

        if (!documentKeys.length || !firestorage) {
          return of({
            type: change.type,
            payload: {
              id,
              ...data,
            }
          });
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
          }))
        );
      }),
      map(val => val),
    ),
    ),
  ));
