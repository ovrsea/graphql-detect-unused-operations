# Ovrsea GraphQL Schema Checker

A GraphQL Schema Checker that reads through your codebase and compares the graphql operations (queries & mutations) and fragments used with your project's graphql `schema.json` and returns the unused operations and fragments to keep a clean codebase.

## Quickstart

#### Installing

`npm install @ovrsea/graphql-detect-unused-operations`

#### Basic Usage

```js
type FilePath = string;

type Options = {
  cwd?: string;
  ignore?: FilePath | string[];
  pattern?: string;
  verbose?: boolean;
  whitelist?: FilePath | string[];
};

const detectUnusedOperations = async (
  schema: Schema,
  options: Options = {}) =>: Promise<{
    unnecessarilyWhitelistedOperations: string[];
    unusedFragments: string[];
    unusedOperations: string[];
  }> {};
```

## Parameters

`schema`: JSON of the graphql schema

`cwd`: Path to the current working directory. Defaults to `""`

`ignore`: `FilePath` (`string`) to a pattern ignore or `string[]` of patterns to ignore. Defaults to file path `./.unused-operations-ignore `.
An example is available in `.unused-operations-ignore.example`

`pattern`: A glob pattern to the files to check. Defaults to `**/*.{ts,tsx,js} `,

`verbose`: Adds more log. Defaults to `false`,

`whitelist`: `FilePath` (`string`) to a whitelist of operations (queries and mutations only) or `string[]` of operations to whitelist. Defaults to `./.unused-operations-whitelist `. An example is available in `.unused-operations-whitelist.example`

## Return values

```js
const detectUnusedOperations = async (...) =>: Promise<{
    unnecessarilyWhitelistedOperations: string[];
    unusedFragments: string[];
    unusedOperations: string[];
  }> {};
```
