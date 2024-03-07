import { readFile, stat } from "node:fs/promises";

import { Memory, MMIOCallbackRead, MMIOCallbackWrite } from "./Core/Memory.js";
import { CPU } from "./Core/CPU.js";

if (!process.argv[2]) {
  console.log("Usage: <process> file.bin");
  process.exit(1);
}

const file = await readFile(process.argv[2]);

const memoryBase = new Uint8Array(16*1024*1024);
const memory = new Memory(memoryBase);

const registers = new Uint32Array(36);

const cpu = new CPU(memory, registers);

console.log("[init] Mapping memory...");
memory.configureMMIO(0, 4096, (event, address, value) => {
  if (event == MMIOCallbackWrite) throw new Error("Attempted to write to read only memory");
  if (address >= file.length) return 0;

  return file[address];
});

console.log("[init] Starting CPU...");
while (true) {
  console.log(registers[5]);
  cpu.tick();
}