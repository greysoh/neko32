import { readFile, writeFile } from "node:fs/promises";

import { Memory, MMIOCallbackWrite } from "./Core/Memory.js";
import { type Instruction, CPU, getInstructionLength } from "./Core/CPU.js";

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

const rawInstructions: Instruction[] = [];
const potentialFunctions = [0]; // NOTE: This could be a Set(), but I don't know how to do that, and I want this done. PRs welcome.

let outputAssembly = '#include "neko32/cpu.asm"\n\n; Decompiled code. Be advised. This code may not compile.\n\n';

while (cpu.registers[0] < file.length) {
  const fetchedInstruction = cpu.fetch();
  const decodedInstruction = cpu.decode(fetchedInstruction);

  if (decodedInstruction.opcode == RealOpcodes.funct && decodedInstruction.arguments[0] < file.length) {
    // Getting the raw value on where the program itself jumps to doesn't work because we need where the array position is.
    // FIXME: So, we have to calculate it manually. However this is slow, by a lot. It would be faster potentially if we move this
    // calculation out of here.

    let memoryPosition = 0;
    let arrayHops = -1;

    while (memoryPosition < decodedInstruction.arguments[0]) {
      arrayHops += 1;
      memoryPosition += getInstructionLength(file[memoryPosition]) + 1;
    }

    if (!potentialFunctions.includes(arrayHops)) potentialFunctions.push(arrayHops);
  }

  rawInstructions.push(decodedInstruction);
  cpu.registers[0] += decodedInstruction.argumentLen + 1;
};

potentialFunctions.sort();
const functionTrees: Record<string, Instruction[]> = {};

console.log("[main] Resolving functions");

for (const potentialFunctionIndex in potentialFunctions) {
  const functionTreeName = "estimated_dis_" + potentialFunctionIndex;
  functionTrees[functionTreeName] = [];
  
  const potentialFunction = potentialFunctions[potentialFunctionIndex];
  const nextFunctionIndex = parseInt(potentialFunctionIndex) + 1;

  const nextFunction = nextFunctionIndex >= potentialFunctions.length ? rawInstructions.length : potentialFunctions[nextFunctionIndex];

  for (let functionIndex = potentialFunction; functionIndex < nextFunction; functionIndex++) {
    const instruction = rawInstructions[functionIndex];
    functionTrees[functionTreeName].push(instruction);
  }
}

for (const treeIndex of Object.keys(functionTrees)) {
  const tree = functionTrees[treeIndex];
  outputAssembly += treeIndex + ":\n";

  for (const decodedInstruction of tree) {
    const opcodeName = RealOpcodes[decodedInstruction.opcode];

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
  }
}

console.log("[main] Writing file...");

await writeFile("./a.out.asm", outputAssembly);
process.exit(0);