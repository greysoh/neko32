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
  MOD
}

export type Argument = {
  type: "u8" | "u32" | "func",
  value: number | string // if func, should be string
}

export type Expression = {
  opcode: number,
  arguments: Argument[]
}

export type File = Record<string, Expression[]>;

function toU32(num: number): number[] {
  const data: number[] = [];

  // Use bitwise operations to extract individual bytes
  data[0] = (num >> 24) & 0xFF;
  data[1] = (num >> 16) & 0xFF;
  data[2] = (num >> 8) & 0xFF;
  data[3] = num & 0xFF;

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
          if (typeof argument.value != "number") throw new Error("u8 should be a number");
          expressionBuilt.push(argument.value);
        } else if (argument.type == "u32") {
          if (typeof argument.value != "number") throw new Error("u32 should be a number");
          expressionBuilt.push(...toU32(argument.value));
        } else if (argument.type == "func") {
          if (typeof argument.value != "string") throw new Error("func should be a string");
          if (!file[argument.value]) throw new Error("could not find the function");

          expressionBuilt.push(0, 0, 0, 0);
          positionsToFigureOut[data.length + expressionBuilt.length] = argument.value;
        }
      }

      data.push(...expressionBuilt);
    }
  }

  for (const positionRawKey of Object.keys(positionsToFigureOut)) {
    const positionKey: number = parseInt(positionRawKey);
    const position = positionsToFigureOut[positionKey];
    
    const functionPosition = functionPositions[position];
    
    data.splice(functionPosition, 4, ...toU32(functionPosition));
  }

  if (data.length > 4096) throw new Error("Rom is too big!");
  return new Uint8Array(data);
}