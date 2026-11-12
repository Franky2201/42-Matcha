import { gql, type TypedDocumentNode } from '@apollo/client';

export interface ExploreProfileNode {
	id: string | number;
	firstname: string;
	lastname: string;
	fameRating?: number;
	latitude?: number | null;
	longitude?: number | null;
	tags?: string[];
	photos?: string[];
}

export interface ExploreQueryData {
	exploreProfilesCount: number;
	exploreProfiles: ExploreProfileNode[];
}

export interface ExploreQueryVars {
	limit: number;
	offset: number;
}

export const EXPLORE_PROFILES_QUERY: TypedDocumentNode<ExploreQueryData, ExploreQueryVars> = gql`
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
