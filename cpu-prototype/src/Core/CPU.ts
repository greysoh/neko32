import type { Memory } from "./Memory";

enum Opcodes {
  NOP = 0,
  RET,

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

type Instruction = {
  opcode: number,

  arguments: number[],
  argumentLen: number
}

function getInstructionLength(instruction: number): number {
  if (instruction == Opcodes.RET) return 1;
  if (instruction == Opcodes.NOP || instruction == Opcodes.SPO) return 0;

  if (instruction == Opcodes.EQL || instruction == Opcodes.GHT) return 3;
  if (instruction >= Opcodes.MEW && instruction <= Opcodes.MMV) return 2;

  if (instruction == Opcodes.REW) return 5;

  if (instruction == Opcodes.SPU || instruction == Opcodes.SPO) return 1;
  if (instruction >= Opcodes.LSB && instruction <= Opcodes.MOD) return 3;

  throw new Error("Out of range");
}

function u32ToInt(list: number[]): number {
  return list[0] * (Math.pow(256, 3)) + list[1] * (Math.pow(256, 2)) + list[2] * 256 + list[3];
}

export class CPU {
  memory: Memory;
  registers: Uint32Array;

  constructor(memory: Memory, registers: Uint32Array) {
    this.memory = memory;
    this.registers = registers;
  }

  fetch(): number[] {
    return this.memory.getBulk(this.registers[0], this.registers[0] + 8);
  }

  decode(fetchedInstruction: number[]): Instruction {
    if (fetchedInstruction[0] == Opcodes.REW) {
      const instructionLength = getInstructionLength(fetchedInstruction[0]);
      return {
        opcode: fetchedInstruction[0],
        arguments: [u32ToInt(fetchedInstruction.slice(1, instructionLength + 1)), fetchedInstruction[instructionLength]],

        argumentLen: instructionLength
      }
    } else {
      const instructionLength = getInstructionLength(fetchedInstruction[0]);

      return {
        opcode: fetchedInstruction[0],
        arguments: fetchedInstruction.slice(1, instructionLength + 1),

        argumentLen: instructionLength
      }
    }
  }

  execute(instruction: Instruction): void {
    this.registers[0] += instruction.argumentLen + 1; // Account for instruction

    switch (instruction.opcode) {
      default: {
        throw new Error("Illegal instruction")
      }

      case Opcodes.NOP: {
        break;
      }

      case Opcodes.RET: {
        break; // TODOv
      }

      case Opcodes.EQL: {
        this.registers[instruction.arguments[2]] = Number(this.registers[instruction.arguments[0]] == this.registers[instruction.arguments[1]]);
        break;
      }

      case Opcodes.INV: {
        this.registers[instruction.arguments[1]] = Number(!this.registers[instruction.arguments[0]]);
        break;
      }

      case Opcodes.GHT: {
        this.registers[instruction.arguments[2]] = Number(this.registers[instruction.arguments[0]] > this.registers[instruction.arguments[1]])
        break;
      }

      case Opcodes.REW: {
        this.registers[instruction.arguments[1]] = instruction.arguments[0];
        break;
      }

      case Opcodes.RMV: {
        this.registers[instruction.arguments[1]] = this.registers[instruction.arguments[0]];
        break;
      }

      case Opcodes.MEW: {
        this.memory.set(this.registers[instruction.arguments[0]], this.registers[instruction.arguments[1]]);
        break;
      }

      case Opcodes.SPU: {
        this.memory.set(this.registers[1], instruction.arguments[0]);
        this.registers[1]++;

        break;
      }

      case Opcodes.SPE: {
        this.registers[instruction.arguments[0]] = this.memory.get(this.registers[1]);
        break;
      }

      case Opcodes.SPO: {
        this.registers[1]--;
        break;
      }
      
      case Opcodes.LSB: {
        this.registers[instruction.arguments[2]] = this.registers[instruction.arguments[0]] << this.registers[instruction.arguments[1]];
        break;
      }

      case Opcodes.RSB: {
        this.registers[instruction.arguments[2]] = this.registers[instruction.arguments[0]] >> this.registers[instruction.arguments[1]];
        break;
      }
      
      case Opcodes.NOT: {
        this.registers[instruction.arguments[1]] = ~this.registers[instruction.arguments[0]];
        break;
      }

      case Opcodes.AND: {
        this.registers[instruction.arguments[2]] = this.registers[instruction.arguments[0]] & this.registers[instruction.arguments[1]];
        break;
      }

      case Opcodes.ORB: {
        this.registers[instruction.arguments[2]] = this.registers[instruction.arguments[0]] | this.registers[instruction.arguments[1]];
        break;
      }

      case Opcodes.XOR: {
        this.registers[instruction.arguments[2]] = this.registers[instruction.arguments[0]] ^ this.registers[instruction.arguments[1]];
        break;
      }

      case Opcodes.ADD: {
        this.registers[instruction.arguments[2]] = this.registers[instruction.arguments[0]] + this.registers[instruction.arguments[1]];
        break;
      }

      case Opcodes.SUB: {
        this.registers[instruction.arguments[2]] = this.registers[instruction.arguments[0]] - this.registers[instruction.arguments[1]];
        break;
      }

      case Opcodes.MUL: {
        this.registers[instruction.arguments[2]] = Math.floor(this.registers[instruction.arguments[0]] * this.registers[instruction.arguments[1]]);
        break;
      }

      case Opcodes.DIV: {
        this.registers[instruction.arguments[2]] = Math.floor(this.registers[instruction.arguments[0]] / this.registers[instruction.arguments[1]]);
        break;
      }

      case Opcodes.DIV: {
        this.registers[instruction.arguments[2]] = this.registers[instruction.arguments[0]] % this.registers[instruction.arguments[1]];
        break;
      }
    }

    this.registers[3] = 0;
    this.registers[4] = 1;
  }
  
  reset(): void {
    this.memory.clear();
  }

  tick() {
    this.execute(this.decode(this.fetch()));
  }
}