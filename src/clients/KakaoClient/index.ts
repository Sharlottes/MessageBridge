import { Server } from "@remote-kakao/core";

import { KakaoBaseCommand, KakaoCommand } from "./core";
import { linkChannel, dislinkChannel, linkList } from "./commands";
import KakaoPlatform from "@/platforms/KakaoPlatform";
import Vars from "@/Vars";

class KakaoClient {
  commands: KakaoCommand[] = [];
  server = new Server();

  constructor() {
    this.commands.push(
      new KakaoBaseCommand("link", (msg, id) => linkChannel(msg, id[0])),
      new KakaoBaseCommand("dislink", (msg, id) => dislinkChannel(msg, id[0])),
      new KakaoBaseCommand("list", (msg) => linkList(msg))
    );

    this.server.on("message", async (message) => {
      Vars.addPlatform(new KakaoPlatform(message));

      const messageData: MessageData = {
        sender: {
          name: message.sender.name,
          profile_img: message.sender.getProfileImage(),
        },
        room_name: message.room,
        content: message.content,
      };
      Vars.platforms.forEach((platform) => platform.send(messageData));

      this.commands.forEach((cmd) => cmd.run(message));

      if (process.env.DEBUG)
        console.log(
          `<Kakao> [${message.room}] ${message.sender.name}: ${message.content}`
        );
    });

    this.server.start(process.env.PORT || 4000);
  }
}

export default new KakaoClient();
