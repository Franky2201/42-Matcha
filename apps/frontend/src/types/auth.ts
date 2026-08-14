import { type User } from "./users"

export interface LoginMutationData {
	login: {
	  token: string | null;
	  message: string;
	};
}

export interface LoginMutationVariables {
	username: string;
	password: string;
}

export interface AuthState {
	token: string | null;
	isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
	login: (token: string) => void;
	logout: () => void;
}

export interface RegisterMutationData {
    register: {
        user: User | null;
        message: string;
    };
}

export interface RegisterMutationVariables {
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    password: string;
}
