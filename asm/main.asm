#include "neko32/cpu.asm"

; Demo program.

main:
  reg_wri 1 r1
  reg_wri 2 r2

  .loop:
    funct .reset_values

    math_mul r1 r2 r3
    reg_mov r3 r1

    jump .loop

  ; Reset to default values if overflow occurs
  .reset_values:
    equals c0 r1 r4
    invert r4 r5

    return r5

    reg_wri 1 r1
    return c1