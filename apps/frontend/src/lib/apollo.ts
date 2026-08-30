import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { SetContextLink } from '@apollo/client/link/context';

const graphqlUri =
  (import.meta.env.VITE_GRAPHQL_URL as string | undefined) ||
  (import.meta.env.PROD ? '/graphql' : 'http://localhost:8000/graphql');

const httpLink = new HttpLink({
  uri: graphqlUri,
});


const authLink = new SetContextLink((prevContext) => {
  const token = localStorage.getItem('token');

  return {
    ...prevContext,
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
