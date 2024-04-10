import type { IfStatement } from "@babel/types";
import { strict as assert } from "node:assert";

import {
  Opcodes,
  Registers,
  type Expression,
  type File,
} from "../../libs/il.js";

import { CompilerNotImplementedError } from "../../libs/todo!.js";
import { getRandomInt } from "../../libs/getRandomInt.js";
import type { Configuration } from "../../libs/types.js";

import { parseBinaryExpression } from "../expression/Binary.js";
import { parseBlock } from "../ParseBlock.js";

/**
 * Patches return statements to behave correctly
 * @param origIlData Original IL data (not branched if statement)
 * @param newIlData If statement IL data (branched if statement)
 */
function internalReturnPatcher(
  origIlData: Expression[],
  newIlData: Expression[],
  prevExpTree: string[],
  configuration: Configuration,
) {
  // Convert the array values to contain the index also
  const valuedIlData = newIlData.map((i, index) => ({
    index: index,
    value: i,
  }));

  const allReturnStatements = valuedIlData.filter(
    i => i.value.opcode == Opcodes.RET,
  );

  for (const returnStatement of allReturnStatements) {
    if (
      returnStatement.value.opcode == Opcodes.RET &&
      returnStatement.value.arguments[0].value == Registers.c1
    ) {
      const lastElement = prevExpTree.slice(-1)[0];

      // Parse it like a traditional if...else statement
      for (const expTreeElement of prevExpTree) {
        if (expTreeElement == lastElement) break;

        origIlData.push({
          opcode: Opcodes.FUN,
          arguments: [
            {
              type: "func",
              value: expTreeElement,
            },
          ],
        });

        origIlData.push({
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

        origIlData.push({
          opcode: Opcodes.RET,
          arguments: [
            {
              type: "register",
              value: configuration.secondValueLocation,
            },
          ],
        });
      }

      origIlData.push({
        opcode: Opcodes.FUN,
        arguments: [
          {
            type: "func",
            value: lastElement,
          },
        ],
      });

      origIlData.push({
        opcode: Opcodes.RET,
        arguments: [
          {
            type: "register",
            value: configuration.firstValueLocation,
          },
        ],
      });
    } else {
      // Must be patched previously, or something...
      assert.ok(
        returnStatement.index - 1 > 0,
        "Previous return statement caller does not exist!",
      );
      const previousReturnValue = newIlData[returnStatement.index - 1];

      if (previousReturnValue.opcode == Opcodes.FUN) {
        origIlData.push(previousReturnValue);
        origIlData.push({
          opcode: Opcodes.RET,
          arguments: [
            {
              type: "register",
              value: configuration.firstValueLocation,
            },
          ],
        });
      } else if (previousReturnValue.opcode == Opcodes.INV) {
        assert.ok(
          returnStatement.index - 2 > 0,
          "(second resolved) Previous return statement caller does not exist!",
        );
        const trueOriginalILData = newIlData[returnStatement.index - 2];

        origIlData.push(trueOriginalILData);
        origIlData.push(previousReturnValue);

        origIlData.push({
          opcode: Opcodes.RET,
          arguments: [
            {
              type: "register",
              value: configuration.firstValueLocation,
            },
          ],
        });
      } else {
        console.error(
          `ERROR Internal: Unexpected value for the previous return value, when patching returns in if statement. Code may not behave correctly! (Recieved ${previousReturnValue.opcode})`,
        );
      }
    }
  }
}

/**
 * Parses babel's if statements into real code for the CPU
 * @param element If statement element
 * @param il Raw IL data to access directly
 * @param ilData Current branched IL data
 * @param configuration Compiler configuration
 * @param ifCheckTree Internal argument to get the "if statement checker" for the else statements, to check properly
 */
export function parseIfStatement(
  element: IfStatement,
  il: File,
  ilData: Expression[],
  configuration: Configuration,

  // Internal arguments, do not use outside of this, please
  ifCheckTree: string[] = [],
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
          value: expBlock,
        },
      ],
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
        value: binaryCheckID,
      },
    ],
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
  // Then, we check if it is "c1", so we can patch it.

  parseBlock(hackyBranchID, element.consequent, il, configuration);
  internalReturnPatcher(
    ilData,
    il[hackyBranchID],
    new Array(...ifCheckTree, binaryCheckID),
    configuration,
  );

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

      ilData.push({
        opcode: Opcodes.FUN,
        arguments: [
          {
            type: "func",
            value: newBranchID,
          },
        ],
      });

      for (const expBlock of newTree) {
        newBranch.push({
          opcode: Opcodes.FUN,
          arguments: [
            {
              type: "func",
              value: expBlock,
            },
          ],
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

      parseBlock(hackyBranchID, element.alternate, il, configuration);
      internalReturnPatcher(
        ilData,
        il[hackyBranchID],
        new Array(...ifCheckTree, binaryCheckID),
        configuration,
      );

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

      delete il[hackyBranchID];
    }
  }

  delete il[hackyBranchID];
}
