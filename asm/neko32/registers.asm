#ruledef register
{
  ; Internal registers (allowed to be poked w/ except for c0 and c1)

  pc => 0x00 ; Program counter
  sp => 0x01 ; Stack pointer
  ex => 0x02 ; Exception value (normally 0, if left unchecked)

  c0 => 0x03 ; Constant set to 0
  c1 => 0x04 ; Constant set to 1

  ; Usable registers
  r0 => 0x05
  r1 => 0x06
  r2 => 0x07
  r3 => 0x08
  r4 => 0x09
  r5 => 0x0a
  r6 => 0x0b
  r7 => 0x0c
  r8 => 0x0d
  r9 => 0x0e
  r10 => 0x0f
  r11 => 0x10
  r12 => 0x11
  r13 => 0x12
  r14 => 0x13
  r15 => 0x14
  r16 => 0x15
  r17 => 0x16
  r18 => 0x17
  r19 => 0x18
  r20 => 0x19
  r21 => 0x1a
  r22 => 0x1b
  r23 => 0x1c
  r24 => 0x1d
  r25 => 0x1e
  r26 => 0x1f
  r27 => 0x20
  r28 => 0x21
  r29 => 0x22
  r30 => 0x23
  r31 => 0x24
}
