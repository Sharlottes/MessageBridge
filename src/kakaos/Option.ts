type CommandOption = 'string' | 'float' | 'int';

/**
명령어 옵션 클래스
 * @param {string} name 인자 이름
 * @param {"string"|"int"|"float"} [type="string"] 인자 타입 
*/
export class Option {
  name: string;
  type: CommandOption;
  optional: boolean;
  constructor(name: string, type: CommandOption, optional = false) {
    this.name = name;
    this.type = type||"string";
    this.optional = optional;
    if(this.type != 'string' && this.type != 'int' && this.type != 'float') throw new Error("옵션 생성자의 type 인자는 string, int, float 중 하나여야만 합니다: "+this.type);
  }

  public typeValid(arg: string): boolean {
    if(this.type === "string") return true;
    if(this.type === "int") return !arg.replace(/\d/g, "");
    return !arg.replace(/\d|[\d+[.]\d+]/g, "");
  }
}