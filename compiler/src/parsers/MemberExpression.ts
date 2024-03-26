import type { ExpressionStatement, Identifier, MemberExpression, NumberLiteral, NumericLiteral } from "@babel/types";
import { Opcodes, type Expression, Registers } from "../libs/il.js";

import { CompilerNotImplementedError } from "../libs/todo!.js";
import type { Configuration } from "../libs/types.js";

export function parseMemberExpression(element: ExpressionStatement, ilData: Expression[], configuration: Configuration): void {
  const expression: MemberExpression = element.expression as MemberExpression;

  const expressionObject: MemberExpression = expression.object as MemberExpression;
  const expressionValue: NumericLiteral = expression.property as NumericLiteral;

  const sourceCallerData: Identifier = expressionObject.object as Identifier;
  const destCallerData: Identifier = expressionObject.property as Identifier;

  if (sourceCallerData.type == "Identifier" && sourceCallerData.name == "CPU") {
    if (destCallerData.type != "Identifier") throw new Error("Unsupported element for object");

    if (destCallerData.name == "registers") {
      ilData.push({
        opcode: Opcodes.RMV,
        arguments: [
          {
            type: "register",
            value: expressionValue.value
          },
          {
            type: "register",
            value: Registers.r29
          }
        ]
      });
    } else if (destCallerData.name == "memory") {
      ilData.push({
        opcode: Opcodes.REW,
        arguments: [
          {
            type: "u32",
            value: expressionValue.value
          },
          {
            type: "register",
            value: Registers.r29
          }
        ]
      });

      ilData.push({
        opcode: Opcodes.MCP,
        arguments: [
          {
            type: "register",
            value: Registers.r29
          },
          {
            type: "register",
            value: Registers.r30
          }
        ]
      });

      ilData.push({
        opcode: Opcodes.RMV,
        arguments: [
          {
            type: "register",
            value: Registers.r30
          },
          {
            type: "register",
            value: Registers.r29
          }
        ]
      });
    } else {
      throw new Error("Unknown element on CPU");
    }
  } else {
    throw new CompilerNotImplementedError("Variables are not currently supported right now");
  }
}