import { Server } from "@remote-kakao/core";
import KakaoLinkPlugin from "@remote-kakao/kakaolink-plugin";
import Message from "@remote-kakao/core/dist/message";

import {
  TextChannel,
  ButtonBuilder,
  ComponentType,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";

import { Discord as DiscordBot } from "@KakaoBridge/discord";
import { BaseCommand, Command } from "@KakaoBridge/kakao";
import ChatLinkManager, { ChatLink } from "@KakaoBridge/ChatLinkManager";

namespace Kakao {
  export const commands: Command[] = [];
  export const server = new Server();
  /**
   * remote-kakao 초기화
   */
  export async function init(): Promise<void> {
    console.log("initing remote-kakao server");

    commands.push(
      new BaseCommand("link", (msg, args) =>
        linkChannel(msg, args[0], args[1])
      ),
      new BaseCommand("dislink", (msg, args) =>
        dislinkChannel(msg, args[0], args[1])
      ),
      new BaseCommand("list", (msg, args) => linkList(msg)),
      new BaseCommand("sessions", (msg, args) => sessionList(msg))
    );

    if (
      process.env.KAKAOLINK_EMAIL &&
      process.env.KAKAOLINK_PASSWORD &&
      process.env.KAKAOLINK_JAVASCRIPT_KEY &&
      process.env.KAKAOLINK_DOMAIN
    ) {
      server.usePlugin(KakaoLinkPlugin, {
        email: process.env.KAKAOLINK_EMAIL,
        password: process.env.KAKAOLINK_PASSWORD,
        key: process.env.KAKAOLINK_JAVASCRIPT_KEY,
        host: process.env.KAKAOLINK_DOMAIN,
      });
    }

    server.on("message", async (message) => {
      ChatLinkManager.globalSession.set(message.room, message);

      ChatLinkManager.chats.forEach((chat) => {
        if (chat.kakao !== message.room) return;
        chat.sendToDiscord(message);
      });

      const callback = ChatLinkManager.waitingfor.get(message.room);
      if (callback && (message.content == "yes" || message.content == "no")) {
        callback(message);
        ChatLinkManager.waitingfor.delete(message.room);
      }

      commands.forEach((cmd) => cmd.run(message));

      if (process.env.DEBUG)
        console.log(
          `[${message.room}] ${message.sender.name}: ${message.content}`
        );
    });

    server.start(process.env.PORT || 4000);
    console.log("remote-kakao server init done, server started now");
  }
}

export default Kakao;

export function sessionList(msg: Message) {
  msg
    .reply(
      `세션 목록\n${Array.from(DiscordBot.client.guilds.cache.values())
        .map(
          (guild) =>
            `• ${guild.name} (${guild.id})\n    ${Array.from(
              guild.channels.cache.values()
            )
              .reduce<string[]>(
                (a, e) =>
                  e.isTextBased() ? [...a, `- ${e.name} (${e.id})`] : a,
                []
              )
              .join("\n    ")}`
        )
        .join("\n\n------------\n\n")}`
    )
    .catch(console.log);
}

export function linkList(msg: Message) {
  const links = ChatLinkManager.chats.filter((chat) => chat.kakao == msg.room);
  if (links.length == 0)
    return msg.reply(`연결이 없습니다.`).catch(console.log);
  msg
    .reply(
      "연결 목록\n" +
        links
          .map(
            (chat) =>
              `${chat.kakao} <------> ${chat.discord.name}\n    (${chat.discord.guild.id} - ${chat.discord.id})`
          )
          .join("\n")
    )
    .catch(console.log);
}

export function linkChannel(msg: Message, guildID: string, channelID: string) {
  const channel = DiscordBot.client.guilds.cache
    .get(guildID)
    ?.channels.cache.get(channelID);
  if (!channel)
    return msg.reply("에러: 해당 채널을 찾을 수 없습니다.").catch(console.log);

  if (channel instanceof TextChannel) {
    const exist = ChatLinkManager.chats.find(
      (chat) => chat.kakao == msg.room && chat.discord.id == channelID
    );
    if (exist)
      return msg
        .reply(`에러: ${channel.name}은(는) 이미 연결된 상태입니다.`)
        .catch(console.log);
    msg.reply(`연결 대기중...`).catch(console.log);
    channel
      .send({
        content: `[I]\`${msg.sender.name}\`(이)가 \`${msg.room}\`에서 연결을 요청합니다.`,
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
                const chat = new ChatLink(msg.room, channel);
                ChatLinkManager.chats.push(chat);
                ChatLinkManager.updateState();
                chat.send(
                  `연결 완료: ${interaction.user.username}(이)가 요청을 승인했습니다.\n${msg.room} <------> ${channel.name}`
                );
                const kakaolinks = ChatLinkManager.chats.filter(
                  (chat) => chat.kakao == msg.room
                );
                if (kakaolinks.length > 1)
                  msg
                    .reply(
                      `경고: ${msg.room}에서 다수의 연결 감지\n${kakaolinks
                        .map(
                          (chat) => `${chat.kakao} <-----> ${chat.discord.name}`
                        )
                        .join("\n")}`
                    )
                    .catch(console.log);
                const discordlinks = ChatLinkManager.chats.filter(
                  (chat) => chat.discord.id == channelID
                );
                if (discordlinks.length > 1)
                  channel
                    .send(
                      `경고: \`${
                        channel.name
                      }\`에서 다수의 연결 감지\n${discordlinks
                        .map(
                          (chat) => `${chat.kakao} <-----> ${chat.discord.name}`
                        )
                        .join("\n")}`
                    )
                    .catch(console.log);
                break;
              }
              case "decline": {
                msg
                  .reply(
                    `연결 실패: ${interaction.user.username}(이)가 요청을 거절했습니다.`
                  )
                  .catch(console.log);
              }
            }
            message.delete().catch(console.log);
          })
          .catch((err) => {
            msg
              .reply(`타임아웃! ${channel.name}에서 응답이 없습니다.`)
              .catch(console.log);
            message.delete().catch(console.log);
          });
      });
  } else
    msg
      .reply(`에러: 유효하지 않은 채널 - ${channel.type.toString()}`)
      .catch(console.log);
}

export function dislinkChannel(
  msg: Message,
  guildID: string,
  channelID: string
) {
  const channel = DiscordBot.client.guilds.cache
    .get(guildID)
    ?.channels.cache.get(channelID);
  if (!channel)
    return msg.reply("에러: 해당 채널을 찾을 수 없습니다.").catch(console.log);
  if (!(channel instanceof TextChannel))
    return msg
      .reply(`에러: 유효하지 않은 채널 - ${channel.type.toString()}`)
      .catch(console.log);
  const index = ChatLinkManager.chats.findIndex(
    (link) => link.discord.id == channel.id
  );
  if (index == -1)
    return msg
      .reply(`에러: ${channel.name}은(는) 연결되지 않았습니다.`)
      .catch(console.log);

  const chat = ChatLinkManager.chats.splice(index, 1).pop();
  ChatLinkManager.updateState();
  chat?.send(`연결 해제 완료\n${msg.room} <-xxxxx-> ${channel.name}`);
}
