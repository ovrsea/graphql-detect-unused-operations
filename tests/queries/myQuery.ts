import gql from "graphql-tag";

export const myQuery = gql`
  query basicQuery2($id: String!) {
    basicQuery(id: $id) {
      id
    }
  }
`;
