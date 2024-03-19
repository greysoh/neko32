#include "neko32/cpu.asm"

main:
  ; FIXME: Not implemented (gotta do the conversion by hand!)
  reg_wri 16 r1
  reg_wri 39 r2

  ; This CPU architecture is great thanks for asking
  reg_wri 4097 r0
  mem_wri c0 r0
  reg_wri 4098 r0
  mem_wri c0 r0
  reg_wri 4099 r1
  mem_wri r1 r0
  reg_wri 4100 r2
  mem_wri r2 r0

  ; Final touches (init)
  reg_wri 4096 r0
  mem_wri c1 r0

  .break:
    jump .break