const fs = require('fs-extra');
const glob = require('glob');
const istanbulReports = require('istanbul-reports');
const libReport = require('istanbul-lib-report');
const istanbulCoverage = require('istanbul-lib-coverage');

/* [ Configuration ] */
const rootDir = './coverage';
const reportOut = './coverage/report';

const configWatermarks = {
  statements: [50, 80],
  functions: [50, 80],
  branches: [0, 80],
  lines: [50, 80],
};

const normalizeJestCoverage = (obj) => {
  const result = { ...obj };

  Object.entries(result)
    .filter(([k, v]) => v.data)
    .forEach(([k, v]) => {
      result[k] = v.data;
    });

  return result;
};

const mergeAllReports = (coverageMap, reports) => {
  if (Array.isArray(reports) === false) {
    return;
  }

  reports.forEach((reportFile) => {
    const coverageReport = fs.readJSONSync(reportFile);
    coverageMap.merge(normalizeJestCoverage(coverageReport));
  });
};

const findAllCoverageReports = (path, callback) => {
  glob(path, {}, (err, reports) => {
    callback(reports, err);
  });
};

const generateReport = (coverageMap, type) => {
  const context = libReport.createContext({
    dir: reportOut,
    // The summarizer to default to (may be overridden by some reports)
    // values can be nested/flat/pkg. Defaults to 'pkg'
    defaultSummarizer: 'nested',
    watermarks: configWatermarks,
    coverageMap,
  });
  const report = istanbulReports.create(type, {
    skipEmpty: false,
    skipFull: false, // skip text lines with 100%
    verbose: true, // verbose html report
  });
  report.execute(context);
};

async function main() {
  const coverageMap = istanbulCoverage.createCoverageMap({});

  findAllCoverageReports(rootDir + '/**/coverage-final.json', (reports, err) => {
    if (Array.isArray(reports)) {
      mergeAllReports(coverageMap, reports);
      generateReport(coverageMap, 'text');
      generateReport(coverageMap, 'text-summary');
      generateReport(coverageMap, 'html');
      generateReport(coverageMap, 'lcov');
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
