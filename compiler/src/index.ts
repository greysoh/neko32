import { strict as assert } from "node:assert";
import { readFile, writeFile } from "node:fs/promises";

import { parse } from "@babel/parser";
import type { BlockStatement } from "@babel/types";

import { writeIL, Opcodes, Registers, type File, type Expression } from "./libs/il.js";

const il: File = {};

const file = await readFile(process.argv[2], "utf8");
const parsedFile = parse(file, {
  sourceType: "module"
});

console.log(" - Converting lex to IL");

function parseBlock(functionName: string, block: BlockStatement) {
  console.log("o/ from function: " + functionName);

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
        if (element.expression.type != "CallExpression") throw new Error("Unsupported expression");

        if (element.expression.callee.type == "Identifier") {
          ilData.push({
            opcode: Opcodes.FUN,
            arguments: [
              {
                type: "func",
                value: element.expression.callee.name
              }
            ]
          });
        } else if (element.expression.callee.type == "MemberExpression") {
          // @ts-ignore
          if (element.expression.callee.object.name != "CPU") throw new Error("Illegal function");
          assert.ok(element.expression.callee.property.type == "Identifier", "Callee property should be Identifier");

          switch (element.expression.callee.property.name) {
            default: {
              throw new Error("Unimplemented CPU call: " + element.expression.callee.property.name);
            }

            case "jump": {
              ilData.push({
                opcode: Opcodes.REW,

                arguments: [
                  {
                    type: "func",
                    // @ts-ignore
                    value: element.expression.arguments[0].loc?.identifierName
                  },
                  {
                    type: "register",
                    value: 0
                  }
                ]
              });

              break;
            }
          }
        }

        break;
      }
    }
  }
}

for (const element of parsedFile.program.body) {
  console.log("Recieved element: %s", element.type);
  
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
  }
}

console.log(" - Compiling");
const data = writeIL(il);

await writeFile("./a.out.bin", data);