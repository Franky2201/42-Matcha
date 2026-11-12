import { gql, type TypedDocumentNode } from '@apollo/client';

export const EXPLORE_PROFILES_QUERY: TypedDocumentNode<Record<string, any>, Record<string, any>> = gql`
  query ExploreProfiles($limit: Int!, $offset: Int!) {
    exploreProfilesCount
    exploreProfiles(limit: $limit, offset: $offset) {
      id
      firstname
      lastname
      fameRating
      latitude
      longitude
      tags
      photos
    }
  }
`;
