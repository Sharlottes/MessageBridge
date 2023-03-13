import {
  EmbedBuilder,
  TextChannel,
  ButtonBuilder,
  ComponentType,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import Platform from "./Platform";
import { getDiscordId } from "@/utils/getDiscordId";

class DiscordPlatform extends Platform {
  channel: TextChannel;

  constructor(channel: TextChannel) {
    super();
    this.channel = channel;
  }

  public async send(message: MessageData): Promise<void> {
    await this.channel.send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: message.sender.name,
            iconURL: message.sender.profile_img ?? undefined,
          })
          .setTitle(message.room_name)
          .setDescription(message.content),
      ],
    });
  }

  public linkPerm(platform: Platform): Promise<string> {
    return new Promise((res, rej) => {
      this.channel
        .send({
          content: `[I]\`${platform.getRoomName()}\`에서 연결을 요청합니다.`,
          components: [
            new ActionRowBuilder<ButtonBuilder>()
              .addComponents(
                new ButtonBuilder({
                  label: "승인",
                  style: ButtonStyle.Success,
                  customId: "accept",
                })
              )
              .addComponents(
                new ButtonBuilder({
                  label: "거절",
                  style: ButtonStyle.Secondary,
                  customId: "decline",
                })
              ),
          ],
        })
        .then((message) => {
          message
            .awaitMessageComponent({
              componentType: ComponentType.Button,
              time: 30000,
            })
            .then((interaction) => {
              switch (interaction.customId) {
                case "accept": {
                  res(interaction.user.username);
                  break;
                }
                case "decline": {
                  rej(
                    `연결 실패: ${interaction.user.username}(이)가 요청을 거절했습니다.`
                  );
                }
              }
              message.delete().catch(console.log);
            })
            .catch(() => {
              rej(`타임아웃! ${this.channel.name}에서 응답이 없습니다.`);
              message.delete().catch(console.log);
            });
        });
    });
  }

  public getId(): string {
    return getDiscordId(this.channel);
  }

  public getRoomName(): string {
    return this.channel.name;
  }
}

export default DiscordPlatform;
