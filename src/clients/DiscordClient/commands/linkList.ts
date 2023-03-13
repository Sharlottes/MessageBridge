import ChatLinkManager from "@/ChatLinkManager";
import { CommandInteraction } from "discord.js";

export function linkList(interaction: CommandInteraction) {
  const links = ChatLinkManager.chats.filter(
    (chat) => chat.discord.id == interaction.channelId
  );
  if (links.length == 0) interaction.editReply(`연결이 없습니다.`);
  else
    interaction.editReply(
      "연결 목록\n" +
        links
          .map((chat) => `${chat.kakao} <------> ${chat.discord.name}`)
          .join("\n")
    );
}
