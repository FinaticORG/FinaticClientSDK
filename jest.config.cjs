module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns:
    process.env.FINATIC_INTEGRATION === '1' ? [] : ['<rootDir>/tests/integration/'],
  testTimeout: process.env.FINATIC_INTEGRATION === '1' ? 120000 : 10000,
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
    '/node_modules/(?!(p-retry|is-network-error|uuid)/)',
  ],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
    '^.+\\.js$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  extensionsToTreatAsEsm: [],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 46,
      lines: 49,
      statements: 49,
    },
  },
};

