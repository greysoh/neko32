import type { ExpressionStatement, BinaryExpression } from "@babel/types";

import { Opcodes, type Expression, type File } from "../../libs/il.js";
import { CompilerNotImplementedError } from "../../libs/todo!.js";
import type { Configuration } from "../../libs/types.js";

import { STDType1Entries } from "../../std-type1/index.js";
import { parseMemberExpression } from "./Member.js";

export function parseBinaryExpression(
  element: ExpressionStatement,
  il: File, 
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
      il,
      ilData,
      configuration,
    );
  } else if (expression.left.type == "BinaryExpression") {
    parseBinaryExpression(
      {
        type: "ExpressionStatement",
        expression: expression.left,
      },
      il,
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

  if (expression.right.type == "MemberExpression") {
    if (!il["loadU8ToU32"]) STDType1Entries.loadU8ToU32(il, configuration);
    if (!il["loadU32ToU8"]) STDType1Entries.loadU32ToU8(il, configuration);

    ilData.push({
      opcode: Opcodes.FUN,
      arguments: [
        {
          type: "func",
          value: "u32ToU8",
        },
      ],
    });

    parseMemberExpression(
      {
        type: "ExpressionStatement",
        expression: expression.right,
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

    ilData.push({
      opcode: Opcodes.FUN,
      arguments: [
        {
          type: "func",
          value: "u8ToU32",
        },
      ],
    });
  } else if (expression.right.type == "BinaryExpression") {
    if (!il["loadU8ToU32"]) STDType1Entries.loadU8ToU32(il, configuration);
    if (!il["loadU32ToU8"]) STDType1Entries.loadU32ToU8(il, configuration);
    
    ilData.push({
      opcode: Opcodes.FUN,
      arguments: [
        {
          type: "func",
          value: "u32ToU8",
        },
      ],
    });

    parseBinaryExpression(
      {
        type: "ExpressionStatement",
        expression: expression.right,
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

    ilData.push({
      opcode: Opcodes.SPE,
      arguments: [
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
      ],
    });

    ilData.push({
      opcode: Opcodes.SPO,
      arguments: [],
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
