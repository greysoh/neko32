function main() {
  if (CPU.registers[5] === 0) {
    CPU.registers[5] = 1;
  }

  CPU.registers[5] = CPU.registers[5] * 2;
  CPU.jump(main);
}