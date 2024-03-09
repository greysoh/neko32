const U32_SIZE: u8 = 4;
const REG_SIZE: u8 = 1;

#[derive(Debug)]
pub struct IllegalOpcode;

#[derive(Debug)]
pub struct Instruction {
    pub opcode: u32,
    pub argv_len: u8,
    pub argv: Vec<u8>,
}

struct Opcodes;
impl Opcodes {
    pub const NOP: u32 = 0; // No-operation
    pub const RET: u32 = 1; // Return
    pub const FUN: u32 = 2; // Function

    pub const EQL: u32 = 3; // Equals (boolean)
    pub const INV: u32 = 4; // Not (boolean)
    pub const GHT: u32 = 5; // Greater than
    pub const REW: u32 = 6; // Register write
    pub const MEW: u32 = 7; // Memory write
    pub const RMV: u32 = 8; // Register moving
    pub const MMV: u32 = 9; // Memory moving

    pub const SPU: u32 = 10; // Stack push
    pub const SPE: u32 = 11; // Stack peek
    pub const SPO: u32 = 12; // Stack pop

    pub const LSB: u32 = 13; // Left shift (bitwise)
    pub const RSB: u32 = 14; // Right shift (bitwise)
    pub const NOT: u32 = 15; // Not (bitwise)
    pub const AND: u32 = 16; // And (bitwise)
    pub const ORB: u32 = 17; // Or (bitwise)
    pub const XOR: u32 = 18; // Xor (bitwise)

    pub const ADD: u32 = 19; // Add numbers
    pub const DEC: u32 = 20; // Subtract numbers
    pub const MUL: u32 = 21; // Multiply numbers
    pub const DIV: u32 = 22; // Divide numbers (not remainder)
    pub const MOD: u32 = 23; // Divide numbers (get remainder)
}

fn get_instruction_length(instruction: u32) -> u32 {
    // TODO: This is a direct copy and paste from TypeScript.
    // This could probably be represented as a match statement, but this works

    if instruction == Opcodes::NOP || instruction == Opcodes::SPO { return 0; }

    if instruction == Opcodes::EQL || instruction == Opcodes::GHT { return 3; }
    if instruction >= Opcodes::MEW && instruction <= Opcodes::MMV { return 2; }
  
    if instruction == Opcodes::SPU || instruction == Opcodes::SPO { return 1; }
    if instruction >= Opcodes::LSB && instruction <= Opcodes::MOD { return 3; }
  
    if instruction == Opcodes::REW { return 5; }
    if instruction == Opcodes::FUN { return 4; }
    if instruction == Opcodes::INV { return 2; }
    if instruction == Opcodes::RET { return 1; }

    todo!();
}

fn u32_to_int(list: &[u32]) -> u32 {
    return (list[0] << 24) | (list[1] << 16) | (list[2] << 8) | list[3];
}