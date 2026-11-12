import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://backend:8000/graphql',
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
