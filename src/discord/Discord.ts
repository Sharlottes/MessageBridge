import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  CommandInteraction,
  TextChannel,
} from "discord.js";
import CM from "@KakaoBridge/discord/commands";
import ChatLinkManager, { ChatLink } from "@KakaoBridge/ChatLinkManager";
import Message from "@remote-kakao/core/dist/message";

const masterIDs = ["462167403237867520", "473072758629203980"];

namespace Discord {
  export const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  export async function init() {
    console.log("initing discord bot client");

    client.once("ready", async () => {
      console.log(
        `Logged in as ${client.user?.tag}(${client.application?.id})`
      );
    });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;
      const command = CM.commands.get(interaction.commandName);
      if (!command || !interaction.channel) return;
      await interaction.deferReply();

      if (interaction.channel.isDMBased() || !command.dmOnly)
        command.run(interaction);
      else
        interaction.editReply(
          "This command is available only in the dm channel."
        );
    });

    client.on("messageCreate", async (message) => {
      if (
        message.author.id != client.user?.id &&
        message.channel instanceof TextChannel
      ) {
        ChatLinkManager.chats.forEach((chat) => {
          if (chat.discord.id !== message.channel.id) return;
          chat.sendToKakao(message);
        });
      }

      if (
        message.content == "!refresh" &&
        message.inGuild() &&
        (message.author.id == message.guild.ownerId ||
          masterIDs.includes(message.author.id))
      ) {
        const time = Date.now();

        message
          .reply(`refresh start! server: ${message.guild.name}`)
          .catch(console.log);
        CM.commands.clear();
        commandInit();
        await CM.refreshCommand("guild", message.guild);
        message.reply(
          `guild command push has been done in ${Date.now() - time}ms`
        );
      }

      if (message.content == "test" && masterIDs.includes(message.author.id)) {
        ChatLinkManager.chats.forEach((chat) => {
          if (chat.discord.id !== message.channel.id) return;
          const CLOUDINARY_CLIENT_ID = "dvfymmnoq";
          const molus = [
            [
              "모?루",
              `https://res.cloudinary.com/${CLOUDINARY_CLIENT_ID}/image/upload/v1637820695/1637601279492_cugxuz.jpg`,
            ],
            [
              "쇼핑몰?루",
              `https://res.cloudinary.com/${CLOUDINARY_CLIENT_ID}/image/upload/v1637874000/1637873933719_fxvncd.jpg`,
            ],
            [
              "뿅!",
              `https://res.cloudinary.com/${CLOUDINARY_CLIENT_ID}/image/upload/v1637874683/images_1_qzx3hm.jpg`,
            ],
            [
              "몰?루없음",
              `https://res.cloudinary.com/${CLOUDINARY_CLIENT_ID}/image/upload/v1637874661/images_bntlm7.jpg`,
            ],
            [
              "모모?코",
              `https://res.cloudinary.com/${CLOUDINARY_CLIENT_ID}/image/upload/v1637874697/i14615767089_r4plwp.png`,
            ],
          ];
          const molu = molus[+(Math.random() * 4).toFixed()];
          chat.sendKakaoLink(message, {
            title: "몰?루",
            item: molu[0],
            cat: "몰루???",
            itemImg: molu[1],
            image: `https://res.cloudinary.com/${CLOUDINARY_CLIENT_ID}/image/upload/v1637819645/1637601286501_revroy.jpg`,
          });
        });
      }
    });

    await commandInit();
    await client.login(process.env.DISCORD_TOKEN);
    console.log(
      `discord bot init has been done, logged in as ${client.user?.id}`
    );
  }
}
export default Discord;

async function commandInit() {
  async function registerCmd(
    builder: SlashCommandBuilder,
    callback: (interaction: CommandInteraction) => void,
    category: "guild" | "global" = "guild"
  ) {
    await CM.register({
      category: category,
      dmOnly: false,
      debug: false,
      builder,
      run: callback,
    });
  }

  await registerCmd(
    new SlashCommandBuilder()
      .addStringOption((option) =>
        option.setName("room").setDescription("the room name").setRequired(true)
      )
      .setName("link")
      .setDescription("link to kakao room"),
    linkChannel
  );
  await registerCmd(
    new SlashCommandBuilder()
      .addStringOption((option) =>
        option.setName("room").setDescription("the room name").setRequired(true)
      )
      .setName("dislink")
      .setDescription("dislink to kakao room"),
    dislinkChannel
  );
  await registerCmd(
    new SlashCommandBuilder()
      .setName("links")
      .setDescription("show all link list"),
    linkList
  );
  await registerCmd(
    new SlashCommandBuilder()
      .setName("sessions")
      .setDescription("show all session list"),
    sessionList
  );
}

function sessionList(interaction: CommandInteraction) {
  if (ChatLinkManager.globalSession.size == 0)
    interaction.editReply(`세션이 없습니다.`);
  else
    interaction.editReply(
      `세션 목록\n${Array.from(ChatLinkManager.globalSession.keys())
        .map((k) => `•${k}`)
        .join("\n")}`
    );
}

function linkList(interaction: CommandInteraction) {
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

function linkChannel(interaction: CommandInteraction) {
  if (!interaction.channel || !(interaction.channel instanceof TextChannel))
    return;

  const room = interaction.options.get("room", true).value as string;
  const msg = ChatLinkManager.globalSession.get(room);
  if (!msg) {
    interaction.editReply(`에러: ${room}의 세션이 만료되었거나 없습니다.`);
  } else {
    interaction.editReply("연결 대기중...");
    msg
      .reply(`[I] ${interaction.channel.name}에서 연결을 요청합니다. (yes/no)`)
      .catch(console.log);

    ChatLinkManager.waitingfor.set(room, (message: Message) => {
      if (!interaction.channel || !(interaction.channel instanceof TextChannel))
        return;
      switch (message.content) {
        case "yes": {
          const chat = new ChatLink(message.room, interaction.channel);
          ChatLinkManager.chats.push(chat);
          ChatLinkManager.updateState();
          chat.send(
            `연결 완료: ${message.sender.name}(이)가 요청을 승인했습니다.\n${message.room} <------> ${interaction.channel.name}`
          );
          const kakaolinks = ChatLinkManager.chats.filter(
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
          const discordlinks = ChatLinkManager.chats.filter(
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

function dislinkChannel(interaction: CommandInteraction) {
  const room = interaction.options.get("room", true).value as string;
  const index = ChatLinkManager.chats.findIndex((link) => link.kakao == room);
  interaction.editReply("연결 해제중...");
  if (index == -1) {
    interaction.followUp(`에러: ${room}은(는) 연결되지 않았습니다.`);
  } else {
    const chat = ChatLinkManager.chats.splice(index, 1).pop();
    ChatLinkManager.updateState();
    chat?.send(
      `연결 해제 완료\n${room} <-xxxxx-> ${
        (interaction.channel as TextChannel).name
      }`
    );
  }
}
