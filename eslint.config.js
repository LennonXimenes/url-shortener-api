import path from "path";
import url from "url";
import { Linter } from "eslint";
import parserTs from "@typescript-eslint/parser";
import eslintPluginTs from "@typescript-eslint/eslint-plugin";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {Linter.FlatConfig[]} */
const config = [
  {
    files: ["**/*.ts"],
    ignores: [".eslintrc.js"],

    languageOptions: {
      parser: parserTs,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
    },

    plugins: {
      "@typescript-eslint": eslintPluginTs,
    },

    rules: {
      "linebreak-style": ["error", "windows"],
      quotes: ["error", "double"],
      semi: ["error", "always"],

      "@typescript-eslint/no-explicit-any": "off",

      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          prefix: ["i"],
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
          prefix: ["t"],
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/interface-name-prefix": "off",
    },
  },
];

export default config;
