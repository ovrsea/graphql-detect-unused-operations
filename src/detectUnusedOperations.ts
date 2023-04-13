import * as fs from "fs";
import { difference, intersection, union } from "lodash";
import * as glob from "glob";

import { loadDocuments } from "@graphql-tools/load";
import { Source } from "@graphql-tools/utils";
import { CodeFileLoader } from "@graphql-tools/code-file-loader";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader"
import { DocumentNode } from "graphql";
import { parseDocumentNode } from "./findInDocumentNode";
import { parseSchema } from "./parseSchema";
import { Schema } from "./schema";
import { isPath } from "./typeGuards";

export type FragmentsAndOperations = {
  declaredFragments: string[];
  resolvedOperations: string[];
  spreadFragments: string[];
};

export type FilePath = string;

type Options = {
  cwd?: string;
  ignore?: FilePath | string[];
  pattern?: string;
  verbose?: boolean;
  whitelist?: FilePath | string[];
};

const defaultReduceValues: FragmentsAndOperations = {
  declaredFragments: [],
  resolvedOperations: [],
  spreadFragments: [],
};

export const readFileToArray = (filename: string): string[] => {
  try {
    const fileToArray = fs
      .readFileSync(filename, "utf8")
      ?.toString()
      .split("\n")
      .filter((line: string) => {
        return line.length > 0 && !line.match(/#.*/gi);
      });

    return fileToArray;
  } catch (e: any) {
    return [];
  }
};

export const getFilesRecursively = (
  pattern: string,
  ignore: FilePath | string[],
  cwd: string,
  verbose?: boolean
) => {
  const ignorePattern: string[] = isPath(ignore)
    ? readFileToArray(ignore)
    : ignore;

  if (verbose) {
    console.log("\x1b[36m%s\x1b[0m", "Ignored pattern", ignorePattern);
  }

  return glob.sync(pattern, {
    cwd,
    ignore: ignorePattern,
    realpath: true,
  });
};

const getUnionOfFragmentsAndOperations = (
  acc: FragmentsAndOperations,
  {
    declaredFragments,
    resolvedOperations,
    spreadFragments,
  }: FragmentsAndOperations
) => {
  return {
    declaredFragments: union(acc.declaredFragments, declaredFragments),
    resolvedOperations: union(acc.resolvedOperations, resolvedOperations),
    spreadFragments: union(acc.spreadFragments, spreadFragments),
  };
};

const loadAndParseFile =
  (verbose?: boolean) =>
  async (file: string): Promise<FragmentsAndOperations> => {
    if (verbose) {
      console.log("\x1b[36m%s\x1b[0m", "File", file);
    }

    try {
      const sources = await loadDocuments(file, {
        loaders: [new CodeFileLoader(), new GraphQLFileLoader()],
      });
      if (verbose) {
        console.log("\x1b[36m%s\x1b[0m", "Sources", sources);
      }
      const ret = sources
        .filter(({ document }) => document !== undefined)
        .map(({ document }: Source) => {
          return parseDocumentNode(document as DocumentNode);
        })
        .reduce((acc, currentFragmentsAndOperations) => {
          return getUnionOfFragmentsAndOperations(
            acc,
            currentFragmentsAndOperations
          );
        }, defaultReduceValues);
      if (verbose) {
        console.log("\x1b[36m%s\x1b[0m", "Ret", ret);
      }

      return ret;
    } catch (error) {
      return defaultReduceValues;
    }
  };

const getAllFragmentsAndOperations = async (
  files: string[],
  verbose?: boolean
) => {
  const parsedFiles = await Promise.all(files.map(loadAndParseFile(verbose)));

  return parsedFiles.reduce(
    (acc, currentFragmentsAndOperations) =>
      getUnionOfFragmentsAndOperations(acc, currentFragmentsAndOperations),
    defaultReduceValues
  );
};

export const detectUnusedOperations = async (
  schema: Schema,
  options: Options = {}
): Promise<{
  unnecessarilyWhitelistedOperations: string[];
  unusedFragments: string[];
  unusedOperations: string[];
}> => {
  const {
    cwd = "",
    ignore = "./.unused-operations-ignore",
    pattern = "**/*.{ts,tsx,js}",
    verbose = false,
    whitelist = "./.unused-operations-whitelist",
  } = options;
  const schemaOperationsList = parseSchema(schema);
  if (verbose) {
    console.log(
      "\x1b[36m%s\x1b[0m",
      "Schema operations list",
      schemaOperationsList
    );
  }

  if (!schemaOperationsList.length) {
    throw new Error("Bloody schema without queries or mutations");
  }

  const files = getFilesRecursively(pattern, ignore, cwd, verbose);

  if (verbose) {
    console.log("\x1b[36m%s\x1b[0m", "Files", files);
  }

  // eslint-disable-next-line
  const allFragmentsAndOperations: FragmentsAndOperations =
    await getAllFragmentsAndOperations(files, verbose);
  const whitelistFragmentsAndOperations = isPath(whitelist)
    ? readFileToArray(whitelist)
    : whitelist;

  if (verbose) {
    console.log(
      "\x1b[36m%s\x1b[0m",
      "schemaOperationsList",
      schemaOperationsList
    );
    console.log(
      "\x1b[36m%s\x1b[0m",
      "allFragmentsAndOperations",
      allFragmentsAndOperations
    );
    console.log(
      "\x1b[36m%s\x1b[0m",
      "whitelistCalls",
      whitelistFragmentsAndOperations
    );
  }

  return {
    unnecessarilyWhitelistedOperations: intersection(
      whitelistFragmentsAndOperations,
      allFragmentsAndOperations.resolvedOperations
    ),
    unusedFragments: difference(
      allFragmentsAndOperations.declaredFragments,
      allFragmentsAndOperations.spreadFragments
    ),
    unusedOperations: difference(
      schemaOperationsList,
      union(
        allFragmentsAndOperations.resolvedOperations,
        whitelistFragmentsAndOperations
      )
    ),
  };
};
