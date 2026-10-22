import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'schema.graphql',
  documents: ['src/lib/**/*.{ts,tsx}'],
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
