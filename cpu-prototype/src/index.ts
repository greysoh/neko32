import { readFile } from "node:fs/promises";

import { Memory, MMIOCallbackWrite } from "./Core/Memory.js";
import { MMIOBinder } from "./MMIODevices/MMIOBinder.js";
import { KeyboardIO } from "./MMIODevices/KeyboardIO.js";
import { CPU } from "./Core/CPU.js";

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

const binder = new MMIOBinder();
binder.initMemoryMMIO(memory);

binder.addMMIODevice(new KeyboardIO());

console.log("[init] Starting CPU...");

while (true) {
  cpu.tick();
}
