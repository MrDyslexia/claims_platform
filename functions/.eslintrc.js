module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier", "import"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  env: { node: true, es2022: true },
  ignorePatterns: ["lib/**", "node_modules/**"],
  rules: {
    "prettier/prettier": "warn",
    "import/order": [
      "warn",
      {
        groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
        "newlines-between": "always"
      }
    ]
  }
};

