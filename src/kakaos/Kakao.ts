import { Server, Message } from '@remote-kakao/core';
import { BaseCommand, KakaoCommands, manager, onKaKaoMessage } from '@KakaoBridge/kakaos';
import secret from '@KakaoBridge/kakao.json';
import config from '@KakaoBridge/discord.json';



namespace Kakao {
    export const commands: Map<string, (message: Message, args: string[]) => void> = new Map();

    export function init() {
        console.log("initing kakao bridge");

        manager.commands = [
            new BaseCommand("link", (msg, args) => KakaoCommands.linkChannel(msg, args[0], args[1])),
            new BaseCommand("dislink", (msg, args) => KakaoCommands.dislinkChannel(msg, args[0], args[1])),
            new BaseCommand("list", (msg, args) => KakaoCommands.linkList(msg)),
            new BaseCommand("sessions", (msg, args) => KakaoCommands.sessionList(msg))
        ]

        const server = new Server({ useKakaoLink: false });
        server.on('message', async (message) => {
            manager.commands.forEach(cmd => cmd.run(message));

            onKaKaoMessage(message);

            if (config.debug) console.log(`[${message.room}] ${message.sender.name}: ${message.content}`);
        });
        return server.start(secret.port || 4000, secret.kakaolink);
    }
}

export default Kakao;