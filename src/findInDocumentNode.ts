import {
  DocumentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  SelectionSetNode,
} from "graphql";
import { flatten, union } from "lodash";
import { FragmentsAndResolvers } from "./detectUnusedResolvers";
import {
  isFragmentDefinitionNode,
  isOperationDefinitionNode,
  isResolverDefinition,
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

const findResolversAndSpreadFragmentsInDocumentNode = (
  node: DocumentNode
): { resolvedResolvers: string[]; spreadFragments: string[] } => {
  const resolvedResolvers =
    node.definitions
      .filter(isOperationDefinitionNode)
      .map((definition: OperationDefinitionNode) => {
        return definition.selectionSet.selections
          .filter(isResolverDefinition)
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
    resolvedResolvers: flatten(resolvedResolvers),
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
): FragmentsAndResolvers => {
  const resolversAndSpreadFragmentsInDocumentNode =
    findResolversAndSpreadFragmentsInDocumentNode(document);
  const declaredAndSpreadFragmentsInDocumentNode =
    findDeclaredAndSpreadFragmentsInDocumentNode(document);

  return {
    declaredFragments:
      declaredAndSpreadFragmentsInDocumentNode.declaredFragments,
    resolvedResolvers:
      resolversAndSpreadFragmentsInDocumentNode.resolvedResolvers,
    spreadFragments: union(
      declaredAndSpreadFragmentsInDocumentNode.spreadFragments,
      resolversAndSpreadFragmentsInDocumentNode.spreadFragments
    ),
  };
};
