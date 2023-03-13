import KakaoClient from "@/clients/KakaoClient";
import { Message } from "@remote-kakao/core";
import Platform from "./Platform";
import { getKakaoId } from "@/utils/getKakaoId";

class KakaoPlatform extends Platform {
  session: Message;

  constructor(message: Message) {
    super();
    this.session = message;
  }

  public async send(message: MessageData): Promise<void> {
    await this.session
      .reply(`[${message.room_name}]${message.sender.name}: ${message.content}`)
      .catch(console.log);
  }

  public linkPerm(platform: Platform): Promise<string> {
    return new Promise((res, rej) => {
      this.session
        .reply(`[I] ${platform.getRoomName()}에서 연결을 요청합니다. (yes/no)`)
        .catch(console.log);

      const handleMessage = (message: Message) => {
        switch (message.content) {
          case "yes": {
            res(message.sender.name);
            break;
          }
          case "no": {
            rej(`연결 실패: ${message.sender.name}(이)가 요청을 거절했습니다.`);
          }
        }

        if (message.content === "yes" || message.content === "no")
          KakaoClient.server.removeListener("message", handleMessage);
      };
      KakaoClient.server.addListener("message", handleMessage);
    });
  }

  public getId(): string {
    return getKakaoId(this.session);
  }

  public getRoomName(): string {
    return this.session.room;
  }
}

export default KakaoPlatform;
