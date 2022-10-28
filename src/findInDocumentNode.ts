import {
  DocumentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  SelectionSetNode,
} from "graphql";
import { flatten, union } from "lodash";
import { FragmentsAndOperations } from "./detectUnusedOperations";
import {
  isFragmentDefinitionNode,
  isOperationDefinitionNode,
  isOperationDefinition,
} from "./typeGuards";

const findFragmentSpreadInSelectionSet = (
  selectionSet: SelectionSetNode
): string[] => {
  return flatten(
    selectionSet.selections.map((selection) => {
      if (selection.kind === "FragmentSpread") {
        return [selection.name.value];
      } else if (selection.selectionSet) {
        const res = findFragmentSpreadInSelectionSet(selection.selectionSet);

        return res;
      }

      return [];
    })
  );
};

const findOperationsAndSpreadFragmentsInDocumentNode = (
  node: DocumentNode
): { resolvedOperations: string[]; spreadFragments: string[] } => {
  const resolvedOperations =
    node.definitions
      .filter(isOperationDefinitionNode)
      .map((definition: OperationDefinitionNode) => {
        return definition.selectionSet.selections
          .filter(isOperationDefinition)
          .map((selection) => {
            return selection.name.value;
          });
      }) ?? [];

  const spreadFragments = flatten(
    node.definitions
      .filter(isOperationDefinitionNode)
      .filter((definition) => definition.selectionSet)
      .map((definition: OperationDefinitionNode) => {
        return findFragmentSpreadInSelectionSet(definition.selectionSet);
      })
  );

  return {
    resolvedOperations: flatten(resolvedOperations),
    spreadFragments,
  };
};

const findDeclaredAndSpreadFragmentsInDocumentNode = (
  node: DocumentNode
): { declaredFragments: string[]; spreadFragments: string[] } => {
  const declaredFragments =
    node.definitions
      .filter(isFragmentDefinitionNode)
      .map((definition: FragmentDefinitionNode) => {
        return definition.name?.value;
      }) ?? [];
  const spreadFragments = flatten(
    node.definitions
      .filter(isFragmentDefinitionNode)
      .filter((definition) => definition.selectionSet)
      .map((definition: FragmentDefinitionNode) => {
        return findFragmentSpreadInSelectionSet(definition.selectionSet);
      })
  );

  return {
    declaredFragments,
    spreadFragments,
  };
};

export const parseDocumentNode = (
  document: DocumentNode
): FragmentsAndOperations => {
  const OperationsAndSpreadFragmentsInDocumentNode =
    findOperationsAndSpreadFragmentsInDocumentNode(document);
  const declaredAndSpreadFragmentsInDocumentNode =
    findDeclaredAndSpreadFragmentsInDocumentNode(document);

  return {
    declaredFragments:
      declaredAndSpreadFragmentsInDocumentNode.declaredFragments,
    resolvedOperations:
      OperationsAndSpreadFragmentsInDocumentNode.resolvedOperations,
    spreadFragments: union(
      declaredAndSpreadFragmentsInDocumentNode.spreadFragments,
      OperationsAndSpreadFragmentsInDocumentNode.spreadFragments
    ),
  };
};
