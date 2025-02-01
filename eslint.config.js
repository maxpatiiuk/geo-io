import eslintConfig from '@arcgis/eslint-config';
import eslintConfigLumina from '@arcgis/eslint-config/lumina';

export default [
  {
    ignores: ['dist', 'node_modules', '**/*.js'],
  },
  ...eslintConfig,
  ...eslintConfigLumina,
  {
    languageOptions: {
      parserOptions: {
        // Even in monorepo setups, we run ESLint using a single tsconfig.json.
        // See https://devtopia.esri.com/WebGIS/arcgis-web-components/issues/543
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
