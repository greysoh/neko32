export class CompilerNotImplementedError extends Error {
  constructor(message = "") {
    super(message);
    this.message = "todo" + (message ? `: ${message}` : "");
  }
}