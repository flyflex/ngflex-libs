/* eslint-disable */
export default {
  displayName: 'fullcalendar-dayjs',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/fullcalendar-dayjs',
  resolver: '../../jest.resolver.js',
  coverageReporters: ['json', 'lcov', 'html'],
};
