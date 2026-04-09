import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // Accessibility rules (EU Directive 2019/882 compliance)
      // jsx-a11y plugin already included in nextVitals config
      "jsx-a11y/alt-text": "error", // Images must have alt text
      "jsx-a11y/aria-props": "error", // ARIA properties must be valid
      "jsx-a11y/aria-proptypes": "error", // ARIA property types must be valid
      "jsx-a11y/aria-unsupported-elements": "error", // ARIA used on supported elements only
      "jsx-a11y/role-has-required-aria-props": "error", // Roles have required ARIA props
      "jsx-a11y/role-supports-aria-props": "error", // ARIA props supported by role
      "jsx-a11y/label-has-associated-control": "error", // Labels associated with controls
      "jsx-a11y/no-noninteractive-element-interactions": "warn", // Interactive handlers on semantic elements
      "jsx-a11y/click-events-have-key-events": "warn", // Click handlers need keyboard events
      "jsx-a11y/no-static-element-interactions": "warn", // Interactive elements need semantic role
      "jsx-a11y/anchor-is-valid": "error", // Anchors must have valid href
      "jsx-a11y/heading-has-content": "error", // Headings must have content
      "jsx-a11y/html-has-lang": "error", // HTML must have lang attribute
      "jsx-a11y/iframe-has-title": "error", // Iframes must have title
      "jsx-a11y/img-redundant-alt": "warn", // Alt text shouldn't contain "image"
      "jsx-a11y/interactive-supports-focus": "error", // Interactive elements must be focusable
      "jsx-a11y/no-autofocus": "warn", // Avoid autofocus
      "jsx-a11y/no-redundant-roles": "error", // Don't use redundant roles

      // Error on unused imports
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // TypeScript unused vars rule
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Import order rules
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js builtin modules
            "external", // npm packages
            "internal", // @/ imports
            ["parent", "sibling"], // ../ and ./
            "index", // ./
            "type", // type imports
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  // Rules for application code (not tests, not scripts)
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "**/__tests__/**",
      "**/*.test.*",
      "**/*.spec.*",
      "scripts/**",
      "*.config.*",
      "jest.setup.js",
    ],
    rules: {
      // Prevent magic numbers - all numbers should be named constants
      "no-magic-numbers": [
        "error",
        {
          ignore: [
            0,
            1,
            -1, // Common array/loop indices and default values
            2, // Common for binary operations, doubling, etc.
            3,
            4,
            5, // Small integers for UI spacing, layout
            8, // Common UI size (padding, icon sizes)
            10, // Common for decimal operations, percentages base
            24, // Hours in day
            50, // Half-percentage
            60, // Minutes/seconds, medium percentage
            80, // High percentage threshold
            100, // Common for percentages
            200, // HTTP OK, common limit
            300, // Timeout in ms, redirect status
            500, // Server error status, timeout
            1000, // Common for milliseconds to seconds
            5000, // 5 second timeout
            10000, // 10 second timeout, large limit
            0.5, // Half coefficient
            0.8, // 80% coefficient
            0.9, // 90% coefficient
          ],
          ignoreArrayIndexes: true, // Allow array[0], array[1], etc.
          ignoreDefaultValues: true, // Allow default parameter values
          ignoreClassFieldInitialValues: true, // Allow class field defaults
          enforceConst: true, // Require const declarations
          detectObjects: false, // Don't enforce on object properties (too strict)
        },
      ],
    },
  },
  // Rules for test files
  {
    files: [
      "**/__tests__/**/*.{ts,tsx}",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
    ],
    rules: {
      // Avoid direct DOM access in tests
      // Use semantic queries from @testing-library/react instead of querySelector
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='querySelector']",
          message:
            "Do not use querySelector in tests. Use semantic queries instead: getByRole, getByText, getByLabelText, etc. If you need to find an element within another, use within() from @testing-library/react.",
        },
        {
          selector: "MemberExpression[property.name='querySelectorAll']",
          message:
            "Do not use querySelectorAll in tests. Use semantic queries instead: getAllByRole, getAllByText, getAllByLabelText, etc. If you need to find elements within another, use within() from @testing-library/react.",
        },
        {
          selector: "MemberExpression[property.name='getElementsByClassName']",
          message:
            "Do not use getElementsByClassName in tests. Use semantic queries instead: getByRole, getByText, etc.",
        },
        {
          selector: "MemberExpression[property.name='getElementsByTagName']",
          message:
            "Do not use getElementsByTagName in tests. Use semantic queries instead: getByRole, getAllByRole, etc.",
        },
        {
          selector: "MemberExpression[property.name='getElementById']",
          message:
            "Do not use getElementById in tests. Use semantic queries instead: getByRole, getByTestId (as a last resort), etc.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scripts folder
    "scripts/**",
  ]),
]);

export default eslintConfig;
