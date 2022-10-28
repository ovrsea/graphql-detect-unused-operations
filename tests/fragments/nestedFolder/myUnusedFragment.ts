import gql from "graphql-tag";

export const myUnusedFragment = gql`
  fragment unusedFragment on MyObject {
    scalarField
  }
`;
