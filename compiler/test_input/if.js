function main() {
  CPU.registers[6] = 0;

  if (CPU.registers[6] === 0) {
    CPU.registers[7] = CPU.registers[7] + 24;
    CPU.registers[6] = 1;
  }

  CPU.jump(main);
}
