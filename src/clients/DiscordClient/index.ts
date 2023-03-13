import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  CommandInteraction,
  TextChannel,
} from "discord.js";
import CM from "./core/DiscordCommandManager";
import { linkChannel, dislinkChannel, linkList } from "./commands";
import DiscordPlatform from "@/platform/DiscordPlatform";
import Vars from "@/Vars";

const masterIDs = ["462167403237867520", "473072758629203980"];

class DiscordClient {
  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  async init() {
    console.log("initing discord bot client");

    this.client.once("ready", async () => {
      console.log(
        `Logged in as ${this.client.user?.tag}(${this.client.application?.id})`
      );
    });

    this.client.on("interactionCreate", async (interaction) => {
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

    this.client.on("messageCreate", async (message) => {
      if (
        message.author.id != this.client.user?.id &&
        message.channel instanceof TextChannel
      ) {
        Vars.addPlatform(new DiscordPlatform(message.channel));

        const messageData: MessageData = {
          sender: {
            name: message.author.username,
            profile_img: message.author.avatarURL(),
          },
          room_name: message.channel.name,
          content: message.content,
        };
        Vars.platforms.forEach((platform) => platform.send(messageData));

        if (process.env.DEBUG)
          console.log(
            `<Discord> [${message.channel.name}] ${message.author.username}: ${message.content}`
          );
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
        commandInit();
        await CM.refreshCommand("guild", message.guild);
        message.reply(
          `guild command push has been done in ${Date.now() - time}ms`
        );
      }
    });

    await commandInit();
    await this.client.login(process.env.DISCORD_TOKEN);
  }
}

export default new DiscordClient();

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
  CM.commands.clear();
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
}
