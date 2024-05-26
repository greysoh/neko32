import { type Expression, type File, Opcodes, Registers } from "../libs/il.js";
import type { Configuration } from "../libs/types.js";

/**
This converts a u32, and splits it up into chunks in big-endian order.
*/
export function loadU32ToU8(il: File, configuration: Configuration) {
  if (il["u32ToU8"]) return;

  const ilData: Expression[] = [];

  for (var i = 24; i > 0; i -= 8) {
    ilData.push({
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: i,
        },
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
      ],
    });

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

    ilData.push({
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: 255,
        },
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
      ],
    });

    ilData.push({
      opcode: Opcodes.AND,
      arguments: [
        {
          type: "register",
          value: configuration.thirdValueLocation,
        },
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
        {
          type: "register",
          value: configuration.fourthValueLocation,
        },
      ],
    });

    ilData.push({
      opcode: Opcodes.SPU,
      arguments: [
        {
          type: "register",
          value: configuration.fourthValueLocation,
        },
      ],
    });
  }

  ilData.push({
    opcode: Opcodes.REW,
    arguments: [
      {
        type: "u32",
        value: 255,
      },
      {
        type: "register",
        value: configuration.secondValueLocation,
      },
    ],
  });

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

  ilData.push({
    opcode: Opcodes.SPU,
    arguments: [
      {
        type: "register",
        value: configuration.thirdValueLocation,
      },
    ],
  });

  ilData.push({
    opcode: Opcodes.RET,
    arguments: [
      {
        type: "register",
        value: Registers.c1,
      },
    ],
  });

  il["u32ToU8"] = ilData;
}
