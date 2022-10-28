export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Mutation = {
  __typename?: 'Mutation';
  basicMutation: MyObject;
  complexMutation: MyObject;
  unusedMutation: Scalars['Boolean'];
};


export type MutationBasicMutationArgs = {
  unusedVariable?: InputMaybe<Scalars['Boolean']>;
};


export type MutationComplexMutationArgs = {
  scalarField: Scalars['String'];
};

export type MyDeepObject = {
  __typename?: 'MyDeepObject';
  age: Scalars['Int'];
  evenDeeperObject: MyEvenDeeperObject;
  name: Scalars['String'];
};

export type MyEvenDeeperObject = {
  __typename?: 'MyEvenDeeperObject';
  id: Scalars['ID'];
};

export type MyObject = {
  __typename?: 'MyObject';
  id: Scalars['ID'];
  scalarField: Scalars['String'];
  subObject: MyDeepObject;
};

export type Query = {
  __typename?: 'Query';
  basicQuery: MyObject;
  complexQuery: MyObject;
  unusedQuery: Scalars['Boolean'];
};


export type QueryBasicQueryArgs = {
  id: Scalars['String'];
};


export type QueryComplexQueryArgs = {
  id: Scalars['String'];
};

export type EvenDeeperObjectFragmentFragment = { __typename?: 'MyEvenDeeperObject', id: string };

export type DeepObjectFragmentFragment = { __typename?: 'MyDeepObject', evenDeeperObject: { __typename?: 'MyEvenDeeperObject', id: string } };

export type UnusedFragmentFragment = { __typename?: 'MyObject', scalarField: string };

export type BasicMutationMutationVariables = Exact<{
  unusedVariable?: InputMaybe<Scalars['Boolean']>;
}>;


export type BasicMutationMutation = { __typename?: 'Mutation', basicMutation: { __typename?: 'MyObject', id: string } };

export type ComplexMutationMutationVariables = Exact<{
  scalarField: Scalars['String'];
}>;


export type ComplexMutationMutation = { __typename?: 'Mutation', complexMutation: { __typename?: 'MyObject', id: string, scalarField: string, subObject: { __typename?: 'MyDeepObject', age: number, evenDeeperObject: { __typename?: 'MyEvenDeeperObject', id: string } } } };

export type BasicQuery2QueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type BasicQuery2Query = { __typename?: 'Query', basicQuery: { __typename?: 'MyObject', id: string } };

export type ComplexQueryQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type ComplexQueryQuery = { __typename?: 'Query', complexQuery: { __typename?: 'MyObject', id: string, scalarField: string, subObject: { __typename?: 'MyDeepObject', evenDeeperObject: { __typename?: 'MyEvenDeeperObject', id: string } } } };
