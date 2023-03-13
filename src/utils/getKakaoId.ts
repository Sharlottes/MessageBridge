import { Message } from "@remote-kakao/core";
export const getKakaoId = (message: Message) => message.room;
