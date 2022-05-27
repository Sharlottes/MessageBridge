import Message from "@remote-kakao/core/dist/message";
import Discord, { TextChannel } from "discord.js";
import app from "..";

const links: Map<TextChannel, string> = new Map();
const kakaoSession: Map<string, ((msg: Discord.Message)=>void)[]> = new Map();

export function linkChannel(guildID: string, channelID: string, room: string) {
  const channel = app.client.guilds.cache.get(guildID)?.channels.cache.get(channelID);
  if(channel instanceof TextChannel) links.set(channel, room);
}

export function disLinkChannel(guildID: string, channelID: string, room: string) {
  const channel = app.client.guilds.cache.get(guildID)?.channels.cache.get(channelID);
  if(channel instanceof TextChannel) links.set(channel, '');
}

export function onKaKaoMessage(msg: Message) {
  const listeners = kakaoSession.get(msg.room) || [];
  if(!kakaoSession.has(msg.room)) {
    listeners.push(c=>msg.replyText((links.size>1?`[${c.guild?.name} #${(c.channel as TextChannel).name}]\n`:'')+`${c.author.username}: ${c}`).catch(e => console.log(e)));
    kakaoSession.set(msg.room, listeners);
  }
  for(const [channel, room] of links.entries()) {
    if(msg.room === room) channel.send((links.size>1?`[${msg.room}]\n`:'')+`${msg.sender.name}: ${msg.content}`); 
  }
}

export function onDiscordMessage(msg: Discord.Message) {
  if(msg.channel instanceof TextChannel) {
    const room = links.get(msg.channel);
    if(room) {
      const listener = kakaoSession.get(room);
      if(listener) listener.forEach(l=>l(msg));
    }
  } 
}