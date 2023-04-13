import * as path from "path";
import { DocumentNode } from "graphql";
import {
  detectUnusedOperations,
  readFileToArray,
} from "../src/detectUnusedOperations";
import { parseDocumentNode } from "../src/findInDocumentNode";

describe("Queries tests", () => {
  it("find unused queries in single file", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unusedOperations } = await detectUnusedOperations(schema, {
      cwd: path.resolve(process.cwd(), "./"),
      pattern: "tests/queries/myQuery.ts",
      verbose: false,
    });

    // Then
    expect(unusedOperations.sort()).toEqual(
      [
        "basicScalarQuery",
        "complexQuery",
        "unusedQuery",
        "basicMutation",
        "complexMutation",
        "unusedMutation",
      ].sort()
    );
  });

  it("find unused queries in single .graphql file", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unusedOperations } = await detectUnusedOperations(schema, {
      cwd: path.resolve(process.cwd(), "./"),
      pattern: "tests/queries/myScalarQuery.graphql",
      verbose: false,
    });

    // Then
    expect(unusedOperations.sort()).toEqual(
      [
        "basicQuery",
        "complexQuery",
        "unusedQuery",
        "basicMutation",
        "complexMutation",
        "unusedMutation",
      ].sort()
    );
  });

  it("find unused queries in multiple files and in nested folders", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unusedOperations } = await detectUnusedOperations(schema, {
      cwd: path.resolve(process.cwd(), "./"),
      pattern: "tests/queries/**/*.ts",
      verbose: false,
    });

    expect(unusedOperations.sort()).toEqual(
      [
        "basicScalarQuery",
        "unusedQuery",
        "basicMutation",
        "complexMutation",
        "unusedMutation",
      ].sort()
    );
  });
});

describe("Mutations tests", () => {
  it("find unused mutations in single file", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unusedOperations } = await detectUnusedOperations(schema, {
      cwd: path.resolve(process.cwd(), "./"),
      pattern: "tests/mutations/myMutation.ts",
      verbose: false,
    });

    // Then
    expect(unusedOperations.sort()).toEqual(
      [
        "basicScalarQuery",
        "basicQuery",
        "complexQuery",
        "unusedQuery",
        "complexMutation",
        "unusedMutation",
      ].sort()
    );
  });

  it("find unused mutations in multiple files and in nested folders", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unusedOperations } = await detectUnusedOperations(schema, {
      cwd: path.resolve(process.cwd(), "./"),
      pattern: "tests/mutations/**/*.ts",
      verbose: false,
    });

    // Then
    expect(unusedOperations.sort()).toEqual(
      [
        "basicScalarQuery",
        "basicQuery",
        "complexQuery",
        "unusedQuery",
        "unusedMutation",
      ].sort()
    );
  });
});

describe("Fragments tests", () => {
  it("Find fragments in single file", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unusedFragments } = await detectUnusedOperations(schema, {
      cwd: path.resolve(process.cwd(), "./"),
      pattern: "tests/fragments/myDeepObjectFragment.ts",
      verbose: false,
    });

    // Then
    expect(unusedFragments.sort()).toEqual(["deepObjectFragment"].sort());
  });

  it("Find fragments in multiple files in nested folders", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unusedFragments } = await detectUnusedOperations(schema, {
      cwd: path.resolve(process.cwd(), "./"),
      pattern: "tests/fragments/**/*.ts",
      verbose: false,
    });

    // Then
    expect(unusedFragments.sort()).toEqual(
      ["deepObjectFragment", "unusedFragment"].sort()
    );
  });
});

describe("Find fragments", () => {
  it("Find used fragment in single file", async () => {
    const schema = require("./schema.json");

    // When
    const { unusedFragments } = await detectUnusedOperations(schema, {
      cwd: path.resolve(process.cwd(), "./"),
      pattern: "tests/queries/nestedFolder/myComplexQuery.ts",
      verbose: false,
    });

    // Then
    expect(unusedFragments.sort()).toEqual([].sort());
  });

  it("Find unused fragment in all files", async () => {
    const schema = require("./schema.json");

    // When
    const { unusedFragments, unusedOperations } = await detectUnusedOperations(
      schema,
      {
        cwd: path.resolve(process.cwd(), "./"),
        pattern: "tests/**/*.{ts,graphql}",
        verbose: false,
      }
    );

    // Then
    expect(unusedOperations.sort()).toEqual(
      ["unusedQuery", "unusedMutation"].sort()
    );
    expect(unusedFragments.sort()).toEqual(["unusedFragment"].sort());
  });
});

