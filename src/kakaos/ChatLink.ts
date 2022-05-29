import Message from "@remote-kakao/core/dist/message";
import Discord, { TextChannel } from "discord.js";
import app from "..";

const chats: ChatLink[] = [];

export function linkChannel(msg: Message, guildID: string, channelID: string) {
  msg.replyText('연결 대기중...').catch(console.log);
  const channel = app.client.guilds.cache.get(guildID)?.channels.cache.get(channelID);
  if(channel instanceof TextChannel) {
    chats.push(new ChatLink(msg.room, channel));
    msg.replyText(`연결 완료\n${msg.room} <------> ${channel.name}`).catch(console.log);

    const exist = chats.find(chat=>chat.kakao==msg.room&&chat.discord.id==channelID);
    if(exist) return msg.replyText(`이미 연결된 상태입니다.`);

    const kakaolinks = chats.filter(chat=>chat.kakao==msg.room);
    if(kakaolinks.length > 1) {
      kakaolinks.forEach(chat=>chat.onlyOneKakao = false);
      msg.replyText(`경고: 다수의 연결 감지\n${kakaolinks.map(chat=>`${chat.kakao} <-----> ${chat.discord.name}`).join('\n')}`).catch(console.log);
    }
    const discordlinks = chats.filter(chat=>chat.discord.id==channelID);
    if(discordlinks.length > 1) {
      discordlinks.forEach(chat=>chat.onlyOneDiscord = false);
      msg.replyText(`경고: 다수의 연결 감지\n${discordlinks.map(chat=>`${chat.kakao} <-----> ${chat.discord.name}`).join('\n')}`).catch(console.log);
    }
  }
  else msg.replyText('에러: 유효하지 않은 체널').catch(console.log);
}

export function dislinkChannel(msg: Message, guildID: string, channelID: string) {
  const channel = app.client.guilds.cache.get(guildID)?.channels.cache.get(channelID);
  if(channel instanceof TextChannel) {
    const index = chats.findIndex(link=>link.discord.id == channelID);
    if(index == -1) msg.replyText(`에러: ${channel.name}은(는) 연결되지 않았습니다.`).catch(console.log);
    else {
      chats.splice(index, 1);
      msg.replyText(`연결 해제 완료\n${msg.room} <//////> ${channel.name}`).catch(console.log);

      const kakaolinks = chats.filter(chat=>chat.kakao==msg.room);
      if(kakaolinks.length < 2) kakaolinks.forEach(chat=>chat.onlyOneKakao = true);
      const discordlinks = chats.filter(chat=>chat.discord.id==channelID);
      if(discordlinks.length  < 2) kakaolinks.forEach(chat=>chat.onlyOneDiscord = true);
    }
  }
  else msg.replyText('에러: 유효하지 않은 체널').catch(console.log);
}

export function onKaKaoMessage(msg: Message) {
  chats.forEach(chat=> {
    if(chat.kakao !== msg.room) return;
    chat.latestKakaoSession = msg;
    chat.discord.send(`${chat.onlyOneKakao ? '' : `[${msg.room}]`} ${msg.sender.name}: ${msg.content}`);
  });
}

export function onDiscordMessage(msg: Discord.Message) {
  if(msg.channel instanceof TextChannel) {
    chats.forEach(chat=> {
      if(chat.discord.id !== msg.channel.id) return;
      if(chat.latestKakaoSession) chat.latestKakaoSession.replyText(`${chat.onlyOneKakao ? '' : `[${chat.discord.name}]`} ${msg.author.username}: ${msg.content}`).catch(console.log);
      else msg.channel.send(`수신 에러: ${chat.kakao}의 세션이 만료되어 메시지 수신이 실패했습니다.`);
    });
  } 
}

class ChatLink {
  kakao: string;
  onlyOneKakao = true;
  latestKakaoSession?: Message;
  discord: TextChannel;
  onlyOneDiscord = false;

  constructor(kakao: string, discord: TextChannel) {
    this.kakao = kakao;
    this.discord = discord;
  }
}