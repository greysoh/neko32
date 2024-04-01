import { readFile, writeFile } from "node:fs/promises";

import { parse } from "@babel/parser";

import { Opcodes, Registers, writeIL, type File } from "./libs/il.js";
import type { Configuration } from "./libs/types.js";

import { parseBlock } from "./parsers/ParseBlock.js";

// FIXME: This is a hacky workaround to if statements being out of order, before main is defined
const il: File = {
  "999999": [
    {
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "func",
          value: "main",
        },
        {
          type: "register",
          value: 0,
        },
      ],
    },
  ],
};

const compilerOptions: Configuration = {
  firstValueLocation: Registers.r28,
  secondValueLocation: Registers.r29,
  thirdValueLocation: Registers.r30,
  fourthValueLocation: Registers.r31,

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

for (const element of parsedFile.program.body) {
  switch (element.type) {
    default: {
      throw new Error("Unsupported top level element: " + element.type);
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

if (process.env.NODE_ENV != "production") console.log(" - Assembling");
console.log(il);
const data = writeIL(il);

if (process.env.NODE_ENV != "production") console.log(" - Writing file");

await writeFile("./a.out.bin", data);
