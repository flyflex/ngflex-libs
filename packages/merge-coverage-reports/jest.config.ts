/* eslint-disable */
export default {
  displayName: 'merge-coverage-reports',
  preset: '../../jest.preset.js',
  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }]
  },
  coverageDirectory: '../../coverage/packages/merge-coverage-reports',
  coverageReporters: ['json', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'html'],
};
