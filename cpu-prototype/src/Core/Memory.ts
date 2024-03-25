export const MMIOCallbackRead = 0x00;
export const MMIOCallbackWrite = 0x01;

export type MMIOCallbackEvent = (event: number, address: number, value?: number) => number | undefined;

export class Memory {
  rawMemory: Uint8Array;

  mmioEvents: {
    callback: MMIOCallbackEvent,

    startPos: number,
    endPos:   number
  }[];

  constructor(memoryBase: Uint8Array) {
    this.rawMemory = memoryBase;
    this.mmioEvents = [];
  }

  get(pos: number): number {
    const mmioEventsSearch = this.mmioEvents.find((i) => i.startPos <= pos && i.endPos >= pos);
    
    if (mmioEventsSearch) {
      const output = mmioEventsSearch.callback(MMIOCallbackRead, pos);
      if (!output) return 0;
      
      return output;
    }

    // Safely handle out of bounds reads
    if (this.rawMemory.length <= pos) return 0xFF;
    return this.rawMemory[pos];
  }

  getBulk(startPos: number, endPos: number): number[] {
    const values: number[] = [];

    for (let currentPos = startPos; currentPos < endPos; currentPos++) {
      values.push(this.get(currentPos));
    }

    return values;
  }

  set(pos: number, value: number): void {
    const mmioEventsSearch = this.mmioEvents.find((i) => i.startPos <= pos && i.endPos >= pos);
    
    if (mmioEventsSearch) {
      mmioEventsSearch.callback(MMIOCallbackWrite, pos, value);
      return;
    }

    this.rawMemory[pos] = value;
  }

  clear(resetMMIO?: boolean): void {
    if (resetMMIO) this.mmioEvents.splice(0, this.mmioEvents.length);
    
    // FIXME: Let's hope the GC cleans this up....
    this.rawMemory = new Uint8Array(this.rawMemory.length);
  }

  configureMMIO(startPos: number, endPos: number, callback: MMIOCallbackEvent): void {
    this.mmioEvents.push({
      callback,
      startPos,
      endPos
    });
  }

  public get length() {
    return this.rawMemory.length;
  }
}