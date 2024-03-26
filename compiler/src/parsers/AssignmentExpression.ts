import type { ExpressionStatement, AssignmentExpression, MemberExpression, NumericLiteral, Identifier } from "@babel/types";
import { Opcodes, type Expression, Registers } from "../libs/il.js";

import { CompilerNotImplementedError } from "../libs/todo!.js";
import { parseBinaryExpression } from "./BinaryExpression.js";

import type { Configuration } from "../libs/types.js";

export function parseAssignmentExpression(element: ExpressionStatement, ilData: Expression[], configuration: Configuration): void {
  const expression: AssignmentExpression = element.expression as AssignmentExpression;

  if (expression.operator != "=") throw new CompilerNotImplementedError("You must use '=' only for now");

  if (expression.left.type != "MemberExpression") throw new CompilerNotImplementedError("Only member expressions for setting variables are supported right now");

  const expressionObject: MemberExpression = expression.left.object as MemberExpression;
  const expressionValue: NumericLiteral = expression.left.property as NumericLiteral;

  const sourceCallerData: Identifier = expressionObject.object as Identifier;
  const destCallerData: Identifier = expressionObject.property as Identifier;

  if (sourceCallerData.name != "CPU") throw new CompilerNotImplementedError("Variables are currently not supported right now");

  // Parse right sided expression
  let outputDataRegAddr: number = -1;

  if (expression.right.type == "NumericLiteral") {
    ilData.push({
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: expression.right.value
        },
        {
          type: "register",
          value: configuration.firstValueLocation
        }
      ]
    });

    outputDataRegAddr = configuration.firstValueLocation;
  } else if (expression.right.type == "BinaryExpression") {
    parseBinaryExpression({
      type: "ExpressionStatement",
      expression: expression.right
    }, ilData, configuration);

    outputDataRegAddr = configuration.firstValueLocation;
  } else {
    throw new Error("Unknown expression value");
  }

  if (destCallerData.name == "registers") {
    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: outputDataRegAddr
        },
        {
          type: "register",
          value: expressionValue.value
        }
      ]
    });
  } else if (destCallerData.name == "memory") {
    // Insurance!
    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: outputDataRegAddr
        },
        {
          type: "register",
          value: configuration.firstValueLocation
        }
      ]
    });

    ilData.push({
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: expressionValue.value
        },
        {
          type: "register",
          value: configuration.secondValueLocation
        }
      ]
    });

    ilData.push({
      opcode: Opcodes.MCP,
      arguments: [
        {
          type: "register",
          value: configuration.firstValueLocation
        },
        {
          type: "register",
          value: configuration.secondValueLocation
        }
      ]
    });
  } else {
    throw new Error("Unknown element on CPU");
  }
}
