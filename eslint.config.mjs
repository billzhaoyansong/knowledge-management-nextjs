import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      
      // React specific rules
      "react/jsx-key": "error",
      "react-hooks/exhaustive-deps": "error",
      
      // General code quality rules
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-vars": "off", // Use TypeScript version instead
      
      // Import/export rules
      "no-unused-imports": "off", // Will be handled by TypeScript rule
    }
  }
];

export default eslintConfig;
