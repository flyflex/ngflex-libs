import { readJSONSync } from 'fs-extra';
import { glob } from 'glob';

import { mergeAllReports, findAllCoverageReports, normalizeJestCoverage } from './merge-coverage-reports';

jest.mock('fs-extra', () => ({
  readJSONSync: jest.fn(),
}));

jest.mock('glob', () => ({
  glob: jest.fn(),
}));

const COVERAGE_REPORT = {
  some: 'string',
  another: {
    other: 'string2',
  },
  andAgain: {
    other2: 'string3',
    data: {
      kinda: 'data'
    }
  },
};

const NORMALIZED_REPORT = {
  some: 'string',
  another: {
    other: 'string2',
  },
  andAgain: {
    kinda: 'data'
  },
};

describe('normalizeJestCoverage', () => {
  it('should put normalized data in report object at object root', () => {
    expect(normalizeJestCoverage(COVERAGE_REPORT)).toEqual(NORMALIZED_REPORT);
  });
});

describe(`mergeAllReports`, () => {
  const mergeSpy = jest.fn();
  const coverageMap = {
    merge: mergeSpy,
  } as any;

  beforeEach(() => {
    (readJSONSync as jest.Mock).mockClear();
    mergeSpy.mockClear();
  });

  describe(`when reports is not an array or is an empty array`, () => {
    it(`should return without merging anything`, () => {
      mergeAllReports(coverageMap, 'some' as any);
      mergeAllReports(coverageMap, 123 as any);
      mergeAllReports(coverageMap, null);
      mergeAllReports(coverageMap, undefined);
      mergeAllReports(coverageMap, { some: 'data' } as any);
      mergeAllReports(coverageMap, []);

      expect(mergeSpy).not.toHaveBeenCalled();
      expect(readJSONSync).not.toHaveBeenCalled();
    });
  });

  describe(`when reports is not an array or is an empty array`, () => {
    beforeEach(() => {
      (readJSONSync as jest.Mock).mockReturnValue(COVERAGE_REPORT);
    });

    it(`should merge`, () => {
      mergeAllReports(coverageMap, ['file1', 'file2']);

      expect(mergeSpy).toHaveBeenCalledWith(NORMALIZED_REPORT);
      expect(mergeSpy).toHaveBeenCalledTimes(2);

      expect(readJSONSync).toHaveBeenCalledTimes(2);
      expect(readJSONSync).toHaveBeenCalledWith('file1');
      expect(readJSONSync).toHaveBeenCalledWith('file2');
    });
  });
});

describe(`findAllCoverageReports`, () => {
  const callback = jest.fn();

  beforeEach(() => {
    (glob as unknown as jest.Mock).mockClear().mockImplementation((path, options, cb) => {
      cb(['report 1', 'report 2'], { some: 'error' });
    });
  });

  it(`should call callback function as a result of glob call on requested files`, () => {
    findAllCoverageReports('somePath', callback);

    expect((glob as unknown as jest.Mock)).toHaveBeenCalledWith('somePath', {}, expect.any(Function));
    expect(callback).toHaveBeenCalledWith({ some: 'error' }, ['report 1', 'report 2']);
  });
});
