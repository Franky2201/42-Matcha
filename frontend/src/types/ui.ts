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
	email: string;
	rating: number;
	avatarUrl: string;
	firstname: string;
	lastname: string;
	gender: string;
	preference: string;
	biography: string;
	tags: string[];
	photos: string[];
	latitude?: number | null;
	longitude?: number | null;
}
