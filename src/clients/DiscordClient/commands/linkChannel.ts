import { TextChannel, CommandInteraction } from "discord.js";
import Vars from "@/Vars";
import { getDiscordId } from "@/utils/getDiscordId";

export async function linkChannel(interaction: CommandInteraction) {
  if (!interaction.channel || !(interaction.channel instanceof TextChannel))
    return;

  const roomId = interaction.options.get("room", true).value as string;

  const platform = Vars.mappedPlatforms.get(getDiscordId(interaction.channel));
  if (!platform) throw new Error("에러: 현재 플랫폼을 찾을 수 없습니다.");

  const targetPlatform = Vars.mappedPlatforms.get(roomId);
  if (!targetPlatform) throw new Error("에러: 해당 플랫폼을 찾을 수 없습니다.");
  if (platform.linkedPlatforms.has(targetPlatform))
    throw new Error(
      `에러: ${platform.getRoomName()}은(는) 이미 연결된 상태입니다.`
    );

  await interaction.reply("연결 대기중...");
  targetPlatform
    .linkPerm(platform)
    .then((permer) => {
      platform.link(targetPlatform);
      interaction
        .reply(
          `연결 완료: ${permer}(이)가 요청을 승인했습니다.\n${platform.getRoomName()} <------> ${targetPlatform.getRoomName()}`
        )
        .catch();
    })
    .catch((err) => {
      interaction.reply(err).catch(console.log);
    });
}
