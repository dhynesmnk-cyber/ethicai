import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // AGENTS.md: no `any`; any ts suppression needs a `// REASON:` description.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description', minimumDescriptionLength: 8 },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    ignores: [
      '.next/',
      'playwright-report/',
      'test-results/',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'src/migrations/',
      'src/app/(payload)/admin/importMap.js',
    ],
  },
]

export default eslintConfig
