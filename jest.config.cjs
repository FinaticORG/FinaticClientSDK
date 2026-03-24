module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  // ESM-only deps used by generated client code (e.g. p-retry)
  transformIgnorePatterns: [
    '/node_modules/(?!(p-retry|is-network-error)/)',
  ],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: false,
      },
    ],
    '^.+\\.js$': [
      'ts-jest',
      {
        useESM: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  extensionsToTreatAsEsm: [],
};

