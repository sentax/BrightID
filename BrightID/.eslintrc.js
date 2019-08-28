module.exports = {
  root: true,
  "parser": "babel-eslint",
  "plugins": ["import", "react", "jsx-a11y", "flowtype"],
  "extends": [
    "airbnb",
    "@react-native-community",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:flowtype/recommended",
    "prettier"
  ],
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "jest": true
  },
  "rules": {
    "no-unused-vars": "error",
    "no-console": "off",
    "arrow-parens": "off",
    "global-require": "off",
    "no-use-before-define": "off",
    "no-prototype-builtins": "off",
    "function-paren-newline": "off",
    "class-methods-use-this": "warn",
    "react/destructuring-assignment": "off",
    "react/no-array-index-key": "warn",
    "react/prefer-stateless-function": "off",
    "react/jsx-filename-extension": "off",
    "react/no-unescaped-entities": "off",
    "react/no-did-mount-set-state": "off",
    "react/require-default-props": "off",
    "react/jsx-boolean-value": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/no-unused-prop-types": "warn",
    "react/no-unused-state": "warn",
    "react/sort-comp": "off",
    "consistent-return": "off",
    "no-alert": "off",
    "no-else-return": "off",
    "no-shadow": "warn",
    "import/no-named-as-default": "off",
    "prefer-const": "off",
    "no-restricted-syntax": "off",
    "import/prefer-default-export": "off",
    "no-param-reassign": "off",
    "no-var": "off",
    "vars-on-top": "off",
    "block-scoped-var": "off",
    "flowtype/space-after-type-colon": "off",
    "no-await-in-loop": "off"
  },
  "globals": {
    "__DEV__": "readonly"
  }
};