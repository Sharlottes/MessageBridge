import { Client, Intents } from "discord.js";
import config from "@KakaoBridge/discord.json";
import { Kakao, onDiscordMessage } from "@KakaoBridge/kakaos";

const app = {
    client: new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }),
    config: config,
};

const { client } = app;

client.once("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}(${client.application?.id})`);
});

client.on("messageCreate", async message => {
    if(message.author.id != client.user?.id) onDiscordMessage(message);
});

Kakao.init();
client.login(config.botToken);

export default app;