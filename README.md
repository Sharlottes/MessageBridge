<h1 align="center">Kakao Bridge</h1>
<div align="center">

[![typescript](https://img.shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=white)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/badge/license-MIT-critical)](https://github.com/Sharlottes/KakaoBridge/blob/master/LICENSE)
[![GitHub Repo stars](https://img.shields.io/github/stars/sharlottes/kakaobridge?label=Please%20star%20me%21&style=social)](https://github.com/sharlottes/kakaobridge/stargazers)

[![Discord.js](https://img.shields.io/npm/v/discord.js?color=7289DA&label=discord.js&logo=discord&logoColor=white)](https://www.npmjs.com/package/discord.js)
[![RemoteKakao](https://img.shields.io/npm/v/@remote-kakao/core?color=FF8CAD&label=remote-kakao&logo=kakaotalk)](https://www.npmjs.com/package/@remote-kakao/core)

[![Discord](https://img.shields.io/discord/782583108473978880.svg?logo=discord&logoColor=white&labelColor=7289DA&label=Team%20Avant&style=flat-square)](https://discord.gg/p66YqUfRT4)
[![Discord](https://img.shields.io/badge/Sharlotte%230018-7289DA?logo=discord&logoColor=white&style=flat-square)](https://discordapp.com/users/473072758629203980)

디스코드 채널 <---> 카카오톡 채팅방 쌍방향 문자 통신 카카오톡/디스코드 봇

</div>

## Config

1. 환경 파일 생성
   최상단 경로에 .env 를 생성하여 아래와 값을 적절히 입력합니다.

```env
PORT: 4000,
DEBUG: true,
DISCORD_TOKEN: 디스코드 봇 토큰,
KAKAOLINK_EMAIL: 카카오링크 이메일,
KAKAOLINK_PASSWORD: 카카오링크 비밀번호,
KAKAOLINK_DOMAIN: 카카오링크 어플리케이션 웹플렛폼 도메인,
KAKAOLINK_JAVASCRIPT_KEY: 카카오링크 어플리케이션 자바스크립트 키
```

2. 카카오톡 수신 기기 설정 (**안드로이드만 가능**)

- [체팅자동응답봇-beta5](https://github.com/DarkTornado/KakaoTalkBot/releases/tag/v5.0_beta_5) 설치
- 새로운 봇 생성 후 아래 코드 입력, **config의 address에 디스코드 서버 IP 입력해야 함**

```js
//from remote-kakao module example code, edited by Sharlotte

importPackage(java.io);
importPackage(java.net);

const bot = BotManager.getCurrentBot();
const config = {
  address: "0.0.0.0", //Discord Bot Client IP
  port: 4000,
};
const socket = new DatagramSocket();
const address = InetAddress.getByName(config.address);
const buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 65535);
const inPacket = new DatagramPacket(buffer, buffer.length);

const sendPacket = (stringfied) => {
  const bytes = new java.lang.String(stringfied).getBytes();
  const outPacket = new DatagramPacket(
    bytes,
    bytes.length,
    address,
    config.port
  );
  socket.send(outPacket);
};

const uploadImage = function (name, stream) {
  const con = org.jsoup.Jsoup.connect("https://up-m.talk.kakao.com/upload")
    .header("A", "An/9.0.0/ko")
    .data("user_id", "-1")
    .data("attachment_type", "image/jpeg")
    .data("file", name, stream)
    .ignoreHttpErrors(true)
    .method(org.jsoup.Connection.Method.POST)
    .execute();
  return con.body();
};
const reply = (json) => {
  const {
    event,
    data: { room, text },
    session,
  } = json;

  if (event == "sendText") {
    sendPacket(
      JSON.stringify({
        session: session,
        success: Api.replyRoom(room, (text || "").toString()),
      })
    );
  }
};
const thread = new java.lang.Thread({
  run: () => {
    while (true) {
      socket.receive(inPacket);
      reply(
        JSON.parse(
          decodeURIComponent(
            String(
              new java.lang.String(
                inPacket.getData(),
                inPacket.getOffset(),
                inPacket.getLength()
              )
            )
          )
        )
      );
    }
  },
});
thread.start();
bot.addListener(Event.START_COMPILE, () => thread.interrupt());
bot.addListener(Event.MESSAGE, (msg) => {
  android.os.StrictMode.enableDefaults();

  const bos = new ByteArrayOutputStream();
  msg.author.avatar
    .getBitmap()
    .compress(android.graphics.Bitmap.CompressFormat.PNG, 0, bos);
  const url = uploadImage(
    Date.now().toString() + msg.author.name,
    new ByteArrayInputStream(bos.toByteArray())
  );

  try {
    sendPacket(
      JSON.stringify({
        event: "chat",
        data: {
          room: msg.room,
          content: msg.content,
          sender: msg.author.name,
          isGroupChat: msg.isGroupChat,
          profileImage: `http://dn-m.talk.kakao.com/${url}`,
          packageName: msg.packageName,
        },
      })
    );
  } catch (err) {
    Log.i(err);
  }
});
```

## Start

### Run Discord Bot

```
yarn
yarn r
```

서버가 인터넷 외부 통신과 연결 가능한 상태여야 함.

### Run Kakaotalk Bot

앱을 키고 해당 봇 활성화. 백그라운드에서도 잘 실행하지만 인터넷 및 기기 환경에 따라 송수신이 불안정할 수 있음.

## Connecting

해당 카카오톡 채팅방과 디스코드 채널에 모두 카카오톡 봇과 디스코드 봇이 있어야 함.

### Connect from Discord

원하는 서버에서 `!refresh` 입력. 이후 명령어 사용,  
해당 디스코드 채널에서 `/sessions` 로 연결 가능한 채팅방 이름을 알고 `/link <카카오톡 채팅방 이름>`로 연결 요청,  
해당 카카오톡 채팅방에서 yes를 입력하여 수락, no를 입력하여 거절.

### Connect from Kakao

해당 카카오톡 채팅방에서 `!link <guild id> <channel id>`로 연결 요청,  
해당 디스코드 채널에서 수락 또는 거절 버튼 터치.

### Disconnect

위 명령어에서 `link`대신 `dislink`입력
