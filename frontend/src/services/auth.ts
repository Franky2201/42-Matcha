import { gql, type TypedDocumentNode } from '@apollo/client';
import type {
	LoginMutation, LoginMutationVariables,
	RegisterMutation, RegisterMutationVariables,
	LogoutMutation, LogoutMutationVariables
} from '../types/graphql';

export const LOGIN_MUTATION: TypedDocumentNode<LoginMutation, LoginMutationVariables> = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      message
    }
  }
`;

export const REGISTER_MUTATION: TypedDocumentNode<RegisterMutation, RegisterMutationVariables> = gql`
  mutation Register($email: String!, $username: String!, $firstname: String!, $lastname: String!, $password: String!) {
    register(email: $email, username: $username, firstname: $firstname, lastname: $lastname, password: $password) {
      user {
        id
      }
      message
    }
  }
`;

export const LOGOUT_MUTATION: TypedDocumentNode<LogoutMutation, LogoutMutationVariables> = gql`
  mutation Logout {
    logout
  }
`;
