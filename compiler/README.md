# NEko Cross Compiler
necc is a programming language based on babel's AST parser.
## What this is
This is designed to be an extremely low level langauge (closer to assembly than something like C). There is no memory management, and no hidden values. You can, and are expected, to hit register & memory values directly.  
  
Therefore, this is as powerful as assembly, but more human readable (as well as more bloated). This is also designed to be faster to write:
```js
function main() {
  if (CPU.registers[5] == 0) {
    CPU.registers[5] = 1;
  }

  CPU.registers[5] = CPU.registers[5] * 2;
  CPU.jump(main);
}
```
versus:
```asm
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
```
## Features Implemented
- [ ] Configuring Comp. Ops
- [x] Jumping
- [x] Functions
- [x] Register Read
- [x] Register Write
- [x] Memory Read
- [x] Memory Write  
- [x] Math operations
- [x] Bitwise operations
- [x] Basic if statements
- [x] If else
- [ ] Boolean and
- [ ] Boolean or