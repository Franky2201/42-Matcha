import { gql } from '@apollo/client';

export const UPDATE_PROFILE_MUTATION = gql`
	mutation UpdateProfile(
		$firstname: String!
		$lastname: String!
		$email: String!
		$age: Int!
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
			age: $age
			gender: $gender
			preference: $preference
			biography: $biography
			tags: $tags
			newPhotos: $newPhotos
			photoMapping: $photoMapping
		) {
			user {
				id
				firstname
				lastname
				email
				age
				gender
				preference
				biography
				tags
				photos
			}
			message
		}
	}
`;
