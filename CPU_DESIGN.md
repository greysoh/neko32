# Notes on CPU design
Project "PICO-32" Architecture:
 - 32 bit CPU
 - Normal 8 bits for memory
 - Must have a minimum of 128k of ram, more is allowed & HIGHLY recommended for best compatibility
 - (maybe has a total of 16 megs for the official emulator?)

 - CPU Level Instructions:
   - nop: Do nothing
   - ret: Return (1 = should return, 0 = should not return)
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
   - lsb: Left Shift
   - rsb: Right Shift
   - not: Not
   - and: And
   - orb: Or
   - xor: Xor
  
 - Math Instructions:
   - add: Add
   - sub: Subtract
   - mul: Multiply
   - div: Divide
   - mod: Modulo (not required to be implemented)
 - Registers (32 registers w/ 32 bit number max):
   - pc = program counter
   - sp = stack pointer
   - ex = exception value, 0 if no exception, anything else as "error code" (not required to be implemented)
   - 3 to 32 = normal registers
# Memory Layout
  * 0-4095 bytes: Reserved for program (REQUIRED)
  * 4096-8191 bytes: Reserved for MMIO (REQUIRED as it starts at 4096, rest is best practice)
  * 8192-9999 bytes: Reserved for stack (Not required but you must disable/cpu exception)