function main() {
  CPU.registers[7];
  CPU.registers[9] = 4;

  br0();
  CPU.jump(main);
}

function br1() {
  return;
}

function br0() {
  CPU.jump(br1);
}