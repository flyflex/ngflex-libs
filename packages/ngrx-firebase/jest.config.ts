/* eslint-disable */
export default {
  displayName: 'ngrx-firebase',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  coverageDirectory: '../../coverage/packages/ngrx-firebase',
  coverageReporters: ['json', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'html'],
};
