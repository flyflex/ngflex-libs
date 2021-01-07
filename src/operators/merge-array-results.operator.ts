import { map } from 'rxjs/operators';

/**
 * Merge array of result array into a single first level array
 */
export const mergeArrayResults = <T>() => map((results: T[][]) => results.reduce((res, current) => [...res, ...current], []));
