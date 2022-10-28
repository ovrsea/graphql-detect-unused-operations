export type SchemaSubType = {
  kind: "NON_NULL";
  name: string;
  ofType: any;
};

export type SchemaField = {
  name: string;
  args: any[];
  type: SchemaSubType;
};

export type SchemaType = {
  kind: "OBJECT";
  name: string;
  fields: SchemaField[];
};

export type Schema = {
  __schema: {
    queryType: {
      name: "Query";
    };
    mutationType: {
      name: "Mutation";
    };
    types: SchemaType[];
  };
};

export type Selection = {
  kind: string;
  selectionSet: SelectionSet;
};

export type SelectionSet = {
  kind: "SelectionSet";
  selections: Selection[];
};
