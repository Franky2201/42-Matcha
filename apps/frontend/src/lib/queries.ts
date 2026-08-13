import { gql, type TypedDocumentNode } from '@apollo/client';
import type { MeQueryData } from '../types/users';

export const ME_QUERY: TypedDocumentNode<MeQueryData, Record<string, never>> = gql`
  query Me {
    me {
      id
      username
      email
      firstname
      lastname
    }
  }
`;
