# Notes on CPU design
Project "PICO-32" Architecture:
 - 32 bit CPU 
 - Must have a minimum of 128k of ram, more is allowed & HIGHLY recommended for best compatibility
 - (maybe has a total of 16megs for the official emulator?)
 
 - CPU Level Instructions:
   - nop
   - jmp
   - eql: Equal
   - neq: Not equal
   - ngt: Number greater than
   - rew: Recieve memory
   - mew: Export register
   - rmv: Register moving
   - mmv: Memory moving

 - Stack Instructions:
   - spu: Stack push
   - spo: Stack pop
   - spe: Stack peek

 - Bitwise Instructions: 
   - lsb
   - rsb
   - not
   - and
   - orb
   - xor
   
 - Math Instructions:
   - add
   - dec
   - mul
   - div
   - mod
 
 - Registers (32 registers w/ 32 bit number max):
   - pc = program counter
   - sp = stack pointer
   - ex = exception value, 0 if no exception, anything else as "error code" (not required to be implemented)
   - 3 to 32 = normal registers