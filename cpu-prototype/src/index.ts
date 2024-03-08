import { readFile } from "node:fs/promises";

import { Memory, MMIOCallbackWrite } from "./Core/Memory.js";
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

memory.configureMMIO(0, 4095, (event, address, value) => {
  if (event == MMIOCallbackWrite) throw new Error("Attempted to write to read only memory");
  if (address >= file.length) return 0;

  return file[address];
});

memory.configureMMIO(4096, 8191, (event, address, value) => {
  if (!value) return 0;
  process.stdout.write(String.fromCharCode(value));

  return 0;
});

console.log("[init] Starting CPU...");

while (true) {
  console.log("current number: " + registers[6]);

  cpu.tick();
}