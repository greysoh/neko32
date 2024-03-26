function main() {
  CPU.registers[7];
  CPU.registers[9] = 4;

  CPU.jump(main);
}