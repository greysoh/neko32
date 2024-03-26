import type { BlockStatement } from "@babel/types";

import { Registers, Opcodes, type File, type Expression } from "../libs/il.js";
import type { Configuration } from "../libs/types.js";

import { parseAssignmentExpression } from "./expression/Assignment.js";
import { parseMemberExpression } from "./expression/Member.js";
import { parseCallExpression } from "./expression/Call.js";

export function parseBlock(
  functionName: string,
  block: BlockStatement,
  il: File,
  compilerOptions: Configuration,
) {
  const ilData: Expression[] = [];
  il[functionName] = ilData;

  for (const element of block.body) {
    switch (element.type) {
      default: {
        throw new Error("Unsupported element: " + element.type);
      }

      case "FunctionDeclaration": {
        const functionName = element.id?.name;
        if (functionName == undefined)
          throw new Error("Function name can't be undefined");

        parseBlock(functionName, element.body, il, compilerOptions);
        break;
      }

      case "IfStatement": {
        console.log(element);
        break;
      }

      case "ReturnStatement": {
        ilData.push({
          opcode: Opcodes.RET,
          arguments: [
            {
              type: "register",
              value: Registers.c1,
            },
          ],
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
          throw new Error(
            "Unknown expression statement: " + element.expression.type,
          );
        }

        break;
      }
    }
  }
}
