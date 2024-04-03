import type { Memory } from "./Memory";

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

export type Instruction = {
  opcode: number;

  arguments: number[];
  argumentLen: number;
};

export function getInstructionLength(instruction: number): number {
  if (instruction == Opcodes.NOP || instruction == Opcodes.SPO) return 0;

  if (instruction == Opcodes.EQL || instruction == Opcodes.GHT) return 3;
  if (instruction >= Opcodes.MEW && instruction <= Opcodes.MCP) return 2;

  if (instruction == Opcodes.SPU || instruction == Opcodes.SPE) return 1;
  if (instruction >= Opcodes.LSB && instruction <= Opcodes.MOD) return 3;

  if (instruction == Opcodes.REW) return 5;
  if (instruction == Opcodes.FUN) return 4;
  if (instruction == Opcodes.INV) return 2;
  if (instruction == Opcodes.RET) return 1;

  throw new Error("Out of range for opcode: " + instruction);
}

function u32ToInt(list: number[]): number {
  return (list[0] << 24) | (list[1] << 16) | (list[2] << 8) | list[3];
}

export class CPU {
  memory: Memory;
  registers: Uint32Array;

  branchLog: number[];

  constructor(memory: Memory, registers: Uint32Array) {
    this.memory = memory;
    this.registers = registers;

    this.registers[1] = 8192;

    this.branchLog = [];
  }

  fetch(): number[] {
    return this.memory.getBulk(this.registers[0], this.registers[0] + 8);
  }

  decode(fetchedInstruction: number[]): Instruction {
    const instructionLength = getInstructionLength(fetchedInstruction[0]);

    if (fetchedInstruction[0] == Opcodes.REW) {
      return {
        opcode: fetchedInstruction[0],
        arguments: [
          u32ToInt(fetchedInstruction.slice(1, instructionLength + 1)),
          fetchedInstruction[instructionLength],
        ],

        argumentLen: instructionLength,
      };
    } else if (fetchedInstruction[0] == Opcodes.FUN) {
      return {
        opcode: fetchedInstruction[0],
        arguments: [
          u32ToInt(fetchedInstruction.slice(1, instructionLength + 1)),
        ],

        argumentLen: instructionLength,
      };
    } else {
      return {
        opcode: fetchedInstruction[0],
        arguments: fetchedInstruction.slice(1, instructionLength + 1),

        argumentLen: instructionLength,
      };
    }
  }

  execute(instruction: Instruction): void {
    this.registers[0] += instruction.argumentLen + 1; // Account for instruction

    switch (instruction.opcode) {
      default: {
        throw new Error("Illegal instruction");
      }

      case Opcodes.NOP: {
        break;
      }

      case Opcodes.RET: {
        if (this.registers[instruction.arguments[0]]) {
          const lastBranch = this.branchLog.pop();
          if (!lastBranch) throw new Error("Nothing to branch to");

          this.registers[0] = lastBranch;
        }

        break;
      }

      case Opcodes.FUN: {
        this.branchLog.push(this.registers[0]);
        this.registers[0] = instruction.arguments[0];

        break;
      }

      case Opcodes.EQL: {
        this.registers[instruction.arguments[2]] = Number(
          this.registers[instruction.arguments[0]] ==
            this.registers[instruction.arguments[1]],
        );
        
        break;
      }

      case Opcodes.INV: {
        this.registers[instruction.arguments[1]] = Number(
          !this.registers[instruction.arguments[0]],
        );

        break;
      }

      case Opcodes.GHT: {
        this.registers[instruction.arguments[2]] = Number(
          this.registers[instruction.arguments[0]] >
            this.registers[instruction.arguments[1]],
        );

        break;
      }

      case Opcodes.REW: {
        this.registers[instruction.arguments[1]] = instruction.arguments[0];
        break;
      }

      case Opcodes.RMV: {
        this.registers[instruction.arguments[1]] =
          this.registers[instruction.arguments[0]];

        break;
      }

      case Opcodes.MEW: {
        if (this.memory.length <= this.registers[instruction.arguments[1]]) {
          this.registers[1] = 2;
          break;
        }

        this.memory.set(
          this.registers[instruction.arguments[1]],
          this.registers[instruction.arguments[0]],
        );

        break;
      }

      case Opcodes.MCP: {
        if (this.memory.length <= this.registers[instruction.arguments[0]]) {
          this.registers[instruction.arguments[1]] = 255;
          this.registers[1] = 1;

          break;
        }

        this.registers[instruction.arguments[1]] = this.memory.get(
          this.registers[instruction.arguments[0]],
        );

        break;
      }

      case Opcodes.SPU: {
        if (this.registers[1] > 9999)
          throw new Error("Limit over threshold in vCPU stack");
        if (this.registers[1] < 8191)
          throw new Error("Limit under threshold in vCPU stack");

        if (this.memory.length <= this.registers[instruction.arguments[1]]) {
          this.registers[1] = 2;
          break;
        }

        this.memory.set(this.registers[1], this.registers[instruction.arguments[0]]);
        this.registers[1]++;

        break;
      }

      case Opcodes.SPE: {
        if (this.memory.length <= this.registers[instruction.arguments[1]]) {
          this.registers[instruction.arguments[1]] = 255;
          this.registers[1] = 1;

          break;
        }

        this.registers[instruction.arguments[0]] = this.memory.get(
          this.registers[1],
        );
        
        break;
      }

      case Opcodes.SPO: {
        this.registers[1]--;
        break;
      }

      case Opcodes.LSB: {
        this.registers[instruction.arguments[2]] =
          this.registers[instruction.arguments[0]] <<
          this.registers[instruction.arguments[1]];
        
        break;
      }

      case Opcodes.RSB: {
        this.registers[instruction.arguments[2]] =
          this.registers[instruction.arguments[0]] >>
          this.registers[instruction.arguments[1]];

        break;
      }

      case Opcodes.NOT: {
        this.registers[instruction.arguments[1]] =
          ~this.registers[instruction.arguments[0]];

        break;
      }

      case Opcodes.AND: {
        this.registers[instruction.arguments[2]] =
          this.registers[instruction.arguments[0]] &
          this.registers[instruction.arguments[1]];

        break;
      }

      case Opcodes.ORB: {
        this.registers[instruction.arguments[2]] =
          this.registers[instruction.arguments[0]] |
          this.registers[instruction.arguments[1]];

        break;
      }

      case Opcodes.XOR: {
        this.registers[instruction.arguments[2]] =
          this.registers[instruction.arguments[0]] ^
          this.registers[instruction.arguments[1]];

        break;
      }

      case Opcodes.ADD: {
        this.registers[instruction.arguments[2]] =
          this.registers[instruction.arguments[0]] +
          this.registers[instruction.arguments[1]];

        break;
      }

      case Opcodes.SUB: {
        this.registers[instruction.arguments[2]] =
          this.registers[instruction.arguments[0]] -
          this.registers[instruction.arguments[1]];

        break;
      }

      case Opcodes.MUL: {
        this.registers[instruction.arguments[2]] =
          this.registers[instruction.arguments[0]] *
          this.registers[instruction.arguments[1]];

        break;
      }

      case Opcodes.DIV: {
        this.registers[instruction.arguments[2]] = Math.floor(
          this.registers[instruction.arguments[0]] /
            this.registers[instruction.arguments[1]],
        );

        break;
      }

      case Opcodes.MOD: {
        this.registers[instruction.arguments[2]] =
          this.registers[instruction.arguments[0]] %
          this.registers[instruction.arguments[1]];

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
