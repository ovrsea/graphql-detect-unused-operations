import gql from "graphql-tag";
import { myDeepObjectFragment } from "../../fragments/myDeepObjectFragment";

export const myComplexQuery = gql`
  query complexQuery($id: String!) {
    complexQuery(id: $id) {
      id
      scalarField
      subObject {
        ...deepObjectFragment
      }
    }
  }
  ${myDeepObjectFragment}
`;
