import { of } from 'rxjs';

import { mergeArrayResults } from './merge-array-results.operator';

describe('mergeArrayResults', () => {
  let spy;

  beforeEach(() => {
    spy = jest.fn();
  });

  describe('when results is an empty array', () => {
    it('should reduce results array of array in observable stream as en empty array', () => {
      const observable = of([[]]);
      observable.pipe(
        mergeArrayResults<any>()
      ).subscribe(spy);

      expect(spy).lastCalledWith([]);
    });
  });

  describe('when there are results in array', () => {
    it('should reduce results array of array in observable stream as en empty array', () => {
      const entity1 = { id: 'entity1' };
      const entity2 = { id: 'entity2' };

      const observable = of([[entity1], [entity2]]);
      observable.pipe(
        mergeArrayResults<any>()
      ).subscribe(spy);

      expect(spy).lastCalledWith([
        entity1,
        entity2,
      ]);
    });
  });
});
