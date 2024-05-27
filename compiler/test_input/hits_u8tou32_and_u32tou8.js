import {} from "std:u32ToU8";
import {} from "std:u8ToU32";

function main() {
  CPU.registers[33] = 2048;
  u32ToU8();
  u8ToU32();

  CPU.jump(nopLoop);
}

function nopLoop() {
  CPU.jump(nopLoop);
}
