import { DocumentChangeAction } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

import { of, combineLatest } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

/**
 * Replace firebase storage document URL in firestore data
 */
export const fetchFirebaseStorageDocument = <T>(documentKeys: (keyof T)[], firestorage?: AngularFireStorage) =>
  switchMap((changes: DocumentChangeAction<T>[]) => !changes.length ? of([]) : combineLatest(
    changes.map((documentChange: DocumentChangeAction<T>) => of(documentChange).pipe(
      switchMap((change: DocumentChangeAction<T>) => {
        const id: string = change.payload.doc.id;
        const data: T = change.payload.doc.data();

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
            const path: string = data[docKey] as unknown as string || null;

            const defaultData = { [docKey]: path };

            return path
              ? firestorage.ref(path).getDownloadURL().pipe(
                take(1),
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
