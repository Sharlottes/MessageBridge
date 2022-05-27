import Message from "@remote-kakao/core/dist/message";
import { manager } from "./CommandManager";
import { globalPrefix } from "./Vars";

/**
  기본 명령어 클래스
  * @param {(msg: Message)=>boolean} trigger 기본 명령어 판단자
  * @param {(msg: Message)=>void} listener 명령어 리스너
  * @param {Array<string>} [prefix=['!']] 임의 접두사
*/
export class Command {
  trigger: (msg: Message)=>boolean;
  listener: (msg: Message)=>void;
  id: number;
  prefix: string[];

  constructor(trigger: (msg: Message)=>boolean, listener: (msg: Message)=>void, prefix = globalPrefix) {
    this.trigger = trigger;
    this.listener = listener;
    this.id = manager.commands.length;
    this.prefix = prefix ? Array.isArray(prefix) ? prefix : [prefix] : [globalPrefix];
  }

  public run(msg: Message): void {
    if(this.isValid(msg)) this.listener(msg);
  }

  public isValid(msg: Message): boolean {
    return this.prefix.some(p=>msg.content.startsWith(p))&&this.trigger(msg);
  }

  public addPrefix(prefix: string): this {
    this.prefix.push(prefix);
    return this;
  } 
}