import { createInterface } from "node:readline/promises";
import { readFile } from "node:fs/promises";

import { Memory, MMIOCallbackWrite } from "./Core/Memory.js";
import { MMIOBinder } from "./MMIODevices/MMIOBinder.js";
import { KeyboardIO } from "./MMIODevices/KeyboardIO.js";
import { CPU, Opcodes } from "./Core/CPU.js";

console.log("[init] Init devices");

let file: Buffer | undefined;

const memoryBase = new Uint8Array(16*1024*1024);
const memory = new Memory(memoryBase);

const registers = new Uint32Array(36);

const cpu = new CPU(memory, registers);

memory.configureMMIO(0, 4094, (event, address, value) => {
  if (!file) return 0;

  if (event == MMIOCallbackWrite) throw new Error("Attempted to write to read only memory");
  if (address >= file.length) return 0;

  return file[address];
});

const binder = new MMIOBinder();
binder.initMemoryMMIO(memory);

binder.addMMIODevice(new KeyboardIO());

const readline = createInterface({
  input: process.stdin, //or fileStream 
  output: process.stdout
});

console.log("[init] Ready");
console.log("NEKO-32 Developer Console");
console.log("Happy debugging!\n");

process.stdout.write("$ ");

for await (const line of readline) {
  const splitCommand = line.split(" ");

  switch (splitCommand[0]) {
    default: {
      console.log("Unknown command.");
      break;
    }

    case "": {
      break;
    }

    case "clear": {
      console.clear();
      break;
    }

    case "load-rom": {
      if (!splitCommand[1]) {
        console.error("File not specified!");
        break;
      }

      try {
        const romFile = await readFile(splitCommand[1]);

        if (romFile.length > 4096) {
          console.error("File is too big!");
          break;
        }

        file = romFile;
      } catch (e) {
        console.error("Error reading file!");
        console.log(e);
        break;
      }

      console.log("Loaded ROM file.");

      break; 
    }

    case "step": {
      const stepCount = splitCommand[1] ? parseInt(splitCommand[1]) : 1;

      for (var i = 0; i < stepCount; i++) {
        cpu.tick();
      }

      break;
    }

    case "dis": {
      const fetchedInstruction = cpu.fetch();
      const decodedInstruction = cpu.decode(fetchedInstruction);
      
      const foundInstructionOpcodes: string[] = Object.keys(Opcodes);
      console.log(foundInstructionOpcodes[decodedInstruction.opcode + 24].toLowerCase() + " " + decodedInstruction.arguments.join(" "));

      break;
    }

    case "mem_read": {
      console.log(memory.get(parseInt(splitCommand[1])));
      break;
    }

    case "reg_read": {
      console.log(registers[parseInt(splitCommand[1])]);
      break;
    }
  }

  process.stdout.write("$ ");
}