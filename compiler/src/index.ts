import { readFile, writeFile } from "node:fs/promises";

import type { BlockStatement } from "@babel/types";
import { parse } from "@babel/parser";

import { writeIL, Opcodes, Registers, type File, type Expression } from "./libs/il.js";
import type { Configuration } from "./libs/types.js";

import { parseAssignmentExpression } from "./parsers/AssignmentExpression.js";
import { parseMemberExpression } from "./parsers/MemberExpression.js";
import { parseCallExpression } from "./parsers/CallExpression.js";

const il: File = {};

const compilerOptions: Configuration = {
  firstValueLocation: 34,
  secondValueLocation: 35,
  thirdValueLocation: 36,

  tempMemoryValueMethod: "stack",
  tempMemoryValueLocation: 1024
};

console.log("Neko Compiler");
console.log("WARN: in testing phase, don't use in production!");

console.log(" - Lexifying");

const file = await readFile(process.argv[2], "utf8");
const parsedFile = parse(file, {
  sourceType: "module"
});

console.log(" - Converting from lex to compiler object");

function parseBlock(functionName: string, block: BlockStatement) {
  const ilData: Expression[] = [];
  il[functionName] = ilData;

  for (const element of block.body) {
    switch (element.type) {
      default: {
        throw new Error("Unsupported element: " + element.type);
      }

      case "FunctionDeclaration": {
        const functionName = element.id?.name;
        if (functionName == undefined) throw new Error("Function name can't be undefined");
  
        parseBlock(functionName, element.body);
        break;
      }

      case "ReturnStatement": {
        ilData.push({
          opcode: Opcodes.RET,
          arguments: [
            {
              type: "register",
              value: Registers.c1
            }
          ]
        });

        break;
      }

      case "ExpressionStatement": {
        if (element.expression.type == "CallExpression") {
          parseCallExpression(element, ilData, compilerOptions);
        } else if (element.expression.type == "MemberExpression") {
          parseMemberExpression(element, ilData, compilerOptions);
        } else if (element.expression.type == "AssignmentExpression") {
          parseAssignmentExpression(element, ilData, compilerOptions);
        } else {
          throw new Error("Unknown expression statement: " + element.expression.type);
        }

        break;
      }
    }
  }
}

for (const element of parsedFile.program.body) {
  switch (element.type) {
    default: {
      throw new Error("Unsupported top level element: " + element.type);
    }

    case "FunctionDeclaration": {
      const functionName = element.id?.name;
      if (functionName == undefined) throw new Error("Function name can't be undefined");

      parseBlock(functionName, element.body);
      break;
    }
  }
}

console.log(" - Compiling");
const data = writeIL(il);

console.log(" - Writing file");
await writeFile("./a.out.bin", data);