#include "neko32/cpu.asm"

main:
  reg_wri 1 r0
  reg_wri 2 r30

  .loop:
    funct .reset_values
    math_mul r0 r30 r27
    reg_mov r27 r0

    funct .convert_u32_to_u8_array
    jump .loop
   
  .reset_values:
    equals c0 r0 r28
    invert r28 r29

    return r29

    reg_wri 1 r0
    return c1

  .convert_u32_to_u8_array:
    reg_wri 24 r1  ; Shift size
    reg_wri 255 r2 ; Bitmask

    bit_right r0 r1 r7 ; (num >> 24) & 255
    bit_and r7 r2 r3
  
    reg_wri 16 r1
    bit_right r0 r1 r7
    bit_and r7 r2 r4

    reg_wri 8 r1
    bit_right r0 r1 r7
    bit_and r7 r2 r5

    bit_and r0 r2 r6

    return c1