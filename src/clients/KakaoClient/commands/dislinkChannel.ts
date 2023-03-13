import Message from "@remote-kakao/core/dist/message";
import Vars from "@/Vars";
import { getKakaoId } from "@/utils/getKakaoId";

export function dislinkChannel(msg: Message, id: string) {
  const platform = Vars.mappedPlatforms.get(getKakaoId(msg));
  if (!platform) throw new Error("에러: 현재 플랫폼을 찾을 수 없습니다.");

  const targetPlatform = Vars.mappedPlatforms.get(id);
  if (!targetPlatform) throw new Error("에러: 해당 플랫폼을 찾을 수 없습니다.");

  platform.dislink(targetPlatform);
  msg.reply(`연결 해제 완료`);
}
