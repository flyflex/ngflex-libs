module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      diagnostics: false,
    },
  },
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  testMatch: [
    '**/+(*.)+(spec).+(ts|js)?(x)',
  ],
  moduleFileExtensions: [
    'ts',
    'js',
  ],
  coverageDirectory: '<rootDir>/.coverage',
  coverageReporters: ['text-summary', 'text', 'html', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.ts',

    // Exclusions
    '!src/**/*.model.ts',
    '!src/**/index.ts',
    '!src/tests/**/*.ts',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/.coverage/',
    '<rootDir>/scripts/',
  ],
  testURL: 'http://localhost',
  cacheDirectory: './jest-cache'
};
