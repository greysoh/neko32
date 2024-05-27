import { type File, Opcodes, Registers } from "../libs/il.js";
import type { Configuration } from "../libs/types.js";

/**
This converts a u32, and splits it up into chunks in big-endian order.
*/
export function loadU32ToU8(il: File, configuration: Configuration) {
  if (il["u32ToU8"]) return;

  il["u32ToU8"] = [
    {
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: 32,
        },
        {
          type: "register",
          value: configuration.fourthValueLocation,
        },
      ],
    },
    {
      opcode: Opcodes.FUN,
      arguments: [
        {
          type: "func",
          value: "u32ToU8-loopwrap"
        }
      ]
    },
    {
      opcode: Opcodes.RET,
      arguments: [
        {
          type: "register",
          value: Registers.c1,
        },
      ],
    }
  ];

  il["u32ToU8-loopwrap"] = [
    {
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: 8
        },
        {
          type: "register",
          value: configuration.thirdValueLocation
        }
      ]
    },
    {
      opcode: Opcodes.SUB,
      arguments: [
        {
          type: "register",
          value: configuration.fourthValueLocation
        },
        {
          type: "register",
          value: configuration.thirdValueLocation
        },
        {
          type: "register",
          value: configuration.fourthValueLocation
        }
      ]
    },
    {
      opcode: Opcodes.FUN,
      arguments: [
        {
          type: "func",
          value: "u32ToU8-loop"
        }
      ]
    },
    {
      opcode: Opcodes.EQL,
      arguments: [
        {
          type: "register",
          value: configuration.fourthValueLocation
        },
        {
          type: "register",
          value: Registers.c0
        },
        {
          type: "register",
          value: configuration.thirdValueLocation
        }
      ]
    },
    {
      opcode: Opcodes.RET,
      arguments: [
        {
          type: "register",
          value: configuration.thirdValueLocation
        }
      ]
    },
    {
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "func",
          value: "u32ToU8-loopwrap"
        },
        {
          type: "register",
          value: Registers.pc
        }
      ]
    }
  ]

  il["u32ToU8-loop"] = [
    {
      opcode: Opcodes.RSB,
      arguments: [
        {
          type: "register",
          value: configuration.firstValueLocation,
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
    },
    {
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
    },
    {
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
          value: configuration.secondValueLocation,
        },
      ],
    },
    {
      opcode: Opcodes.SPU,
      arguments: [
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
      ],
    },
    {
      opcode: Opcodes.RET,
      arguments: [
        {
          type: "register",
          value: Registers.c1
        }
      ]
    }
  ];
}
