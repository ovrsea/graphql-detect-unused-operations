import gql from "graphql-tag";
import { myDeepObjectFragment } from "../../fragments/myDeepObjectFragment";

export const myComplexMutation = gql`
  mutation complexMutation($scalarField: String!) {
    complexMutation(scalarField: $scalarField) {
      id
      scalarField
      subObject {
        ...deepObjectFragment
        age
      }
    }
  }
  ${myDeepObjectFragment}
`;
