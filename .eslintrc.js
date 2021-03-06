module.exports = {
  env: {
    browser: true,
    es2021: true,
    "jest/globals": true,
  },
  extends: ["plugin:react/recommended", "airbnb", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "jest"],
  rules: {
    quotes: ["error", "double"],
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "import/no-unresolved": "off",
    "no-plusplus": "off",
    "no-loop-func": "off",
    "no-nested-ternary": "off",
    "lines-between-class-members": "off",
    "no-param-reassign": "off",
    "react/jsx-filename-extension": "off",
    "react/function-component-definition": [
      "error",
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    "react/jsx-props-no-spreading": "off",
    "no-continue": "off",
    "no-restricted-syntax": "off",
    "no-labels": "off",
    "prefer-destructuring": "off",
  },
};
