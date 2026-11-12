import { gql, type TypedDocumentNode } from '@apollo/client';
import type { 
  MeQuery, MeQueryVariables,
  RequestPasswordResetMutation, RequestPasswordResetMutationVariables,
  ResetPasswordMutation, ResetPasswordMutationVariables,
  VerifyEmailMutation, VerifyEmailMutationVariables
} from '../types/graphql';

export const ME_QUERY: TypedDocumentNode<MeQuery, MeQueryVariables> = gql`
  query Me {
    me {
      id
      username
      email
      firstname
      lastname
      fameRating
      gender
      preference
      biography
      tags
      photos
      latitude
      longitude
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION: TypedDocumentNode<RequestPasswordResetMutation, RequestPasswordResetMutationVariables> = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const VERIFY_EMAIL_MUTATION: TypedDocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables> = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token)
  }
`;

export const RESET_PASSWORD_MUTATION: TypedDocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables> = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

export const UPDATE_LOCATION_MUTATION = gql`
  mutation UpdateLocation($latitude: Float!, $longitude: Float!) {
    updateLocation(latitude: $latitude, longitude: $longitude) {
      id
      latitude
      longitude
    }
  }
`;
