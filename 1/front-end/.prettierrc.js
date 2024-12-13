module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid',
  htmlWhitespaceSensitivity: 'strict',
  embeddedLanguageFormatting: 'auto',
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
  importOrder: [
    '^@angular/(.*)$',
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '^@app/(.*)$',
    '^@env/(.*)$',
  ],
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
  endOfLine: 'lf',
};
