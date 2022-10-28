import { find } from "lodash";
import { Schema, SchemaField } from "./schema";

const findOperationsInSchemaByType = (
  schema: Schema,
  type: string
): SchemaField[] => {
  const schemaFields = find(
    schema.__schema.types,
    (schemaType) => schemaType.name === type
  );

  return schemaFields?.fields ?? [];
};

export const parseSchema = (schema: Schema): string[] => {
  return [
    ...findOperationsInSchemaByType(schema, "Query"),
    ...findOperationsInSchemaByType(schema, "Mutation"),
  ].map((elem) => elem.name);
};
