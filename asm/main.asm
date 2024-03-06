#include "neko32/cpu.asm"

; Demo program.

main:
  reg_wri 0x00 r0
  reg_wri 0x01 r1

  .loop:
    math_add r0 r1 r2
    reg_mov r2 r0

    jump .loop

  jump .loop
