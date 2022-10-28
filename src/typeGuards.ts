import {
  DefinitionNode,
  FieldNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  SelectionNode,
} from "graphql";
import { FilePath } from "./detectUnusedResolvers";

export const isFragmentDefinitionNode = (
  definitionNode: DefinitionNode
): definitionNode is FragmentDefinitionNode =>
  definitionNode.kind === "FragmentDefinition";

export const isOperationDefinitionNode = (
  definitionNode: DefinitionNode
): definitionNode is OperationDefinitionNode =>
  definitionNode.kind === "OperationDefinition";

export const isResolverDefinition = (
  selection: SelectionNode
): selection is FieldNode => selection.kind === "Field";

export const isPath = (
  pathOrArray: FilePath | string[]
): pathOrArray is FilePath => typeof pathOrArray === "string";
