import type { IfStatement } from "@babel/types";

import {
  Opcodes,
  Registers,
  type Expression,
  type File,
} from "../../libs/il.js";

import { getRandomInt } from "../../libs/getRandomInt.js";
import { CompilerNotImplementedError } from "../../libs/todo!.js";
import type { Configuration } from "../../libs/types.js";

import { parseBinaryExpression } from "../expression/Binary.js";
import { parseBlock } from "../ParseBlock.js";

export function parseIfStatement(
  element: IfStatement,
  il: File,
  ilData: Expression[],
  configuration: Configuration,

  // Internal arguments, do not use outside of this, please
  ifCheckTree: string[] = []
): void {
  if (element.test.type != "BinaryExpression")
    throw new CompilerNotImplementedError(
      "Expression type not implemented in if statement",
    );

  if (element.consequent.type != "BlockStatement")
    throw new CompilerNotImplementedError(
      "You must use a block with if statements for now",
    );

  if (element.alternate) {
    if (
      element.alternate.type != "BlockStatement" &&
      element.alternate.type != "IfStatement"
    ) {
      throw new Error(
        "You must use either an if or block statement, if you have data after the if statement",
      );
    }
  }

  const newBranchID = getRandomInt(1_000_000, 9_999_999);

  const binaryCheckID = `internal__if_statement_checker_${getRandomInt(1_000_000, 9_999_999)}`;
  const hackyBranchID = `internal__hack_delete_${newBranchID}`;

  const newBranch: Expression[] = [];
  const binaryExpressionBranch: Expression[] = [];

  ilData.push({
    opcode: Opcodes.FUN,
    arguments: [
      {
        type: "func",
        value: `internal__if_${newBranchID}`,
      },
    ],
  });

  parseBinaryExpression(
    {
      type: "ExpressionStatement",
      expression: element.test,
    },
    il,
    binaryExpressionBranch,
    configuration,
  );

  // By default it will return if true, which isn't really what we want
  // Therefore we need to invert the value.

  binaryExpressionBranch.push({
    opcode: Opcodes.RET,
    arguments: [
      {
        type: "register",
        value: Registers.c1,
      },
    ],
  });

  for (const expBlock of ifCheckTree) {
    newBranch.push({
      opcode: Opcodes.FUN,
      arguments: [
        {
          type: "func",
          value: expBlock
        }
      ]
    });
  
    newBranch.push({
      opcode: Opcodes.RET,
      arguments: [
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
      ],
    });
  }

  newBranch.push({
    opcode: Opcodes.FUN,
    arguments: [
      {
        type: "func",
        value: binaryCheckID
      }
    ]
  });

  newBranch.push({
    opcode: Opcodes.INV,
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

  newBranch.push({
    opcode: Opcodes.RET,
    arguments: [
      {
        type: "register",
        value: configuration.secondValueLocation,
      },
    ],
  });

  // Check if, betwen the current branch values, and now, there's a return value, that isn't ours
  // Then, we check if it is "c1", so we can patch it

  parseBlock(hackyBranchID, element.consequent, il, configuration);

  il[binaryCheckID] = binaryExpressionBranch;
  il[`internal__if_${newBranchID}`] = newBranch;
  il[`internal__if_${newBranchID}`].push(...il[hackyBranchID]);

  newBranch.push({
    opcode: Opcodes.RET,
    arguments: [
      {
        type: "register",
        value: Registers.c1,
      },
    ],
  });

  if (element.alternate) {
    if (element.alternate.type == "IfStatement") {
      const newTree = Array.from(ifCheckTree);
      newTree.push(binaryCheckID);

      parseIfStatement(element.alternate, il, ilData, configuration, newTree);
    } else if (element.alternate.type == "BlockStatement") {
      const newTree = Array.from(ifCheckTree);
      newTree.push(binaryCheckID);

      const newBranchID = `internal__ifelseblock_${getRandomInt(1_000_000, 9_999_999)}`;
      const hackyBranchID = `internal__hack_delete_${getRandomInt(1_000_000, 9_999_999)}`;

      const newBranch: Expression[] = [];

      for (const expBlock of newTree) {
        newBranch.push({
          opcode: Opcodes.FUN,
          arguments: [
            {
              type: "func",
              value: expBlock
            }
          ]
        });
  
        newBranch.push({
          opcode: Opcodes.RET,
          arguments: [
            {
              type: "register",
              value: configuration.firstValueLocation,
            },
          ],
        });
      }

      parseBlock(hackyBranchID, element.consequent, il, configuration);

      il[newBranchID] = newBranch;
      il[newBranchID].push(...il[hackyBranchID]);

      newBranch.push({
        opcode: Opcodes.RET,
        arguments: [
          {
            type: "register",
            value: Registers.c1,
          },
        ],
      });

      ilData.push({
        opcode: Opcodes.FUN,
        arguments: [
          {
            type: "func",
            value: newBranchID,
          },
        ],
      });

      delete il[hackyBranchID];
    }
  }

  delete il[hackyBranchID];
}
