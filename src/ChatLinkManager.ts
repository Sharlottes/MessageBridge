import Message from "@remote-kakao/core/dist/message";
import Discord, { TextChannel, EmbedBuilder } from "discord.js";

namespace ChatLinkManager {
  export const chats: ChatLink[] = [];
  export const globalSession: Map<string, Message> = new Map();
  export const waitingfor: Map<string, Function> = new Map();

  export function updateState() {
    chats.forEach((chat) => {
      chat.isOneKakao = true;
      chat.isOneDiscord = true;
      chats.forEach((chat) => {
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
/**
 * 리스트 카링 수신 인자
 * @typedef {Object} ListParameter
 * @property {string} [url] 클릭 시 리다이렉트할 링크
 * @property {string} [title] 타이틀
 * @property {Array<Array<string>>} [list] 콘텐츠 리스트
 * @property {string} [image] 콘텐츠 이미지 url
 * @property {string} [item] 아이템 이름
 * @property {string} [cat] 아이템 설명
 * @property {string} [itemImg] 아이템 이미지
 */
interface ListParameter {
  title?: string;
  url?: string;
  list?: string[][];
  image?: string;
  item?: string;
  cat?: string;
  itemImg?: string;
}
export class ChatLink {
  isOneKakao = true;
  isOneDiscord = true;
  latestkakaoession?: Message;

  constructor(public kakao: string, public discord: TextChannel) {}

  public sendKakaoLink(message: Discord.Message, body: ListParameter) {
    if (this.latestkakaoession) {
      const args: Record<string, any> = {};

      if (body.url) args.URL = body.url;
      if (body.title) args.TITLE = body.title;
      if (body.list)
        for (let i = 0; i < body.list.length; i++) {
          args["LIST" + (i + 1)] = body.list[i][0];
          args["DESC" + (i + 1)] = body.list[i][1];
        }
      if (body.image) args.IMG = body.image;
      if (body.item) args.ITEM = body.item;
      if (body.cat) args.CAT1 = body.cat;
      if (body.itemImg) args.ITEMIMG = body.cat;

      this.latestkakaoession
        .replyKakaoLink({ id: 65868, args })
        .catch(console.log);
    } else {
      const session = ChatLinkManager.globalSession.get(this.kakao);
      if (session) {
        this.latestkakaoession = session;
        this.sendKakaoLink(message, body);
      }
    }
  }
  public sendToKakao(message: Discord.Message) {
    if (this.latestkakaoession)
      this.latestkakaoession
        .reply(
          `${this.isOneKakao ? "" : `[${this.discord.name}] `}${
            message.author.username
          }: ${message.content}`
        )
        .catch(console.log);
    else {
      const session = ChatLinkManager.globalSession.get(this.kakao);
      if (session) {
        this.latestkakaoession = session;
        this.sendToKakao(message);
      } else
        message.channel.send(
          `수신 에러: \`${this.kakao}\`의 세션이 만료되어 메시지 수신이 실패했습니다.`
        );
    }
  }

  public sendToDiscord(message: Message) {
    this.latestkakaoession = message;
    this.discord.send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: message.sender.name,
            iconURL: message.sender.getProfileImage().startsWith("http://")
              ? message.sender.getProfileImage()
              : undefined,
          })
          .setTitle(message.room)
          .setDescription(message.content),
      ],
    });
  }

  public send(text: string) {
    this.discord.send(text);
    if (this.latestkakaoession)
      this.latestkakaoession.reply(text).catch(console.log);
    else {
      const session = ChatLinkManager.globalSession.get(this.kakao);
      if (session) {
        this.latestkakaoession = session;
        session.reply(text).catch(console.log);
      } else
        this.discord.send(
          `수신 에러: \`${this.kakao}\`의 세션이 만료되어 메시지 수신이 실패했습니다.`
        );
    }
  }
}
