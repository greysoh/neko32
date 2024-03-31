use super::memory;

#[derive(Debug)]
pub struct IllegalOpcode;

pub struct Instruction {
    pub opcode: u32,
    pub argv_len: u8,
    pub argv: Vec<u32>,
}

struct Opcodes;
impl Opcodes {
    pub const NOP: u32 = 0; // No-operation
    pub const RET: u32 = 1; // Return
    pub const FUN: u32 = 2; // Function

    pub const EQL: u32 = 3; // Equals (boolean)
    pub const INV: u32 = 4; // Not (boolean)
    pub const GHT: u32 = 5; // Greater than

    pub const REW: u32 = 6;  // Register write
    pub const MEW: u32 = 7;  // Memory write
    pub const RMV: u32 = 8;  // Register moving
    pub const MMV: u32 = 9;  // Memory moving
    pub const MCP: u32 = 10; // Memory copy -> register

    pub const SPU: u32 = 11; // Stack push
    pub const SPE: u32 = 12; // Stack peek
    pub const SPO: u32 = 13; // Stack pop

    pub const LSB: u32 = 14; // Left shift (bitwise)
    pub const RSB: u32 = 15; // Right shift (bitwise)
    pub const NOT: u32 = 16; // Not (bitwise)
    pub const AND: u32 = 17; // And (bitwise)
    pub const ORB: u32 = 18; // Or (bitwise)
    pub const XOR: u32 = 19; // Xor (bitwise)

    pub const ADD: u32 = 20; // Add numbers
    pub const SUB: u32 = 21; // Subtract numbers
    pub const MUL: u32 = 22; // Multiply numbers
    pub const DIV: u32 = 23; // Divide numbers (not remainder)
    pub const MOD: u32 = 24; // Divide numbers (get remainder)
}

fn get_instruction_length(instruction: u32) -> u8 {
    // TODO: This is a direct copy and paste from TypeScript.
    // This could probably be represented as a match statement, but this works

    if instruction == Opcodes::NOP || instruction == Opcodes::SPO { return 0; }

    if instruction == Opcodes::EQL || instruction == Opcodes::GHT { return 3; }
    if instruction >= Opcodes::MEW && instruction <= Opcodes::MCP { return 2; }
  
    if instruction == Opcodes::SPU || instruction == Opcodes::SPE { return 1; }
    if instruction >= Opcodes::LSB && instruction <= Opcodes::MOD { return 3; }
  
    if instruction == Opcodes::REW { return 5; }
    if instruction == Opcodes::FUN { return 4; }
    if instruction == Opcodes::INV { return 2; }
    if instruction == Opcodes::RET { return 1; }

    todo!();
}

fn u32_to_int(list: &[u8]) -> u32 {
    return (u32::from(list[0]) << 24) | (u32::from(list[1]) << 16) | (u32::from(list[2]) << 8) | u32::from(list[3]);
}

fn overflow_resolver(number: u64) -> u32 {
    if number > 2147483648 {
        return 0;
    } else  {
        return number as u32;
    };
}

pub fn fetch(pc: u32, memory: &mut memory::Memory) -> Vec<u8> {
    return memory.get_bulk(pc, pc + 8);
}

pub fn decode(fetched_instruction: Vec<u8>) -> Instruction {
    let instruction_length: u8 = get_instruction_length(fetched_instruction[0].into());

    if u32::from(fetched_instruction[0]) == Opcodes::REW {
        let mut argv: Vec<u32> = Vec::new();
        
        argv.push(u32_to_int(&fetched_instruction[1..(instruction_length + 1) as usize]));
        argv.push(fetched_instruction[instruction_length as usize].into());

        return Instruction {
            opcode: fetched_instruction[0] as u32,
            argv_len: instruction_length,
            argv
        };
    } else if u32::from(fetched_instruction[0]) == Opcodes::FUN {
        let mut argv: Vec<u32> = Vec::new();
        argv.push(u32_to_int(&fetched_instruction[1..(instruction_length + 1) as usize]));

        return Instruction {
            opcode: fetched_instruction[0] as u32,
            argv_len: instruction_length,
            argv
        };
    } else {
        let raw_argv: Vec<u8> = fetched_instruction[1..(instruction_length + 1) as usize].to_vec();
        let argv: Vec<u32> = raw_argv.iter().map(|&byte| byte as u32).collect();

        return Instruction {
            opcode: fetched_instruction[0] as u32,
            argv_len: instruction_length,
            argv
        };
    };
}

