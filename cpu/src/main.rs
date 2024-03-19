use std::env;
use std::fs;
use std::process::exit;

mod cpu;

const MEMORY_SIZE: usize = 128 * 1024;

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

    let file_contents_slice = &file_contents[..];
    println!("file slice len: {}", file_contents_slice.len());

    let memory: &mut [u8; MEMORY_SIZE] = &mut [0; MEMORY_SIZE];
    memory[0..file_contents_slice.len()].copy_from_slice(file_contents_slice);

    let registers: &mut [u32; 36] = &mut [0; 36];
    registers[0] = 0x00;

    let mut cpu_stack: Vec<u32> = Vec::new();

    loop {
        println!("running cpu tick");
        cpu::tick(registers, memory, &mut cpu_stack);
    }
}
