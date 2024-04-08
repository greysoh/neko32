import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { Statement } from "@babel/types";
import { parse } from "@babel/parser";

import { Registers, writeIL, type File } from "./libs/il.js";
import type { Configuration } from "./libs/types.js";

import { parseBlock } from "./parsers/ParseBlock.js";

// FIXME: The IL data might be out of order sometimes (workaround is fixed to not be as bulky).
// This would be fixed if we switched to an array instead of a dictionary/JSON object
const il: File = {};

const compilerOptions: Configuration = {
  firstValueLocation: Registers.r28,
  secondValueLocation: Registers.r29,
  thirdValueLocation: Registers.r30,
  fourthValueLocation: Registers.r31,

  cacheValueLocation: Registers.r27,

  tempMemoryValueMethod: "stack",
  tempMemoryValueLocation: 1024,
};

if (process.env.NODE_ENV != "production") {
  console.log("necc is running...");
  console.log("WARN: in testing phase, don't use in production!\n");

  console.log(" - Lexifying JS");
}

const file = await readFile(process.argv[2], "utf8");
const parsedFile = parse(file, {
  sourceType: "module",
});

if (process.env.NODE_ENV != "production") console.log(" - Compiling");

async function parseTopLevel(element: Statement, fileName: string) {
  switch (element.type) {
    default: {
      throw new Error("Unsupported top level element: " + element.type);
    }

    case "ImportDeclaration": {
      const newFileName = join(fileName, "..", element.source.value);
      const file = await readFile(newFileName, "utf-8");

      const parsedFile = parse(file, {
        sourceType: "module",
        sourceFilename: newFileName,
      });

      for (const element of parsedFile.program.body) {
        await parseTopLevel(element, newFileName);
      }

      break;
    }

    case "ExportNamedDeclaration": {
      if (!element.declaration)
        throw new Error("You can't export nothing (ex: export;)");
      await parseTopLevel(element.declaration, fileName);

      break;
    }

    case "ExportAllDeclaration": {
      // We forcefully put in everything anyways, so this won't do much
      break;
    }

    case "FunctionDeclaration": {
      const functionName = element.id?.name;
      if (functionName == undefined)
        throw new Error("Function name can't be undefined");

      parseBlock(functionName, element.body, il, compilerOptions);
      break;
    }
  }
}

for (const element of parsedFile.program.body) {
  await parseTopLevel(element, process.argv[2]);
}

if (process.env.NODE_ENV != "production") console.log(" - Assembling");
const data = writeIL(il);

if (process.env.NECC_DUMP_IL) {
  console.log(il);
  await writeFile("./il.json", JSON.stringify(il, null, 2));
}

if (process.env.NODE_ENV != "production") console.log(" - Writing file");

await writeFile("./a.out.bin", data);
