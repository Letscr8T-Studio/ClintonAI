import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// eslint-config-next already bundles react, react-hooks, jsx-a11y and @next/next rules.
const config = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "max-lines": ["warn", { max: 150, skipBlankLines: true, skipComments: true }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "e2e/**"],
    rules: { "max-lines": "off" },
  },
  {
    // CLI scripts report progress on the console.
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
];

export default config;
