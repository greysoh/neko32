function main() {
  CPU.registers[6] = 10024;
  CPU.jump(real);
}

function real() {
  CPU.registers[6] = CPU.registers[6] + 2;
  CPU.memory[CPU.registers[6]] = 128;

  CPU.jump(real);
}
