import { Client, Intents } from "discord.js";
import { REST } from "@discordjs/rest";

import config from "@RTTRPG/discord.json";

import { Kakao, onDiscordMessage } from "./kakaos";

// App 선언 - 봇의 모든 코드를 관리함
const app = {
    client: new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }),
    option: new Map<string, boolean|number|string>(),
    config: config,
    rest: new REST({ version: '9' }).setToken(config.botToken)
};
export default app;

const { client, option } = app;


client.once("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}(${client.application?.id})`);
});

client.on("messageCreate", async message => {
    if(message.author.id != client.user?.id) onDiscordMessage(message);
});

//카카오톡 봇 로그인
Kakao.init();
client.login(config.botToken);