import type { Memory, MMIOCallbackEvent } from "../Core/Memory.js";

export interface LibMMIODevice {
  deviceID: number,
  deviceName: string,
  memorySizeRequired: number,

  newMMIODevice(): MMIOCallbackEvent;
}

function u32ToInt(list: number[]): number {
  return (list[0] << 24) | (list[1] << 16) | (list[2] << 8) | list[3];
}

export class MMIOBinder {
  mmioDevices: LibMMIODevice[];
  
  mmioRegisteredDevices: {
    startPos: number,
    endPos: number,
    callback: MMIOCallbackEvent
  }[];

  scratchpad: Uint8Array;
  
  constructor() {
    this.mmioDevices = [];
    this.mmioRegisteredDevices = [];
  }

  addMMIODevice(device: LibMMIODevice) {
    this.mmioDevices.push(device);
  }

  initMemoryMMIO(memory: Memory): void {
    memory.configureMMIO(4096, 4096, (event, address, value) => {
      if (event == 0) return 0; // MMIOCallbackRead
      if (typeof value != "number") return 0;

      const readMemory = memory.getBulk(4097, 4100);
      const realNumber = u32ToInt(readMemory);

      if (realNumber < 4101 || realNumber > 8191) return 0;

      const foundDevice = this.mmioDevices.find((i) => i.deviceID == value);
      if (!foundDevice) return 0;

      const device = foundDevice.newMMIODevice();

      this.mmioRegisteredDevices.push({
        startPos: realNumber,
        endPos: realNumber + foundDevice.memorySizeRequired,

        callback: device
      });
      
      return 0;
    });

    memory.configureMMIO(4101, 8191, (event, address, value) => {
      const foundDevice = this.mmioRegisteredDevices.find((i) => i.startPos < address && i.endPos > address);
      if (!foundDevice) return 0;

      return foundDevice.callback(event, foundDevice.startPos-address, value);
    });
  }
}