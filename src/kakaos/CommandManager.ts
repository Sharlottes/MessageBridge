import { Command } from ".";

export class CommandManager {
  commands: Command[] = [];

  constructor() {
    this.commands = [];
  }
}
export const manager = new CommandManager();