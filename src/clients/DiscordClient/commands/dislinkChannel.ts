import { getDiscordId } from "@/utils/getDiscordId";
import { CommandInteraction, TextChannel } from "discord.js";
import Vars from "@/Vars";

export function dislinkChannel(interaction: CommandInteraction) {
  if (!interaction.channel || !(interaction.channel instanceof TextChannel))
    return;

  const roomId = interaction.options.get("room", true).value as string;

  const platform = Vars.mappedPlatforms.get(getDiscordId(interaction.channel));
  if (!platform) throw new Error("에러: 현재 플랫폼을 찾을 수 없습니다.");

  const targetPlatform = Vars.mappedPlatforms.get(roomId);
  if (!targetPlatform) throw new Error("에러: 해당 플랫폼을 찾을 수 없습니다.");

  platform.dislink(targetPlatform);
  interaction.reply(`연결 해제 완료`);
}
