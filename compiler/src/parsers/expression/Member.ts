import type {
  ExpressionStatement,
  Identifier,
  MemberExpression,
} from "@babel/types";

import { type Expression, type File, Opcodes } from "../../libs/il.js";

import { CompilerNotImplementedError } from "../../libs/todo!.js";
import type { Configuration } from "../../libs/types.js";

import { parseBinaryExpression } from "./Binary.js";

export function parseMemberExpression(
  element: ExpressionStatement,
  il: File,
  ilData: Expression[],
  configuration: Configuration,
): void {
  const expression: MemberExpression = element.expression as MemberExpression;

  const expressionObject: MemberExpression =
    expression.object as MemberExpression;

  const sourceCallerData: Identifier = expressionObject.object as Identifier;
  const destCallerData: Identifier = expressionObject.property as Identifier;

  // First check if the caller is registers, because we only support NumericLiterals for that
  // due to an epic bug
  if (destCallerData.name == "registers") {
    if (expression.property.type != "NumericLiteral") {
      throw new CompilerNotImplementedError(
        "Due to a CPU design issue, non-integer register access is not supported at this time.",
      );
    }

    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: expression.property.value,
        },
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
      ],
    });

    return;
  }

  if (expression.property.type == "NumericLiteral") {
    console.log(expression.property.value);

    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: expression.property.value,
        },
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
      ],
    });
  } else if (expression.property.type == "BinaryExpression") {
    parseBinaryExpression(
      {
        type: "ExpressionStatement",
        expression: expression.property,
      },
      il,
      ilData,
      configuration,
    );

    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
      ],
    });
  } else if (expression.property.type == "MemberExpression") {
    parseMemberExpression(
      {
        type: "ExpressionStatement",
        expression: expression.property,
      },
      il,
      ilData,
      configuration,
    );

    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
      ],
    });
  } else {
    throw new Error("Unknown expression value for left side assignment");
  }

  if (sourceCallerData.type == "Identifier" && sourceCallerData.name == "CPU") {
    if (destCallerData.type != "Identifier")
      throw new Error("Unsupported element for object");

    if (destCallerData.name == "memory") {
      ilData.push({
        opcode: Opcodes.MCP,
        arguments: [
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
        ],
      });
    } else {
      throw new Error("Unknown element on CPU");
    }
  } else {
    throw new CompilerNotImplementedError(
      "Variables are not currently supported right now",
    );
  }
}
