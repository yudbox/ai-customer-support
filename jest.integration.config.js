/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  displayName: "Integration Tests",
  testMatch: ["<rootDir>/tests/integration/**/*.test.{ts,tsx}"],
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "<rootDir>/tests/setup/integration-setup.ts",
  ],
  testEnvironment: "jest-environment-jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!(msw|@mswjs|@bundled-es-modules|@langchain|@faker-js)/)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "app/_components/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "app/api/**/*.{ts,tsx}",
    "lib/langgraph/workflow.ts",
    "lib/trpc/routers/**/*.{ts,tsx}",
    "lib/features/**/*.{ts,tsx}",
    "!app/layout.tsx",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!lib/database/entities/**",
    "!lib/database/migrations/**",
    "!**/__tests__/**",
    "!lib/features/**/__tests__/**",
    "!components/ui/**",
  ],
  coverageDirectory: "coverage/integration",
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  testTimeout: 30000, // Integration tests may take longer
  maxWorkers: 1, // ✅ pg-mem/in-memory DB: single worker for global testDataSource isolation
  detectLeaks: false, // TypeORM connections can give false positives
  bail: false, // Continue execution even if a test fails
};

// Export async config to properly override transformIgnorePatterns
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  config.transformIgnorePatterns = [
    "/node_modules/(?!(msw|@mswjs|@bundled-es-modules|@langchain|@opentelemetry|@faker-js)/)",
  ];
  return config;
};
