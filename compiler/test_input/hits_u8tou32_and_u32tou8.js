function main() {
  CPU.registers[6] = 4;
  CPU.registers[7] = 6;
  CPU.registers[8] = 12;

  CPU.registers[9] = CPU.registers[6] + CPU.registers[7] + CPU.registers[8];

  CPU.jump(nopLoop);
}

function nopLoop() {
  CPU.jump(nopLoop);
}
