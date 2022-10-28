import gql from "graphql-tag";

export const myMutation = gql`
  mutation basicMutation($unusedVariable: Boolean) {
    basicMutation(unusedVariable: $unusedVariable) {
      id
    }
  }
`;