pub fn execute(instruction: Instruction, registers: &mut [u32], memory: &mut memory::Memory, cpu_stack: &mut Vec<u32>) {
    registers[0] += 1 + instruction.argv_len as u32;

    match instruction.opcode {
        Opcodes::NOP => {
            return;
        }

        Opcodes::RET => {
            // Checking if it's 1 (true)
            if registers[instruction.argv[0] as usize] == 1 {
                let last_branch = cpu_stack.pop();
                
                if !last_branch.is_some() {
                    panic!("Nothing to branch to");
                }

                registers[0] = last_branch.unwrap();
            }
        }

        Opcodes::FUN => {
            cpu_stack.push(registers[0]);
            registers[0] = instruction.argv[0];
        }

        Opcodes::EQL => {
            registers[instruction.argv[2] as usize] = (registers[instruction.argv[0] as usize] == registers[instruction.argv[1] as usize]) as u32;
        }

        Opcodes::INV => {
            let index = instruction.argv[0] as usize;
            let flipped_value = if registers[index] == 0 { 1 } else { 0 };
        
            registers[instruction.argv[1] as usize] = flipped_value;
        }

        Opcodes::GHT => {
            registers[instruction.argv[2] as usize] = (registers[instruction.argv[0] as usize] > registers[instruction.argv[1] as usize]) as u32;
        }

        Opcodes::REW => {
            registers[instruction.argv[1] as usize] = instruction.argv[0];
        }

        Opcodes::RMV => {
            registers[instruction.argv[1] as usize] = registers[instruction.argv[0] as usize];
        }

        Opcodes::MEW => {
            if memory.len() <= registers[instruction.argv[0] as usize] as usize {
                registers[1] = 2;
                return;
            }

            memory.set(instruction.argv[0], registers[instruction.argv[1] as usize] as u8);
        }

        Opcodes::MMV => {
            let got_value = memory.get(instruction.argv[1]);

            if memory.len() <= registers[instruction.argv[0] as usize] as usize {
                registers[1] = 2;
                return;
            }

            memory.set(instruction.argv[0], got_value);
        }

        Opcodes::MCP => {
            if memory.len() <= registers[instruction.argv[0] as usize] as usize {
                registers[instruction.argv[1] as usize] = 255;
                registers[1] = 1;

                return;
            }

            registers[instruction.argv[1] as usize] = memory.get(registers[instruction.argv[0] as usize]) as u32;
        }

        Opcodes::SPU => {
            if registers[1] > 9999 { panic!("Stack push: Limit over threshold in vCPU stack") }
            if registers[1] < 8191 { panic!("Stack push: Limit under threshold in vCPU stack") }
            
            if memory.len() <= registers[instruction.argv[1] as usize] as usize {
                registers[1] = 2;
                return;
            }

            memory.set(registers[1], registers[instruction.argv[0] as usize] as u8);
            registers[1] += 1;
        }

        Opcodes::SPE => {
            if memory.len() <= registers[instruction.argv[1] as usize] as usize {
                registers[instruction.argv[1] as usize] = 255;
                registers[1] = 1;

                return;
            }

            registers[instruction.argv[0] as usize] = memory.get(registers[1]) as u32;
        }

        Opcodes::SPO => {
            registers[1] -= 1;
        }

        Opcodes::LSB => {
            registers[instruction.argv[2] as usize] = overflow_resolver((registers[instruction.argv[0] as usize] as u64) << registers[instruction.argv[1] as usize] as u64);
        }

        Opcodes::RSB => {
            registers[instruction.argv[2] as usize] = overflow_resolver(registers[instruction.argv[0] as usize] as u64 >> registers[instruction.argv[1] as usize] as u64);
        }

        Opcodes::NOT => {
            registers[instruction.argv[1] as usize] = overflow_resolver((!registers[instruction.argv[0] as usize]) as u64);
        }

        Opcodes::AND => {
            registers[instruction.argv[2] as usize] = overflow_resolver(registers[instruction.argv[0] as usize] as u64 & registers[instruction.argv[1] as usize] as u64);
        }

        Opcodes::ORB => {
            registers[instruction.argv[2] as usize] = overflow_resolver(registers[instruction.argv[0] as usize] as u64 | registers[instruction.argv[1] as usize] as u64);
        }

        Opcodes::XOR => {
            registers[instruction.argv[2] as usize] = overflow_resolver(registers[instruction.argv[0] as usize] as u64 ^ registers[instruction.argv[1] as usize] as u64);
        }

        Opcodes::ADD => {
            registers[instruction.argv[2] as usize] = overflow_resolver(registers[instruction.argv[0] as usize] as u64 + registers[instruction.argv[1] as usize] as u64);
        }

        Opcodes::SUB => {
            registers[instruction.argv[2] as usize] = overflow_resolver(registers[instruction.argv[0] as usize] as u64 - registers[instruction.argv[1] as usize] as u64);
        }

        Opcodes::MUL => {
            registers[instruction.argv[2] as usize] = overflow_resolver(registers[instruction.argv[0] as usize] as u64 * registers[instruction.argv[1] as usize] as u64);
        }

        Opcodes::DIV => {
            registers[instruction.argv[2] as usize] = overflow_resolver(registers[instruction.argv[0] as usize] as u64 / registers[instruction.argv[1] as usize] as u64);
        }
        
        _ => panic!("Illegal instruction")
    }

    registers[3] = 0;
    registers[4] = 1;
}

pub fn tick(registers: &mut [u32], memory: &mut memory::Memory, cpu_stack: &mut Vec<u32>) {
    let fetched_data: Vec<u8> = fetch(registers[0], memory);
    let instruction = decode(fetched_data);

    execute(instruction, registers, memory, cpu_stack);
}