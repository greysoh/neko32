export function nopLoop() {
  CPU.jump(nopLoop);
}
