#!/usr/bin/env node

import { readJSONSync } from 'fs-extra';
import { glob } from 'glob';
import { create as instanBulReportCreate, ReportOptions } from 'istanbul-reports';
import { createContext, Watermarks } from 'istanbul-lib-report';
import { createCoverageMap, CoverageMap } from 'istanbul-lib-coverage';
import minimist, { ParsedArgs } from 'minimist';

const configWatermarks: Watermarks = {
  statements: [50, 80],
  functions: [50, 80],
  branches: [0, 80],
  lines: [50, 80],
};

export const normalizeJestCoverage = (obj: Record<string, any>) => {
  const result = { ...obj };

  Object.entries(result)
    .filter(([_, v]) => v.data)
    .forEach(([k, v]) => {
      result[k] = v.data;
    });

  return result;
};

export const mergeAllReports = (coverageMap: CoverageMap, reports: string[]) => {
  if (!Array.isArray(reports)) {
    return;
  }

  reports.forEach((reportFile: string) => {
    const coverageReport = readJSONSync(reportFile);
    coverageMap.merge(normalizeJestCoverage(coverageReport));
  });
};

export const findAllCoverageReports = (path: string): Promise<string[]> => {
  return glob(path, {});
};

export const generateReport = (coverageMap: CoverageMap, type: keyof ReportOptions, outputDir: string) => {
  const context = createContext({
    dir: outputDir,
    // The summarizer to default to (may be overridden by some reports)
    // values can be nested/flat/pkg. Defaults to 'pkg'
    defaultSummarizer: 'nested',
    watermarks: configWatermarks,
    coverageMap,
  });
  const report = instanBulReportCreate(type, {
    skipEmpty: false,
    skipFull: false, // skip text lines with 100%
    verbose: true, // verbose html report
  });
  report.execute(context);
};

export const mergeCoverageReports = async (args: ParsedArgs) => {
  const rootDir = args.coverageDir || './coverage';
  const reportOut = args.outputDir || 'report';
  const reportsFiles = args.reportsFiles || '**/coverage-final.json';

  const reportOutPath = `${rootDir}/${reportOut}`;
  const reportsFilesGlob = rootDir + '/' + reportsFiles;

  const coverageMap = createCoverageMap({});

  const reports = await findAllCoverageReports(reportsFilesGlob);

  console.error(reports);

  if (Array.isArray(reports)) {
    mergeAllReports(coverageMap, reports);
    generateReport(coverageMap, 'text', reportOutPath);
    generateReport(coverageMap, 'text-summary', reportOutPath);
    generateReport(coverageMap, 'html', reportOutPath);
    generateReport(coverageMap, 'lcov', reportOutPath);
  }
}

/* istanbul ignore next */
mergeCoverageReports(
  minimist(process.argv.slice(2))
).catch((err) => {
  console.error(err);
  process.exit(1);
});
