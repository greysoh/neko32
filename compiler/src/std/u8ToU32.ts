import { type File, Opcodes, Registers } from "../libs/il.js";
import type { Configuration } from "../libs/types.js";

// FIXME BEFORE PUSH:
// code is written to 32 - 8 instead of 0 + 8

export function loadU8ToU32(il: File, configuration: Configuration) {
  if (il["u8ToU32"]) return;

  // Using RMV shortens the file size by 6 bytes
  il["u8ToU32"] = [
    {
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: Registers.c0,
        },
        {
          type: "register",
          value: configuration.firstValueLocation,
        },
      ],
    },
    {
      opcode: Opcodes.RMV,
      arguments: [
        {
          type: "register",
          value: Registers.c0,
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
          value: "u8ToU32-loopwrap"
        }
      ]
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

  il["u8ToU32-loopwrap"] = [
    {
      opcode: Opcodes.FUN,
      arguments: [
        {
          type: "func",
          value: "u8ToU32-loop"
        }
      ]
    },
    {
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: 8
        },
        {
          type: "register",
          value: configuration.secondValueLocation
        }
      ]
    },
    {
      opcode: Opcodes.ADD,
      arguments: [
        {
          type: "register",
          value: configuration.fourthValueLocation
        },
        {
          type: "register",
          value: configuration.secondValueLocation
        },
        {
          type: "register",
          value: configuration.fourthValueLocation
        }
      ]
    },
    {
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "u32",
          value: 32
        },
        {
          type: "register",
          value: configuration.thirdValueLocation
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
          value: configuration.thirdValueLocation
        },
        {
          type: "register",
          value: configuration.secondValueLocation
        }
      ]
    },
    {
      opcode: Opcodes.RET,
      arguments: [
        {
          type: "register",
          value: configuration.secondValueLocation
        }
      ]
    },
    {
      opcode: Opcodes.REW,
      arguments: [
        {
          type: "func",
          value: "u8ToU32-loopwrap"
        },
        {
          type: "register",
          value: Registers.pc
        }
      ]
    }
  ]

  il["u8ToU32-loop"] = [
    {
      opcode: Opcodes.SPO,
      arguments: [],
    },
    {
      opcode: Opcodes.SPE,
      arguments: [
        {
          type: "register",
          value: configuration.secondValueLocation,
        },
      ],
    },
    {
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
    },
    {
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
          value: configuration.firstValueLocation,
        },
      ],
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
}