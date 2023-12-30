/* eslint-disable */
const esModules = ['@angular', '@firebase', 'firebase', '@ngrx'].join('|');

export default {
  displayName: 'ngrx-firebase',
  preset: '../../jest.preset.js',
  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }],
  },
  transformIgnorePatterns: [
    `node_modules/(?!(${esModules}|.*.mjs$))`,
  ],
  resolver: '../../jest.resolver.js',
  coverageDirectory: '../../coverage/packages/ngrx-firebase',
  coverageReporters: ['json', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'html'],
};
