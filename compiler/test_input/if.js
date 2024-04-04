function main() {
  CPU.registers[6] = 0;

  if (CPU.registers[6] === 0) {
    CPU.registers[7] = CPU.registers[7] + 24;
    CPU.registers[6] = 1;
  } else if (CPU.registers[7] === 1) {
    CPU.registers[8] = 20;
  } else {
    CPU.registers[9] = 20;
  }

  CPU.jump(main);
}
