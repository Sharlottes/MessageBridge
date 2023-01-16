import Message from "@remote-kakao/core/dist/message";
import Discord, {
  TextChannel,
  ButtonBuilder,
  CommandInteraction,
  ComponentType,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} from "discord.js";

import { Discord as DiscordBot } from "@KakaoBridge/discord";

const chats: ChatLink[] = [];
const globalSession: Map<string, Message> = new Map();
const waitingfor: Map<string, Function> = new Map();

export namespace KakaoCommands {
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
    const links = chats.filter((chat) => chat.kakao == msg.room);
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

  export function linkChannel(
    msg: Message,
    guildID: string,
    channelID: string
  ) {
    const channel = DiscordBot.client.guilds.cache
      .get(guildID)
      ?.channels.cache.get(channelID);
    if (!channel)
      return msg
        .reply("에러: 해당 채널을 찾을 수 없습니다.")
        .catch(console.log);

    if (channel instanceof TextChannel) {
      const exist = chats.find(
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
                  chats.push(chat);
                  updateState();
                  chat.send(
                    `연결 완료: ${interaction.user.username}(이)가 요청을 승인했습니다.\n${msg.room} <------> ${channel.name}`
                  );
                  const kakaolinks = chats.filter(
                    (chat) => chat.kakao == msg.room
                  );
                  if (kakaolinks.length > 1)
                    msg
                      .reply(
                        `경고: ${msg.room}에서 다수의 연결 감지\n${kakaolinks
                          .map(
                            (chat) =>
                              `${chat.kakao} <-----> ${chat.discord.name}`
                          )
                          .join("\n")}`
                      )
                      .catch(console.log);
                  const discordlinks = chats.filter(
                    (chat) => chat.discord.id == channelID
                  );
                  if (discordlinks.length > 1)
                    channel
                      .send(
                        `경고: \`${
                          channel.name
                        }\`에서 다수의 연결 감지\n${discordlinks
                          .map(
                            (chat) =>
                              `${chat.kakao} <-----> ${chat.discord.name}`
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
      return msg
        .reply("에러: 해당 채널을 찾을 수 없습니다.")
        .catch(console.log);
    if (!(channel instanceof TextChannel))
      return msg
        .reply(`에러: 유효하지 않은 채널 - ${channel.type.toString()}`)
        .catch(console.log);
    const index = chats.findIndex((link) => link.discord.id == channel.id);
    if (index == -1)
      return msg
        .reply(`에러: ${channel.name}은(는) 연결되지 않았습니다.`)
        .catch(console.log);

    const chat = chats.splice(index, 1).pop();
    updateState();
    chat?.send(`연결 해제 완료\n${msg.room} <-xxxxx-> ${channel.name}`);
  }
}

export namespace DiscordCommands {
  export function sessionList(interaction: CommandInteraction) {
    if (globalSession.size == 0) interaction.editReply(`세션이 없습니다.`);
    else
      interaction.editReply(
        `세션 목록\n${Array.from(globalSession.keys())
          .map((k) => `•${k}`)
          .join("\n")}`
      );
  }

  export function linkList(interaction: CommandInteraction) {
    const links = chats.filter(
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

  export function linkChannel(interaction: CommandInteraction) {
    if (!interaction.channel || !(interaction.channel instanceof TextChannel))
      return;

    const room = interaction.options.get("room", true).value as string;
    const msg = globalSession.get(room);
    if (!msg) {
      interaction.editReply(`에러: ${room}의 세션이 만료되었거나 없습니다.`);
    } else {
      interaction.editReply("연결 대기중...");
      msg
        .reply(`[I] ${interaction.channel.name}에서 연결을 요청합니다.`)
        .catch(console.log);

      waitingfor.set(room, (message: Message) => {
        if (
          !interaction.channel ||
          !(interaction.channel instanceof TextChannel)
        )
          return;
        switch (message.content) {
          case "yes": {
            const chat = new ChatLink(message.room, interaction.channel);
            chats.push(chat);
            updateState();
            chat.send(
              `연결 완료: ${message.sender.name}(이)가 요청을 승인했습니다.\n${message.room} <------> ${interaction.channel.name}`
            );
            const kakaolinks = chats.filter(
              (chat) => chat.kakao == message.room
            );
            if (kakaolinks.length > 1)
              message
                .reply(
                  `경고: ${msg.room}에서 다수의 연결 감지\n${kakaolinks
                    .map((chat) => `${chat.kakao} <-----> ${chat.discord.name}`)
                    .join("\n")}`
                )
                .catch(console.log);
            const discordlinks = chats.filter(
              (chat) => chat.discord.id == interaction.channelId
            );
            if (discordlinks.length > 1)
              interaction.channel
                .send(
                  `경고: \`${
                    interaction.channel.name
                  }\`에서 다수의 연결 감지\n${discordlinks
                    .map((chat) => `${chat.kakao} <-----> ${chat.discord.name}`)
                    .join("\n")}`
                )
                .catch(console.log);
            break;
          }
          case "no": {
            interaction.channel.send(
              `연결 실패: ${message.sender.name}(이)가 요청을 거절했습니다.`
            );
            message
              .reply(
                `연결 실패: ${message.sender.name}(이)가 요청을 거절했습니다.`
              )
              .catch(console.log);
          }
        }
      });
    }
  }

  export function dislinkChannel(interaction: CommandInteraction) {
    const room = interaction.options.get("room", true).value as string;
    const index = chats.findIndex((link) => link.kakao == room);
    if (index == -1) {
      interaction.followUp(`에러: ${room}은(는) 연결되지 않았습니다.`);
    } else {
      const chat = chats.splice(index, 1).pop();
      updateState();
      chat?.send(
        `연결 해제 완료\n${room} <-xxxxx-> ${
          (interaction.channel as TextChannel).name
        }`
      );
    }
  }
}

