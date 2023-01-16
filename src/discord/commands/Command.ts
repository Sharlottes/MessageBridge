import { CommandInteraction, CacheType } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

abstract class Command {
  public abstract run(interaction: CommandInteraction<CacheType>): void;

  constructor(
    public readonly category: "guild" | "global" = "guild",
    public readonly debug = true,
    public readonly dmOnly = false,
    public readonly builder = new SlashCommandBuilder()
  ) {
    this.builder.setDefaultMemberPermissions(8);
  }
}

export default Command;