describe(".unused-operations-ignore and .unused-operations-whitelist files", () => {
  it("should whitelist the unusedQuery and unusedMutation Operations", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unusedOperations } = await detectUnusedOperations(schema, {
      cwd: path.resolve(process.cwd(), "./"),
      pattern: "tests/mutations/myMutation.ts",
      verbose: false,
      whitelist: "tests/.unused-operations-whitelist",
    });

    // Then
    expect(unusedOperations.sort()).toEqual(
      [
        "basicScalarQuery",
        "basicQuery",
        "complexQuery",
        "complexMutation",
      ].sort()
    );
  });

  it("should whitelist the unusedQuery and unusedMutation Operations with comments in whitelist", async () => {
    // Given
    const whitelistFilename =
      "tests/.unused-operations-whitelist-with-comments-and-empty-lines";

    // When
    const fileRead = readFileToArray(whitelistFilename);

    // Then
    expect(fileRead).toEqual(["unusedQuery", "unusedMutation"]);
  });

  it("should ignore the nested folders with file path", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unusedOperations } = await detectUnusedOperations(schema, {
      cwd: path.resolve(process.cwd(), "./"),
      ignore: "tests/.unused-operations-ignore",
      pattern: "tests/**/*.ts",
      verbose: false,
    });

    // Then
    expect(unusedOperations.sort()).toEqual(
      [
        "basicScalarQuery",
        "complexMutation",
        "complexQuery",
        "unusedQuery",
        "unusedMutation",
      ].sort()
    );
  });

  it("should ignore the nested folders with ignore array", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unusedOperations } = await detectUnusedOperations(schema, {
      cwd: path.resolve(process.cwd(), "./"),
      ignore: ["**/nestedFolder/**"],
      pattern: "tests/**/*.ts",
      verbose: false,
    });

    // Then
    expect(unusedOperations.sort()).toEqual(
      [
        "basicScalarQuery",
        "complexMutation",
        "complexQuery",
        "unusedQuery",
        "unusedMutation",
      ].sort()
    );
  });

  it("should find basicMutation in unnecessarilyWhitelistedOperations with whitelist file path", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unnecessarilyWhitelistedOperations } = await detectUnusedOperations(
      schema,
      {
        cwd: path.resolve(process.cwd(), "./"),
        pattern: "tests/mutations/myMutation.ts",
        verbose: false,
        whitelist: "tests/.unused-operations-whitelist-used-operations",
      }
    );

    // Then
    expect(unnecessarilyWhitelistedOperations.sort()).toEqual(
      ["basicMutation"].sort()
    );
  });

  it("should find basicMutation in unnecessarilyWhitelistedOperations with whitelist array", async () => {
    // Given
    const schema = require("./schema.json");

    // When
    const { unnecessarilyWhitelistedOperations } = await detectUnusedOperations(
      schema,
      {
        cwd: path.resolve(process.cwd(), "./"),
        pattern: "tests/mutations/myMutation.ts",
        verbose: false,
        whitelist: ["unusedQuery", "unusedMutation", "basicMutation"],
      }
    );

    // Then
    expect(unnecessarilyWhitelistedOperations.sort()).toEqual(
      ["basicMutation"].sort()
    );
  });
});

describe("AST Parsing tests", () => {
  it("Should parse simple DocumentNode OperationDefinition", () => {
    const simpleDocumentNode: DocumentNode = {
      definitions: [
        {
          kind: "OperationDefinition",
          name: {
            kind: "Name",
            value: "basicQuery",
          },
          operation: "query",
          selectionSet: {
            kind: "SelectionSet",
            selections: [
              {
                directives: [],
                kind: "Field",
                name: {
                  kind: "Name",
                  value: "basicQuery",
                },
              },
            ],
          },
        },
      ],
      kind: "Document",
    };

    const { resolvedOperations } = parseDocumentNode(simpleDocumentNode);

    expect(resolvedOperations).toEqual(["basicQuery"]);
  });

  it("Should parse complex DocumentNode with OperationDefinition and FragmentSpread", () => {
    const simpleDocumentNode: DocumentNode = {
      definitions: [
        {
          kind: "OperationDefinition",
          name: {
            kind: "Name",
            value: "complexQuery",
          },
          operation: "query",
          selectionSet: {
            kind: "SelectionSet",
            selections: [
              {
                directives: [],
                kind: "Field",
                name: {
                  kind: "Name",
                  value: "complexQuery",
                },
                selectionSet: {
                  kind: "SelectionSet",
                  selections: [
                    {
                      arguments: [],
                      directives: [],
                      kind: "Field",
                      name: {
                        kind: "Name",
                        value: "subObject",
                      },
                      selectionSet: {
                        kind: "SelectionSet",
                        selections: [
                          {
                            directives: [],
                            kind: "FragmentSpread",
                            name: {
                              kind: "Name",
                              value: "deepObjectFragment",
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
      kind: "Document",
    };

    const { resolvedOperations, spreadFragments } =
      parseDocumentNode(simpleDocumentNode);

    expect(resolvedOperations).toEqual(["complexQuery"]);
    expect(spreadFragments).toEqual(["deepObjectFragment"]);
  });

  it("Should parse complex DocumentNode with FragmentDefinition and FragmentSpread", () => {
    const simpleDocumentNode: DocumentNode = {
      definitions: [
        {
          directives: [],
          kind: "FragmentDefinition",
          name: {
            kind: "Name",
            value: "deepObjectFragment",
          },
          selectionSet: {
            kind: "SelectionSet",
            selections: [
              {
                arguments: [],
                directives: [],
                kind: "Field",
                name: {
                  kind: "Name",
                  value: "evenDeeperObject",
                },
                selectionSet: {
                  kind: "SelectionSet",
                  selections: [
                    {
                      directives: [],
                      kind: "FragmentSpread",
                      name: {
                        kind: "Name",
                        value: "evenDeeperObjectFragment",
                      },
                    },
                  ],
                },
              },
            ],
          },
          typeCondition: {
            kind: "NamedType",
            name: {
              kind: "Name",
              value: "MyDeepObject",
            },
          },
        },
      ],
      kind: "Document",
    };

    const { declaredFragments, spreadFragments } =
      parseDocumentNode(simpleDocumentNode);

    expect(declaredFragments).toEqual(["deepObjectFragment"]);
    expect(spreadFragments).toEqual(["evenDeeperObjectFragment"]);
  });
});
