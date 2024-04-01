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
): void {
  if (element.test.type != "BinaryExpression")
    throw new CompilerNotImplementedError(
      "Expression type not implemented in if statement",
    );

  if (element.consequent.type != "BlockStatement")
    throw new CompilerNotImplementedError(
      "You must use a block with if statements for now",
    );

  const newBranchID = getRandomInt(1_000_000, 9_999_999);
  const hackyBranchID = `hack_delete_${newBranchID}`;

  const newBranch: Expression[] = [];

  ilData.push({
    opcode: Opcodes.FUN,
    arguments: [
      {
        type: "func",
        value: `${newBranchID}`,
      },
    ],
  });

  parseBinaryExpression(
    {
      type: "ExpressionStatement",
      expression: element.test,
    },
    il,
    newBranch,
    configuration,
  );

  // By default it will return if true, which isn't really what we want
  // Therefore, we need to invert the value.

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

  parseBlock(hackyBranchID, element.consequent, il, configuration);

  il[`${newBranchID}`] = newBranch;
  il[`${newBranchID}`].push(...il[hackyBranchID]);

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
