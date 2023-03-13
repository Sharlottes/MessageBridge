import type { TextChannel } from "discord.js";

export const getDiscordId = (channel: TextChannel) =>
  `${channel.guildId}${channel.id}`;
