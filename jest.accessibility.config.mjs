/**
 * Jest Configuration - Accessibility Tests
 *
 * Separate config for accessibility testing with jest-axe
 * Tests EU Directive 2019/882 compliance (WCAG 2.1 AA)
 *
 * Run: npm run test:a11y
 */

import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  displayName: "🔍 Accessibility Tests (WCAG 2.1 AA)",
  testEnvironment: "jsdom",

  // Test files pattern
  testMatch: ["<rootDir>/tests/accessibility/**/*.test.{ts,tsx}"],

  // Setup file (includes jest-axe matchers)
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Module paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
  },

  // Coverage configuration
  collectCoverageFrom: [
    // Only UI components that need accessibility testing
    "components/ui/**/*.{ts,tsx}",
    "app/_components/**/*.{ts,tsx}",

    // Exclude test files
    "!**/__tests__/**",
    "!**/*.test.{ts,tsx}",
    "!**/*.spec.{ts,tsx}",

    // Exclude wrappers and page compositions (not UI components)
    "!app/_components/Providers.tsx",
    "!app/_components/ToastClient.tsx",
    "!app/_components/HomePage.tsx",
    "!app/_components/ManagerDashboardPage.tsx",

    // Exclude other non-component files
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/index.ts", // Re-export files
  ],

  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/coverage/",
    "/tests/",
  ],

  coverageDirectory: "coverage/accessibility",

  // Coverage thresholds (EU compliance target: 90%+)
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Report format
  coverageReporters: ["text", "lcov", "html"],

  // Ignore patterns
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  // Verbose output
  verbose: true,
};

export default createJestConfig(customJestConfig);
