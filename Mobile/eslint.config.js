// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      // The package ships both JavaScript and declaration entry points. Expo's
      // import rule can incorrectly flag it on Windows, while TypeScript
      // resolves it normally and still reports a genuinely missing module.
      'import/no-unresolved': ['error', { ignore: ['^react-native-qrcode-svg$'] }],
    },
  }
]);
