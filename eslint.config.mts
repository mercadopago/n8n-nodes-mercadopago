import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import n8nNodesBasePlugin from "eslint-plugin-n8n-nodes-base";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**/*", "node_modules/**/*", "**/*.json"]
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ["**/*.{ts,mts,cts}"],
    plugins: {
      "n8n-nodes-base": n8nNodesBasePlugin
    },
    rules: {
      // Reglas específicas para n8n
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "n8n-nodes-base/node-param-default-missing": "off",
      "n8n-nodes-base/node-param-description-missing-for-return-all": "off"
    }
  },
  {
    files: ["**/tests/**/*.{ts,mts,cts}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off"
    }
  }
];
