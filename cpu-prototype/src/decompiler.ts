import { readFile, writeFile } from "node:fs/promises";

import { Memory, MMIOCallbackWrite } from "./Core/Memory.js";
import { CPU } from "./Core/CPU.js";

enum RealOpcodes {
  nop = 0,
  return,
  funct,

  equals,
  invert,
  grt_thn,
  reg_wri,
  mem_wri,
  reg_mov,
  mem_mov,
  mem_cpy,

  stack_push,
  stack_peek,
  stack_pop,

  bit_left,
  bit_right,
  bit_not,
  bit_and,
  bit_or,
  bit_xor,

  math_add,
  math_sub,
  math_mul,
  math_div,
  math_mod,
}

enum RealRegisters {
  pc = 0x00,
  sp,
  ex,

  c0,
  c1,

  r0 = 0x05,
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

type FunctionArgumentArray = ("u32" | "register")[];
type FunctionArguments = Record<string, FunctionArgumentArray>;

const functionArguments: FunctionArguments = {
    "nop": [],
    "return": ["register"],
    "funct": ["u32"],

    "equals": ["register", "register", "register"],
    "invert": ["register", "register"],
    "grt_thn": ["register", "register", "register"],

    "reg_wri": ["u32", "register"],
    "mem_wri": ["register", "register"],
    "reg_mov": ["register", "register"],
    "mem_mov": ["register", "register"],
    "mem_cpy": ["register", "register"],

    "stack_push": ["register"],
    "stack_peek": ["register"],
    "stack_pop": [],

    "bit_left": ["register", "register", "register"],
    "bit_right": ["register", "register", "register"],
    "bit_not": ["register", "register"],
    "bit_and": ["register", "register", "register"],
    "bit_or": ["register", "register", "register"],
    "bit_xor": ["register", "register", "register"],

    "math_add": ["register", "register", "register"],
    "math_sub": ["register", "register", "register"],
    "math_mul": ["register", "register", "register"],
    "math_div": ["register", "register", "register"],
    "math_mod": ["register", "register", "register"]
};

if (!process.argv[2]) {
  console.log("Usage: <process> file.bin");
  process.exit(1);
}

console.log("[init] Mapping memory...");

const file = await readFile(process.argv[2]);

const memoryBase = new Uint8Array(16 * 1024 * 1024);
const memory = new Memory(memoryBase);

const registers = new Uint32Array(37);

const cpu = new CPU(memory, registers);

memory.configureMMIO(0, 4094, (event, address, value) => {
  if (event == MMIOCallbackWrite)
    throw new Error("Attempted to write to read only memory");
  if (address >= file.length) return 0;

  return file[address];
});

console.log("[main] Starting decompilation");

let outputAssembly = '#include "neko32/cpu.asm"\n\n; Decompiled code. Be advised. This code may not compile.\n\nmain:\n';

while (cpu.registers[0] < file.length) {
  const fetchedInstruction = cpu.fetch();
  const decodedInstruction = cpu.decode(fetchedInstruction);

  const opcodeName = RealOpcodes[decodedInstruction.opcode]

  let newInstructionLine = opcodeName + " ";

  for (const argumentIndex in decodedInstruction.arguments) {
    const argument = decodedInstruction.arguments[argumentIndex];
    const argumentType = functionArguments[opcodeName][argumentIndex];
    
    if (argumentType == "register") {
      newInstructionLine += RealRegisters[argument] + " ";
    } else if (argumentType == "u32") {
      newInstructionLine += argument + " ";
    }
  }

  newInstructionLine += "\n";
  outputAssembly += newInstructionLine;

  cpu.registers[0] += decodedInstruction.argumentLen + 1;
};

console.log("[main] Writing file...");

await writeFile("./a.out.asm", outputAssembly);
process.exit(0);