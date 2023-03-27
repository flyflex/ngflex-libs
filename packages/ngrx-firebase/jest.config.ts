/* eslint-disable */
export default {
  displayName: 'ngrx-firebase',
  preset: '../../jest.preset.js',
  globals: {  },
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }],
  },
  coverageDirectory: '../../coverage/packages/ngrx-firebase',
  coverageReporters: ['json', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'html'],
};
