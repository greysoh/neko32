#include "neko32/cpu.asm"

; Demo program.

main:
  reg_wri 2 r1
  reg_wri 2 r2

  .loop:
    funct .main
    jump .loop

  .main:
    funct .main_br

    math_mul r1 r2 r3
    reg_mov r3 r1

    return c1

  ; Reset to default values if overflow occurs
  .main_br:
    equals c0 r1 r4
    invert r4 r5

    return r5

    reg_wri 2 r1
    return c1