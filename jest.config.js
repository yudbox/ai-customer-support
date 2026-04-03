/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Путь к Next.js приложению
  dir: "./",
});

const customJestConfig = {
  displayName: "Unit Tests",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: [
    "<rootDir>/lib/**/__tests__/**/*.test.{ts,tsx}",
    "<rootDir>/components/**/__tests__/**/*.test.{ts,tsx}",
    "<rootDir>/app/**/__tests__/**/*.test.{ts,tsx}",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "lib/langgraph/agentNodes/**/*.{ts,tsx}",
    "lib/trpc/**/*.{ts,tsx}",
    "lib/utils/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "!app/api/**", // Exclude API routes (covered by integration tests)
    "!app/layout.tsx", // Exclude root layout
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!lib/database/entities/**", // Exclude TypeORM entities
    "!lib/database/migrations/**", // Exclude migrations
    "!lib/database/data-source*.ts", // Exclude DB config
    "!lib/openai.ts", // Exclude external SDK clients
    "!lib/pinecone.ts",
    "!lib/huggingface.ts",
  ],
  coverageDirectory: "coverage/unit",
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);
