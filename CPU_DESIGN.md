# Notes on CPU design
Project "PICO-32" Architecture:
 - 32 bit CPU 
 - Must have a minimum of 128k of ram, more is allowed & HIGHLY recommended for best compatibility
 - (maybe has a total of 16megs for the official emulator?)
 
 - Instructions to add:
   - bitwise
   - return
   - if condition like (greater, equals, not, or)
   - math (add, dec, mul, div, mod)

 - Instructions:
   - nop
   - eql (1st & 2nd arguments are registers)
   - jmp
   -
 
 - Registers (32 registers w/ 32 bit number max):
   - pc = program counter
   - ex = exception value, 0 if no exception, anything else as "error code" (not required to be implemented)
   - 2 to 32 = normal registers