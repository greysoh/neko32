use std::env;
use std::fs;
use std::process::exit;

mod cpu;
mod memory;

const MEMORY_SIZE: usize = 16 * 1024 * 1024;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() <= 1 {
        println!("usage: <emu> <bin file>.bin");
        exit(1);
    }

    let file_contents = fs::read(&args[1]).expect("Should have been able to read the file");

    if file_contents.len() > 4096 {
        println!("file is too big to be usable. must be < 4096 bytes");
        exit(1);
    }

    println!("intializing cpu...");

    let mut memory: memory::Memory = memory::Memory::new(MEMORY_SIZE);

    let mapped_file = memory::MappedFile {
        file: file_contents
    };

    memory.add_mmio_device(0, Box::new(mapped_file));

    let registers: &mut [u32; 36] = &mut [0; 36];
    registers[0] = 0x00;

    let mut cpu_stack: Vec<u32> = Vec::new();

    loop {
        println!("solved value: {}", registers[6]);
        println!("current pc: {}", registers[0]);
        
        cpu::tick(registers, &mut memory, &mut cpu_stack);
    }
}
