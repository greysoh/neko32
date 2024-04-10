export enum Opcodes {
  NOP = 0,
  RET,
  FUN,

  EQL,
  INV,
  GHT,
  REW,
  MEW,
  RMV,
  MMV,
  MCP,

  SPU,
  SPE,
  SPO,

  LSB,
  RSB,
  NOT,
  AND,
  ORB,
  XOR,

  ADD,
  SUB,
  MUL,
  DIV,
  MOD,
}

export enum Registers {
  pc = 0x00, // Program counter
  sp, // Stack pointer
  ex, // Exception value (normally 0, if left unchecked)
  c0, // Constant set to 0
  c1, // Constant set to 1

  // Usable registers
  r0,
  r1,
  r2,
  r3,
  r4,
  r5,
  r6,
  r7,
  r8,
  r9,
  r10,
  r11,
  r12,
  r13,
  r14,
  r15,
  r16,
  r17,
  r18,
  r19,
  r20,
  r21,
  r22,
  r23,
  r24,
  r25,
  r26,
  r27,
  r28,
  r29,
  r30,
  r31,
}

export type Argument = {
  type: "u8" | "u32" | "func" | "register";
  value: number | string; // if func, should be string
};

export type Expression = {
  opcode: number;
  arguments: Argument[];
};

export type File = Record<string, Expression[]>;

function toU32(num: number): number[] {
  const data: number[] = [];

  // Use bitwise operations to extract individual bytes
  data[0] = (num >> 24) & 0xff;
  data[1] = (num >> 16) & 0xff;
  data[2] = (num >> 8) & 0xff;
  data[3] = num & 0xff;

  return data;
}

export function writeIL(file: File): Uint8Array {
  const data: number[] = [];

  const positionsToFigureOut: Record<number, string> = {};
  const functionPositions: Record<string, number> = {};

  for (const key of Object.keys(file)) {
    const fileEntry = file[key];
    functionPositions[key] = data.length;

    for (const expression of fileEntry) {
      const expressionBuilt: number[] = [];
      expressionBuilt.push(expression.opcode);

      for (const argument of expression.arguments) {
        if (argument.type == "u8") {
          if (typeof argument.value != "number") {
            throw new Error("u8 should be a number");
          }

          expressionBuilt.push(argument.value);
        } else if (argument.type == "register") {
          if (typeof argument.value != "number") {
            throw new Error("Register should be a number");
          } else if (argument.value > 36 || argument.value < 0) {
            throw new Error("Register out of range");
          }

          expressionBuilt.push(argument.value);
        } else if (argument.type == "u32") {
          if (typeof argument.value != "number") {
            throw new Error("u32 should be a number");
          }

          expressionBuilt.push(...toU32(argument.value));
        } else if (argument.type == "func") {
          if (typeof argument.value != "string") {
            throw new Error("func should be a string");
          } else if (!file[argument.value]) {
            throw new Error(`could not find the function: '${argument.value}'`);
          }

          const calculatedLength = data.length + expressionBuilt.length - 2;

          expressionBuilt.push(0, 0, 0, 0);
          positionsToFigureOut[calculatedLength] = argument.value;
        }
      }

      data.push(...expressionBuilt);
    }
  }

  for (const positionRawKey of Object.keys(positionsToFigureOut)) {
    const realPosiiton: number = parseInt(positionRawKey);
    const functionPosition: number =
      functionPositions[positionsToFigureOut[realPosiiton]];

    if (typeof functionPosition == "undefined") {
      throw new Error(
        "Undefined function: " + positionsToFigureOut[realPosiiton],
      );
    }

    data.splice(realPosiiton - 2, 4, ...toU32(functionPosition));
  }

  if (data.length > 4096) {
    console.warn(
      "WARN: ROM is too big to fit in dedicated memory! This may not be a problem, if you're using MMIO. See: docs todo",
    );
  }
  
  return new Uint8Array(data);
}
