import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";

import { CPU, Opcodes } from "./Core/CPU.js";
import { MMIOCallbackWrite, Memory } from "./Core/Memory.js";
import { KeyboardIO } from "./MMIODevices/KeyboardIO.js";
import { MMIOBinder } from "./MMIODevices/MMIOBinder.js";

console.log("[init] Init devices");

let file: Buffer | undefined;

const memoryBase = new Uint8Array(16 * 1024 * 1024);
const memory = new Memory(memoryBase);

const registers = new Uint32Array(37);

const cpu = new CPU(memory, registers);

memory.configureMMIO(0, 4094, (event, address, value) => {
  if (!file) return 0;

  if (event == MMIOCallbackWrite)
    throw new Error("Attempted to write to read only memory");
  if (address >= file.length) return 0;

  return file[address];
});

const binder = new MMIOBinder();
binder.initMemoryMMIO(memory);

binder.addMMIODevice(new KeyboardIO());

const readline = createInterface({
  input: process.stdin, //or fileStream
  output: process.stdout,
});

console.log("[init] Ready");
console.log("NEKO-32 Developer Console");
console.log("Happy debugging!\n");

process.stdout.write("$ ");

type Command = {
  name: string;
  description: string;
  usage: string;
  run: Function;
};
const commands: Command[] = [
  {
    name: "clear",
    description: "clear the screen.",
    usage: "clear",
    run() {
      console.clear();
    },
  },
  {
    name: "load-rom",
    description: "load a rom file.",
    usage: "load-rom <rom>",
    async run(args: string[]) {
      if (!args[1]) {
        console.error("File not specified!");
        return;
      }

      try {
        const romFile = await readFile(args[1]);

        if (romFile.length > 4096) {
          console.error("File is too big!");
          return;
        }

        file = romFile;
      } catch (e) {
        console.error("Error reading file!");
        console.log(e);
        return;
      }

      console.log("Loaded ROM file.");
    },
  },
  {
    name: "step",
    description: "runs the cpu stepCount cycles. by default, one.",
    usage: "step [stepCount]",
    run(args: string[]) {
      const stepCount = args[1] ? parseInt(args[1]) : 1;

      for (var i = 0; i < stepCount; i++) {
        cpu.tick();
      }
    },
  },
  {
    name: "dis",
    description: "print current instruction that is being excuted.",
    usage: "dis",
    run() {
      const fetchedInstruction = cpu.fetch();
      const decodedInstruction = cpu.decode(fetchedInstruction);

      const foundInstructionOpcodes: string[] = Object.keys(Opcodes);
      console.log(
        foundInstructionOpcodes[decodedInstruction.opcode + 25].toLowerCase() +
          " " +
          decodedInstruction.arguments.join(" "),
      );
    },
  },
  {
    name: "mem_read",
    description: "read the memory.",
    usage: "mem_read <position>",
    run(args: string[]) {
      console.log(memory.get(parseInt(args[1])));
    },
  },
  {
    name: "reg_read",
    description: "read a register.",
    usage: "reg_read <register>",
    run(args: string[]) {
      console.log(registers[parseInt(args[1])]);
    },
  },
  {
    name: "mem_write",
    description: "write to the memory.",
    usage: "mem_write <position> <value>",
    run(args: string[]) {
      memory.set(parseInt(args[1]), parseInt(args[2]));
    },
  },
  {
    name: "reg_write",
    description: "write to a register.",
    usage: "reg_write <register> <value>",
    run(args: string[]) {
      registers[parseInt(args[1])] = parseInt(args[2]);
    },
  },
  {
    name: "branch_list",
    description: "get the list of internal cpu branches.",
    usage: "branch_list",
    run() {
      console.log(cpu.branchLog.join(" "));
    },
  },
  {
    name: "help",
    description: "prints this help message.",
    usage: "help [command]",
    run(args: string[]) {
      if (!args[1]) {
        console.log("command list:");
        commands.forEach(element => {
          console.log(`${element.name}: ${element.description}`);
        });
      } else {
        let commandid = commands.findIndex(
          el => el.name.toLowerCase() == args[1],
        );
        let command = commands[commandid];
        console.log(`${command.name}: ${command.description}`);
        console.log(`usage: ${command.usage}`);
      }
    },
  },
  {
    name: "exit",
    description: "exits the console.",
    usage: "exit",
    run() {
      process.exit(0);
    },
  },
];

for await (const line of readline) {
  if (line.trim() == "") {
    process.stdout.write("$ ");
    continue;
  }
  const splitCommand = line.split(" ");

  let command =
    commands[
      commands.findIndex(el => el.name.toLowerCase() == splitCommand[0])
    ];

  if (!command) {
    console.log("Unknown command. Run 'help' to get a list of all commands.");
  } else {
    await command.run(splitCommand);
  }

  process.stdout.write("$ ");
}
