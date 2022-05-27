import { Server, Message } from '@remote-kakao/core';
import { BaseCommand, linkChannel, onKaKaoMessage } from '@RTTRPG/kakaos';
import { manager } from '@RTTRPG/kakaos/CommandManager';
import secret from "../kakao.json";


function errorHandle(reply: Promise<Record<string, unknown>>) {
    reply.catch(e => {
        if(!e) console.log(e);
    });
}

function executeEval(msg: Message, args: string[] = ['']) {
    try {
        errorHandle(msg.replyText(eval(args[0])));
    } catch (e) {
        errorHandle(msg.replyText(e+''));
    } 
}

function linkChatting(msg: Message, args?: string[]) {
    msg.replyText('연결 대기중...').catch(e => console.log(e));
    console.log('safe');
    if(args) linkChannel(args[0], args[1], msg.room);
}

namespace Kakao {
    export const commands: Map<string, (message: Message, args: string[]) => void> = new Map();

    export function init() {
        console.log("initing remote-kakao");


        manager.commands = [
            new BaseCommand(['do', 'eval'], executeEval).addPrefix(""),
            new BaseCommand("link", linkChatting)
        ]


        const server = new Server({ useKakaoLink: false });
        server.on('message', async (message) => {
            try{
                manager.commands.forEach(cmd => cmd.run(message)); 

                onKaKaoMessage(message);
                
                console.log(`[${message.room}] ${message.sender.name}: ${message.content}`);
                if (message.content == '!test') message.replyText('샤를바보').catch(e => console.log(e));
            } catch(e) {
                console.log(e);
            }
        });
        return server.start(4000, secret.kakao); 
    }
}

export default Kakao;