function updateState() {
  chats.forEach((chat) => {
    chat.isOneKakao = true;
    chat.isOneDiscord = true;
    chats.forEach((c) => {
      if (chat == c) return;

      if (c.kakao == chat.kakao) {
        c.isOneKakao = false;
        chat.isOneKakao = false;
      }
      if (c.discord.id == chat.discord.id) {
        c.isOneDiscord = false;
        chat.isOneDiscord = false;
      }
    });
  });
}

export function onKaKaoMessage(msg: Message) {
  globalSession.set(msg.room, msg);

  chats.forEach((chat) => {
    if (chat.kakao !== msg.room) return;
    chat.sendToDiscord(msg);
  });

  const callback = waitingfor.get(msg.room);
  if (callback && (msg.content == "yes" || msg.content == "no")) {
    callback(msg);
    waitingfor.delete(msg.room);
  }
}

export function onDiscordMessage(msg: Discord.Message) {
  if (msg.channel instanceof TextChannel) {
    chats.forEach((chat) => {
      if (chat.discord.id !== msg.channel.id) return;
      chat.sendToKakao(msg);
    });
  }
}

class ChatLink {
  isOneKakao = true;
  isOneDiscord = true;
  kakao: string;
  latestkakaoession?: Message;
  discord: TextChannel;

  constructor(kakao: string, discord: TextChannel) {
    this.kakao = kakao;
    this.discord = discord;
  }

  public sendToKakao(message: Discord.Message) {
    if (!this.latestkakaoession) {
      const session = globalSession.get(this.kakao);
      if (session) {
        this.latestkakaoession = session;
        this.sendToKakao(message);
      } else
        message.channel.send(
          `수신 에러: \`${this.kakao}\`의 세션이 만료되어 메시지 수신이 실패했습니다.`
        );
    } else
      this.latestkakaoession
        .reply(
          `${this.isOneKakao ? "" : `[${this.discord.name}] `}${
            message.author.username
          }: ${message.content}`
        )
        .catch(console.log);
  }

  public sendToDiscord(message: Message) {
    this.latestkakaoession = message;
    console.log(message.sender.getProfileImage());
    const embed = new EmbedBuilder()
      .setAuthor({
        name: message.sender.name,
        iconURL: message.sender.getProfileImage(),
      })
      .setTitle(message.room)
      .setDescription(message.content);
    this.discord.send({ embeds: [embed] });
    //this.discord.send(`${this.isOneDiscord ? '' : `[${message.room}] `}${message.sender.name}: ${message.content}`);
  }

  public send(text: string) {
    this.discord.send(text);
    if (!this.latestkakaoession) {
      const session = globalSession.get(this.kakao);
      if (session) {
        this.latestkakaoession = session;
        session.reply(text).catch(console.log);
      } else
        this.discord.send(
          `수신 에러: \`${this.kakao}\`의 세션이 만료되어 메시지 수신이 실패했습니다.`
        );
    } else this.latestkakaoession.reply(text).catch(console.log);
  }
}
