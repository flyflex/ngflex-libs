/* eslint-disable */
export default {
  displayName: 'merge-coverage-reports',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  coverageDirectory: '../../coverage/packages/merge-coverage-reports',
  coverageReporters: ['json', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'html'],
};
