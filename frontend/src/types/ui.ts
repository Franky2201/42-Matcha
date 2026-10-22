export interface MockProfile {
	id: string;
	name: string;
	age: number;
	distance: number;
	rating: number;
	tags: string[];
	imageUrl: string;
}

export interface CurrentUser {
	username: string;
	rating: number;
	avatarUrl: string;
	firstname: string;
	lastname: string;
}
