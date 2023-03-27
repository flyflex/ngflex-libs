import { readJSONSync } from 'fs-extra';
import { glob } from 'glob';
import { create } from 'istanbul-reports';
import { createContext } from 'istanbul-lib-report';
import { createCoverageMap } from 'istanbul-lib-coverage';

import * as mergeCoverageReportsUtils from './merge-coverage-reports';

jest.mock('fs-extra', () => ({
  readJSONSync: jest.fn(),
}));

jest.mock('glob', () => ({
  glob: jest.fn(),
}));

jest.mock('istanbul-lib-report', () => ({
  createContext: jest.fn(),
}));

jest.mock('istanbul-reports', () => ({
  create: jest.fn(),
}));

jest.mock('istanbul-lib-coverage', () => ({
  createCoverageMap: jest.fn(),
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
    expect(mergeCoverageReportsUtils.normalizeJestCoverage(COVERAGE_REPORT)).toEqual(NORMALIZED_REPORT);
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
      mergeCoverageReportsUtils.mergeAllReports(coverageMap, 'some' as any);
      mergeCoverageReportsUtils.mergeAllReports(coverageMap, 123 as any);
      mergeCoverageReportsUtils.mergeAllReports(coverageMap, null);
      mergeCoverageReportsUtils.mergeAllReports(coverageMap, undefined);
      mergeCoverageReportsUtils.mergeAllReports(coverageMap, { some: 'data' } as any);
      mergeCoverageReportsUtils.mergeAllReports(coverageMap, []);

      expect(mergeSpy).not.toHaveBeenCalled();
      expect(readJSONSync).not.toHaveBeenCalled();
    });
  });

  describe(`when reports is not an array or is an empty array`, () => {
    beforeEach(() => {
      (readJSONSync as jest.Mock).mockReturnValue(COVERAGE_REPORT);
    });

    it(`should merge`, () => {
      mergeCoverageReportsUtils.mergeAllReports(coverageMap, ['file1', 'file2']);

      expect(mergeSpy).toHaveBeenCalledWith(NORMALIZED_REPORT);
      expect(mergeSpy).toHaveBeenCalledTimes(2);

      expect(readJSONSync).toHaveBeenCalledTimes(2);
      expect(readJSONSync).toHaveBeenCalledWith('file1');
      expect(readJSONSync).toHaveBeenCalledWith('file2');
    });
  });
});

describe(`findAllCoverageReports`, () => {
  beforeEach(() => {
    (glob as unknown as jest.Mock).mockClear().mockResolvedValue(['report 1', 'report 2']);
  });

  it(`should call callback function as a result of glob call on requested files`, async () => {
    const result = mergeCoverageReportsUtils.findAllCoverageReports('somePath');

    expect((glob as unknown as jest.Mock)).toHaveBeenCalledWith('somePath', {});
    await expect(result).resolves.toEqual(['report 1', 'report 2']);
  });
});

describe(`generateReport`, () => {
  const execute = jest.fn();
  const COVERAGE_MAP = {
    some: 'coverageMap'
  } as any;
  const REPORT_TYPE = 'json';
  const OUTPUT_DIR = 'someOutputDir';

  beforeEach(() => {
    (createContext as jest.Mock).mockClear().mockReturnValue('reportContextCreated');
    (create as jest.Mock).mockClear().mockReturnValue({
      execute,
    });
  });

  it(`should call callback function as a result of glob call on requested files`, () => {
    mergeCoverageReportsUtils.generateReport(COVERAGE_MAP, REPORT_TYPE, OUTPUT_DIR);

    expect((createContext as jest.Mock)).toHaveBeenCalledWith({
      dir: OUTPUT_DIR,
      defaultSummarizer: 'nested',
      watermarks: {
        statements: [50, 80],
        functions: [50, 80],
        branches: [0, 80],
        lines: [50, 80],
      },
      coverageMap: COVERAGE_MAP,
    });
    expect((create as jest.Mock)).toHaveBeenCalledWith(REPORT_TYPE, {
      skipEmpty: false,
      skipFull: false, // skip text lines with 100%
      verbose: true, // verbose html report
    });
    expect(execute).toHaveBeenCalledWith('reportContextCreated');
  });
});

