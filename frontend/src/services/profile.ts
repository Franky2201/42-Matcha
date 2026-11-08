import { gql, type TypedDocumentNode } from '@apollo/client';

export const UPDATE_PROFILE_MUTATION: TypedDocumentNode<Record<string, unknown>, Record<string, unknown>> = gql`
  mutation UpdateProfile(
    $firstname: String!
    $lastname: String!
    $email: String!
    $gender: String
    $preference: String
    $biography: String
    $tags: [String!]
    $newPhotos: [String!]
    $photoMapping: String
  ) {
    updateProfile(
      firstname: $firstname
      lastname: $lastname
      email: $email
      gender: $gender
      preference: $preference
      biography: $biography
      tags: $tags
      newPhotos: $newPhotos
      photoMapping: $photoMapping
    ) {
      id
      firstname
      lastname
      email
      gender
      preference
      biography
      tags
      photos
    }
  }
`;
