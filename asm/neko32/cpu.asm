#include "registers.asm"

#ruledef
{
    ; Core CPU instructions
    nop => 0x00
    return {boolean: register} => 0x01 @boolean
    funct {address: u32} => 0x02 @address

    ; Boolean operators
    equals  {registerEq0: register} {registerEq1: register} {registerOutput: register} => 0x03 @registerEq0 @registerEq1 @registerOutput
    invert  {registerToInvert: register} {registerOutput: register} => 0x04 @registerToInvert @registerOutput
    grt_thn {registerEq0: register} {registerEq1: register} {registerOutput: register} => 0x05 @registerEq0 @registerEq1 @registerOutput
    
    ; Memory
    reg_wri {value: u32} {register: register} => 0x06 @value @register
    mem_wri {register: register} {memory: register} => 0x07 @register @memory
    reg_mov {registerInput: register} {registerOutput: register} => 0x08 @registerInput @registerOutput
    mem_mov {memoryInput: register} {memoryOutput: register} => 0x09 @memoryInput @memoryOutput

    ; Stack operations
    stack_push {register: register} => 0x0a @register
    stack_peek {register: register} => 0x0b @register
    stack_pop => 0x0c

    ; Bitwise operations
    bit_left  {registerFirst: register} {registerSecond: register} {registerOutput: register} => 0x0d @registerFirst @registerSecond @registerOutput
    bit_right {registerFirst: register} {registerSecond: register} {registerOutput: register} => 0x0e @registerFirst @registerSecond @registerOutput
    bit_not   {registerFirst: register} {registerOutput: register} => 0x0f @registerFirst @registerSecond @registerOutput
    bit_and   {registerFirst: register} {registerSecond: register} {registerOutput: register} => 0x10 @registerFirst @registerSecond @registerOutput
    bit_or    {registerFirst: register} {registerSecond: register} {registerOutput: register} => 0x11 @registerFirst @registerSecond @registerOutput
    bit_xor   {registerFirst: register} {registerSecond: register} {registerOutput: register} => 0x12 @registerFirst @registerSecond @registerOutput

    ; Math
    math_add {registerFirst: register} {registerSecond: register} {registerOutput: register} => 0x13 @registerFirst @registerSecond @registerOutput
    math_sub {registerFirst: register} {registerSecond: register} {registerOutput: register} => 0x14 @registerFirst @registerSecond @registerOutput
    math_mul {registerFirst: register} {registerSecond: register} {registerOutput: register} => 0x15 @registerFirst @registerSecond @registerOutput
    math_div {registerFirst: register} {registerSecond: register} {registerOutput: register} => 0x16 @registerFirst @registerSecond @registerOutput
    math_mod {registerFirst: register} {registerSecond: register} {registerOutput: register} => 0x17 @registerFirst @registerSecond @registerOutput

    ; "Macros"
    jump {address: u32} => asm { reg_wri {address} pc }
}