/**
명령어 옵션 클래스
 * @param name 인자 이름
 * @param type 인자 타입 
*/
export class Option {
  constructor(
    public name: string,
    public type: "string" | "float" | "int" = "string",
    public optional = false
  ) {}

  public typeValid(arg: string): boolean {
    if (this.type === "string") return true;
    if (this.type === "int") return !arg.replace(/\d/g, "");
    return !arg.replace(/\d|[\d+[.]\d+]/g, "");
  }
}
