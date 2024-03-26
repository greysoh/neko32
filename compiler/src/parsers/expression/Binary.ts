import type { ExpressionStatement, BinaryExpression } from "@babel/types";

import { CompilerNotImplementedError } from "../../libs/todo!.js";
import { Opcodes, type Expression } from "../../libs/il.js";
import type { Configuration } from "../../libs/types.js";
import { parseMemberExpression } from "./Member.js";

export function parseBinaryExpression(
  element: ExpressionStatement,
  ilData: Expression[],
  configuration: Configuration,
): void {
  const expression: BinaryExpression = element.expression as BinaryExpression;

  if (expression.left.type == "MemberExpression") {
    parseMemberExpression(
      {
        type: "ExpressionStatement",
        expression: expression.left,
      },
      ilData,
      configuration,
    );
  } else if (expression.left.type == "BinaryExpression") {
    parseBinaryExpression(
      {
        type: "ExpressionStatement",
        expression: expression.left,
      },
      ilData,
      configuration,
    );
  } else if (expression.left.type == "NumericLiteral") {
    ilData.push({
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: expression.left.value,
        },
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
      ],
    });
  }

  // TODO: Refactor to use stack instead of registers.
  // This can cause collisions with certain cases in duplicate binary expressions

  if (expression.right.type == "MemberExpression") {
    // We need to get out of the way!
    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
        {
          type: "register",
          value: configuration.thirdValueLocation,
        },
      ],
    });

    parseMemberExpression(
      {
        type: "ExpressionStatement",
        expression: expression.right,
      },
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

    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: configuration.thirdValueLocation,
        },
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
      ],
    });
  } else if (expression.right.type == "BinaryExpression") {
    // FIXME: If you "stack" these, it *will* cause data loss.
    // It should be the same amount of CPU cycles if we use the stack.

    // We need to get out of the way!
    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
        {
          type: "register",
          value: configuration.thirdValueLocation,
        },
      ],
    });

    parseBinaryExpression(
      {
        type: "ExpressionStatement",
        expression: expression.right,
      },
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

    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: configuration.thirdValueLocation,
        },
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
      ],
    });
  } else if (expression.right.type == "NumericLiteral") {
    ilData.push({
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: expression.right.value,
        },
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
      ],
    });
  }

  switch (expression.operator) {
    default: {
      throw new Error("Unsupported operator");
    }

    case "+": {
      ilData.push({
        opcode: Opcodes.ADD,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }

    case "-": {
      ilData.push({
        opcode: Opcodes.SUB,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }

    case "*": {
      ilData.push({
        opcode: Opcodes.MUL,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }

    case "/": {
      ilData.push({
        opcode: Opcodes.DIV,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }

    case "%": {
      ilData.push({
        opcode: Opcodes.MOD,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }

    case "<<": {
      ilData.push({
        opcode: Opcodes.LSB,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }

    case ">>": {
      ilData.push({
        opcode: Opcodes.RSB,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }

    case "&": {
      ilData.push({
        opcode: Opcodes.AND,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }

    case "|": {
      ilData.push({
        opcode: Opcodes.ORB,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }

    case "^": {
      ilData.push({
        opcode: Opcodes.XOR,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }

    case "==": {
      throw new CompilerNotImplementedError(
        "Non-absolute checking (==) is not supported. Please use absolute checking (===) instead.",
      );
    }

    case "!=": {
      throw new CompilerNotImplementedError(
        "Non-absolute checking (!=) is not supported. Please use absolute checking (!==) instead.",
      );
    }

    case "===": {
      ilData.push({
        opcode: Opcodes.EQL,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }

    case "!==": {
      ilData.push({
        opcode: Opcodes.EQL,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.secondValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      ilData.push({
        opcode: Opcodes.INV,
        arguments: [
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
        ],
      });

      ilData.push({
        opcode: Opcodes.RMV,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
          {
            type: "register",
            value: configuration.thirdValueLocation,
          },
        ],
      });

      break;
    }
  }

  ilData.push({
    opcode: Opcodes.RMV,
    arguments: [
      {
        type: "register",
        value: configuration.thirdValueLocation,
      },
      {
        type: "register",
        value: configuration.firstValueLocation,
      },
    ],
  });
}
