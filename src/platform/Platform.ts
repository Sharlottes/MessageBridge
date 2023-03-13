import Vars from "@/Vars";

abstract class Platform {
  public linkedPlatforms: Set<Platform> = new Set();

  constructor() {
    Vars.platforms.add(this);
  }

  public link(platform: Platform): void {
    this.linkedPlatforms.add(platform);

    this.send({
      sender: {
        name: "BOT",
      },
      content:
        `경고: \`${this.getRoomName()}\`에서 다수의 연결 감지\n` +
        Array.from(this.linkedPlatforms)
          .map(
            (platform) =>
              `${this.getRoomName()} <-----> ${platform.getRoomName()}`
          )
          .join("\n"),
      room_name: this.getRoomName(),
    });
  }

  public dislink(platform: Platform): void {
    if (!this.linkedPlatforms.has(platform))
      throw new Error(`에러: 이 플랫폼은 연결되지 않았습니다.`);
    this.linkedPlatforms.delete(platform);
  }

  public onSend(message: MessageData): void {
    for (const platform of this.linkedPlatforms) {
      platform.send(message);
    }
  }

  public abstract linkPerm(platform: Platform): Promise<string>;
  public abstract send(content: MessageData): Promise<void>;
  public abstract getId(): string;
  public abstract getRoomName(): string;
}

export default Platform;
