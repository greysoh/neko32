pub trait Device {
    fn read(&mut self, address: u32) -> u8;
    fn write(&mut self, address: u32, value: u8);

    fn get_size(&mut self) -> usize;
}

struct MMIODevice {
    device: Box<dyn Device>,
    position: u32,
    size: usize,
}

pub struct Memory {
    devices: Vec<MMIODevice>,
    memory: Vec<u8>,
}

impl Memory {
    pub fn new(memory_size: usize) -> Self {
        Memory {
            devices: Vec::new(),
            memory: vec![0; memory_size],
        }
    }

    pub fn get(&mut self, position: u32) -> u8 {
        for mmio_device in &mut self.devices {
            if mmio_device.position <= position
                && mmio_device.position + mmio_device.size as u32 >= position
            {
                return mmio_device.device.read(position); // FIXME: mmio_device.size as u32 -
            }
        }

        // Safely handle out of bounds reads
        if self.memory.len() <= position as usize {
            return 0xFF;
        }
        return self.memory[position as usize];
    }

    pub fn get_bulk(&mut self, start_pos: u32, end_pos: u32) -> Vec<u8> {
        let mut vec: Vec<u8> = Vec::new();

        for position in start_pos..end_pos {
            vec.push(self.get(position));
        }

        return vec;
    }

    pub fn set(&mut self, position: u32, value: u8) {
        for mmio_device in &mut self.devices {
            if mmio_device.position <= position
                && mmio_device.position + mmio_device.size as u32 >= position
            {
                return mmio_device.device.write(position, value);
            }
        }

        return self.memory[position as usize] = value;
    }

    pub fn add_mmio_device(&mut self, start_pos: u32, mut device: Box<dyn Device>) {
        let dev_size: usize = device.get_size();

        let real_mmio_device: MMIODevice = MMIODevice {
            device,
            position: start_pos,
            size: dev_size,
        };

        self.devices.push(real_mmio_device);
    }

    pub fn len(&mut self) -> usize {
        return self.memory.len();
    }
}

// File implementation for CPU
pub struct MappedFile {
    pub file: Vec<u8>,
}

impl Device for MappedFile {
    fn read(&mut self, address: u32) -> u8 {
        if address >= self.file.len() as u32 {
            return 0;
        }

        return self.file[address as usize];
    }

    fn write(&mut self, _address: u32, _value: u8) {
        dbg!("WARN: Attempted to write to read only memory for MappedFile");
        return;
    }

    fn get_size(&mut self) -> usize {
        return self.file.len();
    }
}
