import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

const graphqlUri =
  (import.meta.env.VITE_GRAPHQL_URL as string | undefined) ||
  (import.meta.env.PROD ? '/graphql' : 'http://localhost:8000/graphql');

const httpLink = new HttpLink({
  uri: graphqlUri,
  credentials: 'include',
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
