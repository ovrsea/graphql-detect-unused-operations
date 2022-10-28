import gql from "graphql-tag";

export const myEvenDeeperObjectFragment = gql`
  fragment evenDeeperObjectFragment on MyEvenDeeperObject {
    id
  }
`;

export const myDeepObjectFragment = gql`
  fragment deepObjectFragment on MyDeepObject {
    evenDeeperObject {
      ...evenDeeperObjectFragment
    }
  }
  ${myEvenDeeperObjectFragment}
`;
