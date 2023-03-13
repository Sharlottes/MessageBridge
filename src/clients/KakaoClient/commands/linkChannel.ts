import Message from "@remote-kakao/core/dist/message";
import Vars from "@/Vars";
import { getKakaoId } from "@/utils/getKakaoId";

export function linkChannel(msg: Message, id: string) {
  const platform = Vars.mappedPlatforms.get(getKakaoId(msg));
  if (!platform) throw new Error("에러: 현재 플랫폼을 찾을 수 없습니다.");

  const targetPlatform = Vars.mappedPlatforms.get(id);
  if (!targetPlatform) throw new Error("에러: 해당 플랫폼을 찾을 수 없습니다.");

  if (platform.linkedPlatforms.has(targetPlatform))
    throw new Error(
      `에러: ${platform.getRoomName()}은(는) 이미 연결된 상태입니다.`
    );

  msg.reply(`연결 대기중...`).catch(console.log);
  targetPlatform
    .linkPerm(platform)
    .then((permer) => {
      platform.link(targetPlatform);
      msg
        .reply(
          `연결 완료: ${permer}(이)가 요청을 승인했습니다.\n${platform.getRoomName()} <------> ${targetPlatform.getRoomName()}`
        )
        .catch();
    })
    .catch((err) => {
      msg.reply(err).catch(console.log);
    });
}
