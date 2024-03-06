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

    pub const EQL: u32 = 2; // Equals (boolean)
    pub const INV: u32 = 3; // Not (boolean)
    pub const GHT: u32 = 4; // Greater than
    pub const REW: u32 = 5; // Register write
    pub const MEW: u32 = 6; // Memory write
    pub const RMV: u32 = 7; // Register moving
    pub const MMV: u32 = 8; // Memory moving

    pub const SPU: u32 = 9; // Stack push
    pub const SPE: u32 = 10; // Stack peek
    pub const SPO: u32 = 11; // Stack pop

    pub const LSB: u32 = 12; // Left shift (bitwise)
    pub const RSB: u32 = 13; // Right shift (bitwise)
    pub const NOT: u32 = 14; // Not (bitwise)
    pub const AND: u32 = 15; // And (bitwise)
    pub const ORB: u32 = 16; // Or (bitwise)
    pub const XOR: u32 = 17; // Xor (bitwise)

    pub const ADD: u32 = 18; // Add numbers
    pub const DEC: u32 = 19; // Subtract numbers
    pub const MUL: u32 = 20; // Multiply numbers
    pub const DIV: u32 = 21; // Divide numbers (not remainder)
    pub const MOD: u32 = 22; // Divide numbers (get remainder)
}

fn u32_part_to_full(u32_slices: &[u32]) -> u32 {
    let mut total_val = 0;

    for i in 0..u32_slices.len() {
        let inverse_len: u32 = ((u32_slices.len() - i) + 1).try_into().unwrap();
        total_val += u32_slices[i] * 256_u32.pow(inverse_len);
    }

    return total_val;
}

fn cut_up_data(parts: &[u32], data: &[u8]) -> Vec<u8> {
    let mut data_vec: Vec<u8> = vec![];
    let mut current_pos: u32 = 0;

    for part in parts {
        if part > &(1 as u32) {
            panic!("Unimplemented cut up operation!! TODO");

            //let sliced_data = &data[current_pos as usize..(current_pos + part) as usize];
            //data_vec.push(u32_part_to_full(sliced_data));
        } else {
            data_vec.push(data[current_pos as usize]);
        }

        current_pos += part;
    }

    return data_vec;
}

pub fn fetch(memory: &[u8], pc: u32) -> &[u8] {
    // Approximate slice. This is not correct but it does get all the data that we should need
    return &memory[pc as usize..(pc + 16) as usize];
}

pub fn decode(instruction: &[u8]) -> Result<Instruction, IllegalOpcode> {
    match instruction[0] {
        Opcodes::NOP => Ok(Instruction {
            opcode: Opcodes::NOP,
            argv_len: 0,
            argv: vec![] as Vec<u8>,
        }),

        Opcodes::RET => Ok(Instruction {
            opcode: Opcodes::RET,
            argv_len: REG_SIZE,
            argv: cut_up_data(&instruction[1..instruction.len()], &[REG_SIZE] as &[u8; 1]),
        }),

        Opcodes::EQL => Ok(Instruction {
            opcode: Opcodes::EQL,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::INV => Ok(Instruction {
            opcode: Opcodes::INV,
            argv_len: REG_SIZE * 2,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::GHT => Ok(Instruction {
            opcode: Opcodes::GHT,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::REW => Ok(Instruction {
            opcode: Opcodes::REW,
            argv_len: REG_SIZE + U32_SIZE,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 2] as &[u8; 2],
            ),
        }),

        Opcodes::MEW => Ok(Instruction {
            opcode: Opcodes::MEW,
            argv_len: U32_SIZE + REG_SIZE,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[U32_SIZE, REG_SIZE] as &[u8; 2],
            ),
        }),

        Opcodes::RMV => Ok(Instruction {
            opcode: Opcodes::RMV,
            argv_len: REG_SIZE * 2,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 2] as &[u8; 2],
            ),
        }),

        Opcodes::MMV => Ok(Instruction {
            opcode: Opcodes::MMV,
            argv_len: U32_SIZE * 2,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[U32_SIZE; 2] as &[u8; 2],
            ),
        }),

        Opcodes::SPU => Ok(Instruction {
            opcode: Opcodes::SPU,
            argv_len: REG_SIZE,
            argv: cut_up_data(&instruction[1..instruction.len()], &[REG_SIZE] as &[u8; 1]),
        }),

        Opcodes::SPE => Ok(Instruction {
            opcode: Opcodes::SPE,
            argv_len: REG_SIZE,
            argv: cut_up_data(&instruction[1..instruction.len()], &[REG_SIZE] as &[u8; 1]),
        }),

        Opcodes::SPO => Ok(Instruction {
            opcode: Opcodes::SPO,
            argv_len: 0,
            argv: vec![] as Vec<u8>,
        }),

        Opcodes::LSB => Ok(Instruction {
            opcode: Opcodes::LSB,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::RSB => Ok(Instruction {
            opcode: Opcodes::RSB,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::NOT => Ok(Instruction {
            opcode: Opcodes::NOT,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::AND => Ok(Instruction {
            opcode: Opcodes::AND,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::ORB => Ok(Instruction {
            opcode: Opcodes::ORB,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::XOR => Ok(Instruction {
            opcode: Opcodes::XOR,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::ADD => Ok(Instruction {
            opcode: Opcodes::ADD,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::DEC => Ok(Instruction {
            opcode: Opcodes::DEC,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::MUL => Ok(Instruction {
            opcode: Opcodes::MUL,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::DIV => Ok(Instruction {
            opcode: Opcodes::DIV,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        Opcodes::MOD => Ok(Instruction {
            opcode: Opcodes::MOD,
            argv_len: REG_SIZE * 3,
            argv: cut_up_data(
                &instruction[1..instruction.len()],
                &[REG_SIZE; 3] as &[u8; 3],
            ),
        }),

        _ => Err(IllegalOpcode),
    }
}

pub fn execute(memory: &[u8], registers: &[u32]) {}
