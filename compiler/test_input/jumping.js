function main() {
  br0();
  CPU.jump(main);
}

function br1() {
  return;
}

function br0() {
  CPU.jump(br1);
}
