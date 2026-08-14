export interface User {
    id: number;
    email: string;
    username: string;
    lastname: string;
    firstname: string;
    isVerified: boolean;
    gender: 'male' | 'female' | null;
    preference: 'all' | 'male' | 'female';
    biography: string | null;
    fameRating: number;
    latitude: number | null;
    longitude: number | null;
    lastConnection: string | null;
    isOnline: boolean;
    updatedAt: string;
    createdAt: string;
}

export interface ForgotPasswordMutationData {
    requestPasswordReset: string;
}

export interface ForgotPasswordMutationVariables {
    email: string;
}

export interface VerifyEmailMutationData {
    verifyEmail: string;
}

export interface VerifyEmailMutationVariables {
    token: string;
}

export interface MeQueryData {
    me: User | null;
}
