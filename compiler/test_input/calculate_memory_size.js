function main() {
  calculateMemorySize();
}

export function calculateMemorySize() {
  CPU.registers[5] = 10024; // Safe memory base

  // Check if we have an exception while calculating the memory size
  if (CPU.registers[2] != 0) {
    return;
  } else {
    CPU.registers[5] = CPU.registers[5] + 1; // 512 pages, should be precise enough for an estimation
    CPU.memory[CPU.registers[5]] = 240; // Attempt to initialize memory
  }

  CPU.jump(calculateMemorySize);
}
