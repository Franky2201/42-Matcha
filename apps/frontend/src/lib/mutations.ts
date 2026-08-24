import { gql, type TypedDocumentNode } from '@apollo/client';
import type { LoginMutationData, LoginMutationVariables, RegisterMutationData, RegisterMutationVariables } from '../types/auth';
import type { ForgotPasswordMutationData, ForgotPasswordMutationVariables, ResetPasswordMutationData, ResetPasswordMutationVariables } from '../types/users';
import type { VerifyEmailMutationData, VerifyEmailMutationVariables } from '../types/users';

export const LOGIN_MUTATION: TypedDocumentNode<LoginMutationData, LoginMutationVariables> = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      message
    }
  }
`;

export const REGISTER_MUTATION: TypedDocumentNode<RegisterMutationData, RegisterMutationVariables> = gql`
  mutation Register($email: String!, $username: String!, $firstname: String!, $lastname: String!, $password: String!) {
    register(email: $email, username: $username, firstname: $firstname, lastname: $lastname, password: $password) {
      user {
        id
      }
      message
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION: TypedDocumentNode<ForgotPasswordMutationData, ForgotPasswordMutationVariables> = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const VERIFY_EMAIL_MUTATION: TypedDocumentNode<VerifyEmailMutationData, VerifyEmailMutationVariables> = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token)
  }
`;

export const RESET_PASSWORD_MUTATION: TypedDocumentNode<ResetPasswordMutationData, ResetPasswordMutationVariables> = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;
