import type { MMIOCallbackEvent } from "../Core/Memory.js";
import type { LibMMIODevice } from "./MMIOBinder.js";

export class KeyboardIO implements LibMMIODevice {
  deviceID: number;
  deviceName: string;
  memorySizeRequired: number;
  
  constructor() {
    this.deviceID = 1;
    this.deviceName = "Keyboard Input/Output Device";
    this.memorySizeRequired = 2;
  }

  newMMIODevice(): MMIOCallbackEvent {
    console.log("keyboard successfully bound!");
    
    return (event, address, value): number => {
      console.log(`recv: ${event} @ ${address} = ${value}`);
      
      return 0;
    }
  }
}