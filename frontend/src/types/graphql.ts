/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Date with time (isoformat) */
  DateTime: { input: unknown; output: unknown; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  message: Scalars['String']['output'];
  token?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  login: AuthPayload;
  logout: Scalars['String']['output'];
  register: UserPayload;
  requestPasswordReset: Scalars['String']['output'];
  resetPassword: Scalars['String']['output'];
  updateProfile: User;
  verifyEmail: Scalars['String']['output'];
};


export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  firstname: Scalars['String']['input'];
  lastname: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationRequestPasswordResetArgs = {
  email: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationUpdateProfileArgs = {
  biography?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstname: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  lastname: Scalars['String']['input'];
  newPhotos?: InputMaybe<Array<Scalars['String']['input']>>;
  photoMapping?: InputMaybe<Scalars['String']['input']>;
  preference?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationVerifyEmailArgs = {
  token: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<User>;
  ping: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  biography?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  fameRating: Scalars['Float']['output'];
  firstname: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isOnline: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  lastConnection?: Maybe<Scalars['DateTime']['output']>;
  lastname: Scalars['String']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  photos: Array<Scalars['String']['output']>;
  preference: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type UserPayload = {
  __typename?: 'UserPayload';
  message: Scalars['String']['output'];
  user?: Maybe<User>;
};

export type LoginMutationVariables = Exact<{
  username: string;
  password: string;
}>;


export type LoginMutation = { login: { token: string | null, message: string } };

export type RegisterMutationVariables = Exact<{
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  password: string;
}>;


export type RegisterMutation = { register: { message: string, user: { id: number } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: string };

export type UpdateProfileMutationVariables = Exact<{
  firstname: string;
  lastname: string;
  email: string;
  gender?: string | null | undefined;
  preference?: string | null | undefined;
  biography?: string | null | undefined;
  tags?: Array<string> | string | null | undefined;
  newPhotos?: Array<string> | string | null | undefined;
  photoMapping?: string | null | undefined;
}>;


export type UpdateProfileMutation = { updateProfile: { id: number, firstname: string, lastname: string, email: string, gender: string | null, preference: string, biography: string | null, tags: Array<string>, photos: Array<string> } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: number, username: string, email: string, firstname: string, lastname: string, fameRating: number, gender: string | null, preference: string, biography: string | null, tags: Array<string>, photos: Array<string> } | null };

export type RequestPasswordResetMutationVariables = Exact<{
  email: string;
}>;


export type RequestPasswordResetMutation = { requestPasswordReset: string };

export type VerifyEmailMutationVariables = Exact<{
  token: string;
}>;


export type VerifyEmailMutation = { verifyEmail: string };

export type ResetPasswordMutationVariables = Exact<{
  token: string;
  newPassword: string;
}>;


export type ResetPasswordMutation = { resetPassword: string };