describe(`mergeCoverageReports`, () => {
  const ARGS = {
    coverageDir: './some-coverageDir',
    outputDir: 'outputDir',
    reportsFiles: 'someGlobWithStarts**Everywhere',
  } as any;

  let reportOutPath = `./some-coverageDir/outputDir`;
  let reportsFilesGlob = './some-coverageDir/someGlobWithStarts**Everywhere';

  const REPORTS = ['some', 'reports'];
  let spyOnFindAllCoverageReports: jest.SpyInstance;
  let spyOnMergeAll: jest.SpyInstance;
  let spyOnGenerateReport: jest.SpyInstance;
  const mergeSpy = jest.fn();
  const execute = jest.fn();
  const coverageMap = {
    merge: mergeSpy,
  } as any;

  beforeEach(() => {
    (glob as unknown as jest.Mock).mockClear().mockResolvedValue(REPORTS);
    (createCoverageMap as jest.Mock).mockClear().mockReturnValue(coverageMap);
    (readJSONSync as jest.Mock).mockReturnValue(COVERAGE_REPORT);
    (create as jest.Mock).mockClear().mockReturnValue({
      execute,
    });

    spyOnMergeAll = jest.spyOn(mergeCoverageReportsUtils, 'mergeAllReports');
    spyOnGenerateReport = jest.spyOn(mergeCoverageReportsUtils, 'generateReport');
    spyOnFindAllCoverageReports = jest.spyOn(mergeCoverageReportsUtils, 'findAllCoverageReports');
  });

  afterEach(() => {
    spyOnFindAllCoverageReports.mockRestore();
    spyOnMergeAll.mockRestore();
    spyOnGenerateReport.mockRestore();
  });

  describe('when all args are filled', () => {
    it(`should call callback function as a result of glob call on requested files`, async () => {
      await mergeCoverageReportsUtils.mergeCoverageReports(ARGS);

      expect((createCoverageMap as jest.Mock)).toHaveBeenCalledWith({});
      expect(spyOnFindAllCoverageReports.mock.calls[0][0]).toEqual(reportsFilesGlob);

      expect(spyOnMergeAll).toHaveBeenCalledWith(coverageMap, REPORTS);
      expect(spyOnGenerateReport).toHaveBeenCalledWith(coverageMap, 'text', reportOutPath);
      expect(spyOnGenerateReport).toHaveBeenCalledWith(coverageMap, 'text-summary', reportOutPath);
      expect(spyOnGenerateReport).toHaveBeenCalledWith(coverageMap, 'html', reportOutPath);
      expect(spyOnGenerateReport).toHaveBeenCalledWith(coverageMap, 'lcov', reportOutPath);
    });
  });

  describe('with no args filled', () => {
    beforeEach(() => {
      reportOutPath = './coverage/report';
      reportsFilesGlob = './coverage/**/coverage-final.json';
    });

    it(`should fallback to defaults`, async () => {
      reportOutPath = './coverage/report';
      reportsFilesGlob = './coverage/**/coverage-final.json';

      await mergeCoverageReportsUtils.mergeCoverageReports({} as any);

      expect((createCoverageMap as jest.Mock)).toHaveBeenCalledWith({});
      expect(spyOnFindAllCoverageReports.mock.calls[0][0]).toEqual(reportsFilesGlob);

      expect(spyOnMergeAll).toHaveBeenCalledWith(coverageMap, REPORTS);
      expect(spyOnGenerateReport).toHaveBeenCalledWith(coverageMap, 'text', reportOutPath);
      expect(spyOnGenerateReport).toHaveBeenCalledWith(coverageMap, 'text-summary', reportOutPath);
      expect(spyOnGenerateReport).toHaveBeenCalledWith(coverageMap, 'html', reportOutPath);
      expect(spyOnGenerateReport).toHaveBeenCalledWith(coverageMap, 'lcov', reportOutPath);
    });
  });
});
