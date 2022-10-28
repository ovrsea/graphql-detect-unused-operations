import * as fs from "fs";
import { difference, intersection, union } from "lodash";
import * as glob from "glob";

import { loadDocuments } from "@graphql-tools/load";
import { Source } from "@graphql-tools/utils";
import { CodeFileLoader } from "@graphql-tools/code-file-loader";
import { DocumentNode } from "graphql";
import { parseDocumentNode } from "./findInDocumentNode";
import { parseSchema } from "./parseSchema";
import { Schema } from "./schema";
import { isPath } from "./typeGuards";

export type FragmentsAndResolvers = {
  declaredFragments: string[];
  resolvedResolvers: string[];
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

const defaultReduceValues: FragmentsAndResolvers = {
  declaredFragments: [],
  resolvedResolvers: [],
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

const getUnionOfFragmentsAndResolvers = (
  acc: FragmentsAndResolvers,
  {
    declaredFragments,
    resolvedResolvers,
    spreadFragments,
  }: FragmentsAndResolvers
) => {
  return {
    declaredFragments: union(acc.declaredFragments, declaredFragments),
    resolvedResolvers: union(acc.resolvedResolvers, resolvedResolvers),
    spreadFragments: union(acc.spreadFragments, spreadFragments),
  };
};

const loadAndParseFile =
  (verbose?: boolean) =>
  async (file: string): Promise<FragmentsAndResolvers> => {
    if (verbose) {
      console.log("\x1b[36m%s\x1b[0m", "File", file);
    }

    try {
      const sources = await loadDocuments(file, {
        loaders: [new CodeFileLoader()],
      });

      const ret = sources
        .filter(({ document }) => document !== undefined)
        .map(({ document }: Source) => {
          return parseDocumentNode(document as DocumentNode);
        })
        .reduce((acc, currentFragmentsAndResolvers) => {
          return getUnionOfFragmentsAndResolvers(
            acc,
            currentFragmentsAndResolvers
          );
        }, defaultReduceValues);

      return ret;
    } catch (error) {
      return defaultReduceValues;
    }
  };

const getAllFragmentsAndResolvers = async (
  files: string[],
  verbose?: boolean
) => {
  return (await Promise.all(files.map(loadAndParseFile(verbose)))).reduce(
    (acc, currentFragmentsAndResolvers) => {
      return getUnionOfFragmentsAndResolvers(acc, currentFragmentsAndResolvers);
    },
    defaultReduceValues
  );
};

export const detectUnusedResolvers = async (
  schema: Schema,
  options: Options = {}
): Promise<{
  unnecessarilyWhitelistedResolvers: string[];
  unusedFragments: string[];
  unusedResolvers: string[];
}> => {
  const {
    cwd = "",
    ignore = "./.unused-operations-ignore",
    pattern = "**/*.{ts,tsx,js}",
    verbose = false,
    whitelist = "./.unused-operations-whitelist",
  } = options;
  const schemaResolversList = parseSchema(schema);

  if (!schemaResolversList.length) {
    throw new Error("Bloody schema without queries or mutations");
  }

  const files = getFilesRecursively(pattern, ignore, cwd, verbose);

  if (verbose) {
    console.log("\x1b[36m%s\x1b[0m", "Files", files);
  }

  // eslint-disable-next-line
  const allFragmentsAndResolvers: FragmentsAndResolvers =
    await getAllFragmentsAndResolvers(files);
  const whitelistFragmentsAndResolvers = isPath(whitelist)
    ? readFileToArray(whitelist)
    : whitelist;

  if (verbose) {
    console.log(
      "\x1b[36m%s\x1b[0m",
      "schemaResolversList",
      schemaResolversList
    );
    console.log(
      "\x1b[36m%s\x1b[0m",
      "allFragmentsAndResolvers",
      allFragmentsAndResolvers
    );
    console.log(
      "\x1b[36m%s\x1b[0m",
      "whitelistCalls",
      whitelistFragmentsAndResolvers
    );
  }

  return {
    unnecessarilyWhitelistedResolvers: intersection(
      whitelistFragmentsAndResolvers,
      allFragmentsAndResolvers.resolvedResolvers
    ),
    unusedFragments: difference(
      allFragmentsAndResolvers.declaredFragments,
      allFragmentsAndResolvers.spreadFragments
    ),
    unusedResolvers: difference(
      schemaResolversList,
      union(
        allFragmentsAndResolvers.resolvedResolvers,
        whitelistFragmentsAndResolvers
      )
    ),
  };
};
