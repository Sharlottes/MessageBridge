import Message from "@remote-kakao/core/dist/message";
import { Option, Command } from ".";

/**
더 쉬운 명령어 관리를 위한 기초 명령어 클래스
 * @param {string|Array<string>} names 명령어 이름들
 * @param {(msg: Message)=>void} listener 명령어 리스너
 * @param {Option|Array<Option>} [options] 명령어 인자
 * @param {RegExp|string} [saperator=/\s/] 메시지 구분자
*/
export class BaseCommand extends Command {
  names: string[];
  options: Option[];
  saperator: string;
  listener: (msg: Message, args?: string[])=>void;

  constructor(names: string | string[], listener: (msg: Message, args?: string[])=>void, options: (Option | Option[]) = [], saperator = ' ') {
    super(()=>true, msg=>listener(msg));

    this.names = Array.isArray(names) ? names : [names];
    this.options = Array.isArray(options) ? options : [options];
    this.saperator = saperator;
    this.listener = listener;
    
    //옵션 유효성 검사
    let optional = false;
    for(const opt of this.options) {
      if(optional && !opt.optional) throw new Error("선택 매개변수는 필수 매개변수보다 앞에 있을 수 없습니다.");
      optional = opt.optional;
    } 
  }
  
  public isValid(msg: Message): boolean { 
    if(super.isValid(msg)) {
      const spliten = msg.content.split(/\s/);
      const args = spliten.slice(1).join(" ").split(this.saperator);
      
      if(this.prefix.some(p=>this.names.includes(spliten[0].slice(p.length)))) {
        if(!this.options.length) return true;
        
        for(let i = 0; i < this.options.length; i++) {
          const opt = this.options[i];
          if(opt.optional || (args[i] && typeof args[i] === opt.type)) return true;
        }
        
        //유효하지 않은 서식은 도움말 답변
        if(this.options.length) msg.replyText(this.prefix.join(",")+this.names.join("|")+" "+this.options.map(opt=>(opt.optional?"[":"(")+opt.name+":"+opt.type+(opt.optional?"]":")")).join(this.saperator)).catch(e => console.log(e));
        else msg.replyText(this.prefix.join(",")+this.names.join("|")).catch(e => console.log(e));
      }
    }

    return false;
  } 

  public run(msg: Message): void {
    if(this.isValid(msg)) {
      const spliten = msg.content.split(/\s/);
      const args = spliten.slice(1).join(" ").split(this.saperator);
      this.listener(msg, args);
    }
  }
}