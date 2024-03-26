function main() {
  CPU.registers[6] = 0;
  CPU.jump(real);
}

function real() {
  CPU.registers[6] = CPU.registers[6] + 1;
  CPU.jump(real);
}
