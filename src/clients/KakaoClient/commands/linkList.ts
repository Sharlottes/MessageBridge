import Message from "@remote-kakao/core/dist/message";
import Vars from "@/Vars";
import { getKakaoId } from "@/utils/getKakaoId";

export function linkList(msg: Message) {
  const platform = Vars.mappedPlatforms.get(getKakaoId(msg));
  if (!platform) throw new Error("에러: 현재 플랫폼을 찾을 수 없습니다.");
  if (platform.linkedPlatforms.size == 0)
    throw new Error("에러: 연결이 없습니다.");
  msg
    .reply(
      "연결 목록\n" +
        Array.from(platform.linkedPlatforms)
          .map(
            (chat) =>
              `${platform.getRoomName()} <------> ${chat.getRoomName()}(${chat.getId()})`
          )
          .join("\n")
    )
    .catch(console.log);
}
