import type {
  ExpressionStatement,
  AssignmentExpression,
  MemberExpression,
  Identifier,
} from "@babel/types";

import { Opcodes, type Expression, type File } from "../../libs/il.js";

import { CompilerNotImplementedError } from "../../libs/todo!.js";
import type { Configuration } from "../../libs/types.js";

import { parseBinaryExpression } from "./Binary.js";
import { parseMemberExpression } from "./Member.js";

export function parseAssignmentExpression(
  element: ExpressionStatement,
  il: File,
  ilData: Expression[],
  configuration: Configuration,
): void {
  const expression: AssignmentExpression =
    element.expression as AssignmentExpression;

  if (expression.operator != "=")
    throw new CompilerNotImplementedError("You must use '=' only for now");

  if (expression.left.type != "MemberExpression")
    throw new CompilerNotImplementedError(
      "Only member expressions for setting variables are supported right now",
    );

  const expressionObject: MemberExpression = expression.left
    .object as MemberExpression;

  const sourceCallerData: Identifier = expressionObject.object as Identifier;
  const destCallerData: Identifier = expressionObject.property as Identifier;

  if (sourceCallerData.name != "CPU")
    throw new CompilerNotImplementedError(
      "Variables are currently not supported right now",
    );

  const leftAssignmentVirtualBranch: Expression[] = [];
  const rightAssignmentVirtualBranch: Expression[] = [];

  if (expression.left.property.type == "NumericLiteral") {
    leftAssignmentVirtualBranch.push({
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: expression.left.property.value,
        },
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
      ],
    });
  } else if (expression.left.property.type == "BinaryExpression") {
    parseBinaryExpression(
      {
        type: "ExpressionStatement",
        expression: expression.left.property,
      },
      il,
      leftAssignmentVirtualBranch,
      configuration,
    );

    leftAssignmentVirtualBranch.push({
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
  } else if (expression.left.property.type == "MemberExpression") {
    parseMemberExpression(
      {
        type: "ExpressionStatement",
        expression: expression.left.property,
      },
      il,
      leftAssignmentVirtualBranch,
      configuration,
    );

    leftAssignmentVirtualBranch.push({
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

  if (expression.right.type == "NumericLiteral") {
    rightAssignmentVirtualBranch.push({
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: expression.right.value,
        },
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
      ],
    });
  } else if (expression.right.type == "BinaryExpression") {
    parseBinaryExpression(
      {
        type: "ExpressionStatement",
        expression: expression.right,
      },
      il,
      rightAssignmentVirtualBranch,
      configuration,
    );
  } else if (expression.right.type == "MemberExpression") {
    parseMemberExpression(
      {
        type: "ExpressionStatement",
        expression: expression.right,
      },
      il,
      rightAssignmentVirtualBranch,
      configuration,
    );
  } else {
    throw new Error("Unknown expression value for right side assignment");
  }

  if (destCallerData.name == "registers") {
    if (expression.left.property.type != "NumericLiteral") {
      throw new CompilerNotImplementedError(
        "Due to a CPU design issue, non-integer register access is not supported at this time.",
      );
    }

    ilData.push(...rightAssignmentVirtualBranch);

    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
        {
          type: "register",
          value: expression.left.property.value,
        },
      ],
    });
  } else if (destCallerData.name == "memory") {
    ilData.push(...leftAssignmentVirtualBranch);
    ilData.push(...rightAssignmentVirtualBranch);

    ilData.push({
      opcode: Opcodes.MEW,
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
    throw new Error("Unknown element on CPU");
  }
}
