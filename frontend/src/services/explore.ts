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
	ageMin?: number | null;
	ageMax?: number | null;
	fameMin?: number | null;
	fameMax?: number | null;
	distanceMax?: number | null;
	tags?: string[] | null;
	sortBy?: string | null;
	sortOrder?: string | null;
}

export const EXPLORE_PROFILES_QUERY: TypedDocumentNode<ExploreQueryData, ExploreQueryVars> = gql`
	query ExploreProfiles(
		$limit: Int!
		$offset: Int!
		$ageMin: Int
		$ageMax: Int
		$fameMin: Float
		$fameMax: Float
		$distanceMax: Float
		$tags: [String!]
		$sortBy: String
		$sortOrder: String
	) {
		exploreProfilesCount(
			ageMin: $ageMin
			ageMax: $ageMax
			fameMin: $fameMin
			fameMax: $fameMax
			distanceMax: $distanceMax
			tags: $tags
		)
		exploreProfiles(
			limit: $limit
			offset: $offset
			ageMin: $ageMin
			ageMax: $ageMax
			fameMin: $fameMin
			fameMax: $fameMax
			distanceMax: $distanceMax
			tags: $tags
			sortBy: $sortBy
			sortOrder: $sortOrder
		) {
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
