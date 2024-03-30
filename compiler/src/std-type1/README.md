# Stdlib type 1

This type-1 of standard library only loads functions if they are needed, but you _cannot_ disable these, as these are required for the CPU to function normally. If you truly don't want to use stdlib type 1, write your code around this, if possible.

## Modules

- u32 -> u8 (NOTE: if used, you'll probably need one below this also)
- u8 -> u32 (NOTE: if used, you'll probably need one above this also)
