import Message from "@remote-kakao/core/dist/message";
import Discord, { TextChannel, EmbedBuilder} from "discord.js";

namespace ChatLinkManager {
    export const chats: ChatLink[] = [];
    export const globalSession: Map<string, Message> = new Map();
    export const waitingfor: Map<string, Function> = new Map();

    export function updateState() {
        chats.forEach(chat => {
            chat.isOneKakao = true;
            chat.isOneDiscord = true;
            chats.forEach(chat => {
                if (chat == chat) return;

                if (chat.kakao == chat.kakao) {
                    chat.isOneKakao = false;
                    chat.isOneKakao = false;
                }
                if (chat.discord.id == chat.discord.id) {
                    chat.isOneDiscord = false;
                    chat.isOneDiscord = false;
                }
            });
        });
    }
}
export default ChatLinkManager;

export class ChatLink {
    isOneKakao = true;
    isOneDiscord = true;
    latestkakaoession?: Message;

    constructor(public kakao: string, public discord: TextChannel) { }

    public sendToKakao(message: Discord.Message) {
        if (this.latestkakaoession) this.latestkakaoession.reply(`${this.isOneKakao ? '' : `[${this.discord.name}] `}${message.author.username}: ${message.content}`).catch(console.log);
        else {
            const session = ChatLinkManager.globalSession.get(this.kakao);
            if (session) {
                this.latestkakaoession = session;
                this.sendToKakao(message);
            }
            else message.channel.send(`수신 에러: \`${this.kakao}\`의 세션이 만료되어 메시지 수신이 실패했습니다.`);
        }
    }

    public sendToDiscord(message: Message) {
        this.latestkakaoession = message;
        console.log(message.sender.getProfileImage())
        this.discord.send({ embeds: [
            new EmbedBuilder()
                .setAuthor({ name: message.sender.name, iconURL: message.sender.getProfileImage() })
                .setTitle(message.room)
                .setDescription(message.content)
        ] });
    }

    public send(text: string) {
        this.discord.send(text);
        if (this.latestkakaoession) this.latestkakaoession.reply(text).catch(console.log);
        else {
            const session = ChatLinkManager.globalSession.get(this.kakao);
            if (session) {
                this.latestkakaoession = session;
                session.reply(text).catch(console.log);
            }
            else this.discord.send(`수신 에러: \`${this.kakao}\`의 세션이 만료되어 메시지 수신이 실패했습니다.`);
        }
    }
}