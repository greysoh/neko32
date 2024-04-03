import { type Expression, type File, Opcodes, Registers } from "../libs/il.js";
import type { Configuration } from "../libs/types.js";

export function loadU8ToU32(il: File, configuration: Configuration) {
  if (il["loadU8ToU32"]) return;
  
  const ilData: Expression[] = [];

  ilData.push({
    opcode: Opcodes.REW,
    arguments: [
      {
        type: "u32",
        value: 0,
      },
      {
        type: "register",
        value: configuration.firstValueLocation,
      },
    ],
  });

  for (var i = 0; i < 24; i += 8) {
    ilData.push({
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: i,
        },
        {
          type: "register",
          value: configuration.fourthValueLocation,
        },
      ],
    });

    ilData.push({
      opcode: Opcodes.SPO,
      arguments: [],
    });

    ilData.push({
      opcode: Opcodes.SPE,
      arguments: [
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
      ],
    });

    ilData.push({
      opcode: Opcodes.LSB,
      arguments: [
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
        {
          type: "register",
          value: configuration.fourthValueLocation,
        },
        {
          type: "register",
          value: configuration.thirdValueLocation,
        },
      ],
    });

    ilData.push({
      opcode: Opcodes.ORB,
      arguments: [
        {
          type: "register",
          value: configuration.thirdValueLocation,
        },
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
        {
          type: "register",
          value: configuration.fourthValueLocation,
        },
      ],
    });

    ilData.push({
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: configuration.fourthValueLocation,
        },
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
      ],
    });
  }

  ilData.push({
    opcode: Opcodes.RET,
    arguments: [
      {
        type: "register",
        value: Registers.c1,
      },
    ],
  });

  il["u8ToU32"] = ilData;
}
