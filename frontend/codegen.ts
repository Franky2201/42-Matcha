import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.GRAPHQL_SCHEMA_URL || 'http://localhost:8000/graphql',
  documents: ['src/services/**/*.{ts,tsx}'],
  generates: {
    'src/types/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        skipTypename: false,
        useTypeImports: true,
      },
    },
  },
};

export default config;
