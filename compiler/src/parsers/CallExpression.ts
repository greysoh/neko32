import { strict as assert } from "node:assert";

import type { CallExpression, ExpressionStatement } from "@babel/types";

import { Opcodes, type Expression } from "../libs/il.js";
import type { Configuration } from "../libs/types.js";

export function parseCallExpression(element: ExpressionStatement, ilData: Expression[], configuration: Configuration): void {
  const expression: CallExpression = element.expression as CallExpression;

  if (expression.callee.type == "Identifier") {
    ilData.push({
      opcode: Opcodes.FUN,
      arguments: [
        {
          type: "func",
          value: expression.callee.name
        }
      ]
    });
  } else if (expression.callee.type == "MemberExpression") {
    // @ts-ignore
    if (expression.callee.object.name != "CPU") throw new Error("Illegal function");
    assert.ok(expression.callee.property.type == "Identifier", "Callee property should be Identifier");

    switch (expression.callee.property.name) {
      default: {
        throw new Error("Unimplemented CPU call: " + expression.callee.property.name);
      }

      case "jump": {
        ilData.push({
          opcode: Opcodes.REW,

          arguments: [
            {
              type: "func",
              // TODO: Update this to use the correct value & check types properly
              // @ts-ignore
              value: expression.arguments[0].loc?.identifierName
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
}