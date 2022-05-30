import Message from "@remote-kakao/core/dist/message";
import Discord, { TextChannel, MessageActionRow, MessageButton } from "discord.js";
import app from "..";
import { CommandInteraction } from 'discord.js';

const chats: ChatLink[] = [];

export namespace KakaoCommands {
  export function linkList(msg: Message) {
    const links = chats.filter(chat=>chat.kakao==msg.room);
    if(links.length == 0) return msg.replyText(`연결이 없습니다.`).catch(console.log);
    msg.replyText("연결 목록\n"+links.map(chat=>`${chat.kakao} <------> ${chat.discord.name}`).join('\n')).catch(console.log);
  }

  export function linkChannel(msg: Message, guildID: string, channelID: string) {
    const channel = app.client.guilds.cache.get(guildID)?.channels.cache.get(channelID);
    if(!channel) return msg.replyText('에러: 해당 채널을 찾을 수 없습니다.').catch(console.log);

    if(channel instanceof TextChannel) {
      const exist = chats.find(chat=>chat.kakao==msg.room&&chat.discord.id==channelID);
      if(exist) return msg.replyText(`에러: ${channel.name}은(는) 이미 연결된 상태입니다.`).catch(console.log);
      msg.replyText(`연결 대기중...`).catch(console.log);
      channel.send({ 
        content: `[I] \`${msg.room}\`에서 연결을 요청합니다.`,
        components: [
          new MessageActionRow()
            .addComponents(new MessageButton({ label: '승인', style: 'SUCCESS', customId: 'accept' }))
            .addComponents(new MessageButton({ label: '거절', style: 'SECONDARY', customId: 'decline' }))
        ]
      }).then(message=>{
        message.awaitMessageComponent({ componentType: 'BUTTON', time: 30000 })
          .then(interaction => {
            switch(interaction.customId) {
              case 'accept': {
                chats.push(new ChatLink(msg.room, channel));

                msg.replyText(`연결 완료: ${interaction.user.username}(이)가 요청을 승인했습니다.\n${msg.room} <------> ${channel.name}`).catch(console.log);
                const kakaolinks = chats.filter(chat=>chat.kakao==msg.room||chat.discord.id==channelID);
                if(kakaolinks.length > 1) msg.replyText(`경고: ${msg.room}에서 다수의 연결 감지\n${kakaolinks.map(chat=>`${chat.kakao} <-----> ${chat.discord.name}`).join('\n')}`).catch(console.log);
                const discordlinks = chats.filter(chat=>chat.discord.id==channelID);
                if(discordlinks.length > 1) channel.send(`경고: \`${channel.name}\`에서 다수의 연결 감지\n${discordlinks.map(chat=>`${chat.kakao} <-----> ${chat.discord.name}`).join('\n')}`).catch(console.log);
                break;
              }
              case 'decline': {
                msg.replyText(`연결 실패: ${interaction.user.username}(이)가 요청을 거절했습니다.`).catch(console.log);
              }
            }
            message.delete().catch(console.log);
          })
          .catch(err => {
            msg.replyText(`타임아웃! ${channel.name}에서 응답이 없습니다.`).catch(console.log);
            message.delete().catch(console.log);
          });
      });
    }
    else msg.replyText(`에러: 유효하지 않은 채널 - ${channel.type.toString()}`).catch(console.log);
  }

  export function dislinkChannel(msg: Message, guildID: string, channelID: string) {
    const channel = app.client.guilds.cache.get(guildID)?.channels.cache.get(channelID);
    if(!channel) return msg.replyText('에러: 해당 채널을 찾을 수 없습니다.').catch(console.log);

    if(channel instanceof TextChannel) {
      const index = chats.findIndex(link=>link.discord.id == channelID);
      if(index == -1) return msg.replyText(`에러: ${channel.name}은(는) 연결되지 않았습니다.`).catch(console.log);
      
      chats.splice(index, 1);
      msg.replyText(`연결 해제 완료\n${msg.room} <-xxxxx-> ${channel.name}`).catch(console.log);
    }
    else msg.replyText(`에러: 유효하지 않은 채널 - ${channel.type.toString()}`).catch(console.log);
  }
}


export namespace DiscordCommands {
  export function linkList(interaction: CommandInteraction) {
    const links = chats.filter(chat=>chat.discord.id==interaction.channelId);
    if(links.length == 0) return interaction.reply(`연결이 없습니다.`);
    interaction.reply("연결 목록\n"+links.map(chat=>`${chat.kakao} <------> ${chat.discord.name}`).join('\n'));
  }

  export function linkChannel(interaction: CommandInteraction) {
    const room = interaction.options.getString('room', true);
    
  }

  export function dislinkChannel(interaction: CommandInteraction) {
    const room = interaction.options.getString('room', true);
    
    const index = chats.findIndex(link=>link.kakao == room);
    if(index == -1) return interaction.reply(`에러: ${room}은(는) 연결되지 않았습니다.`);
    
    chats.splice(index, 1);
    interaction.reply(`연결 해제 완료\n${room} <-xxxxx-> ${(interaction.channel as TextChannel).name}`);
  }
}

export function onKaKaoMessage(msg: Message) {
  chats.forEach(chat=> {
    if(chat.kakao !== msg.room) return;
    chat.sendToDiscord(msg);
  });
}

export function onDiscordMessage(msg: Discord.Message) {
  if(msg.channel instanceof TextChannel) {
    chats.forEach(chat=> {
      if(chat.discord.id !== msg.channel.id) return;
      chat.sendToKakao(msg);
    });
  }
}

class ChatLink {
  isOneKakao = true;
  isOneDiscord = true;
  kakao: string;
  latestKakaoSession?: Message;
  discord: TextChannel;
  
  constructor(kakao: string, discord: TextChannel) {
    this.kakao = kakao;
    this.discord = discord;
  }

  sendToKakao(message: Discord.Message) {
    if(!this.latestKakaoSession) return message.channel.send(`수신 에러: \`${this.kakao}\`의 세션이 만료되어 메시지 수신이 실패했습니다.`);
    this.latestKakaoSession.replyText(`${this.isOneKakao ? '' : `[${this.discord.name}]`} ${message.author.username}: ${message.content}`).catch(console.log);
  }

  sendToDiscord(message: Message) {
    this.latestKakaoSession = message;
    this.discord.send(`${this.isOneDiscord ? '' : `[${message.room}]`} ${message.sender.name}: ${message.content}`);
  }
}