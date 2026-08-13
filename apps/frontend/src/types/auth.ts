export interface LoginMutationData {
	login: {
	  token: string | null;
	  message: string;
	};
}

export interface LoginMutationVariables {
	email: string;
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
