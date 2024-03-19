import { readFile } from "node:fs/promises";
import { parse } from "@babel/parser";

import { writeIL, Opcodes, type File } from "./libs/il.js";

const il: File = {};

const file = await readFile(process.argv[2], "utf8");
const parsedFile = parse(file, {
  sourceType: "module"
});

function parseASTBlock() {
  
}

for (const node of parsedFile.program.body) {
  console.log(node);
  
  switch (node.type) {
    case "FunctionDeclaration": {
      
    }
  }
}

const output = writeIL(il);