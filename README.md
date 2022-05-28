# Kakao Bridge
![typescript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white)
[![GitHub Repo stars](https://img.shields.io/github/stars/sharlottes/kakaobridge?label=Please%20star%20me%21&style=social)](https://github.com/sharlottes/kakaobridge/stargazers)

[![Discord](https://img.shields.io/discord/704355237246402721.svg?logo=discord&logoColor=white&logoWidth=20&labelColor=7289DA&label=_de_Discord)](https://discord.gg/RCCVQFW)
[![Discord](https://img.shields.io/discord/715883181215055874.svg?logo=discord&logoColor=white&logoWidth=20&labelColor=7289DA&label=my_Discord)](https://discord.gg/cGVae6gwdW)


디스코드 서버 <---> 카카오톡 채팅방 쌍방향 통신 디스코드 봇

## Config
1. 설정 파일 생성
+ src/ 디렉토리에 아래 형식에 맞도록 `discord.json`를 생성. 이 절차는 봇 실행을 위한 **필수 과정**입니다.
```json
{
  "debug": true,
  "botToken": "봇 토큰"
}
```
+ src/ 디렉토리에 아래 형식에 맞도록 `kakao.json`을 생성
  + `globalPrefix`: 카카오톡 채팅방에서 사용할 명령어 접두사, 기본값 !
  + `port`: 카카오톡 봇에서 연결할 서버 포트, 기본값 4000
  + `kakaolink`: 카카오링크 초기화 값, 생략될 경우 카카오링크 비활성화. *현재 미완성 단계*
```json
{
  "globalPrefix": "!",
  "port": 4000,
  "kakaolink": {
    "email": "카카오링크 로그인 이메일",
    "password": "카카오링크 로그인 비밀번호",
    "key": "카카오링크 JavaScript Key",
    "host": "카카오링크 어플리케이션 웹 도메인"
  }
}

```
2. 카카오톡 수신 기기 설정 (**안드로이드만 가능**)
+ 채팅 자동응답 봇 설치

+ `sdcard/ChatBot/database/` 디렉토리에 `secret.json` 생성 후 아래와 같이 입력
```json
{
  "nodejs": {
    "address": "연결할 디스코드 서버 IP",
    "port": 4000
  }
}
```

+ 새로운 자바스크립트 봇 생성 후 아래 코드 입력
```js
//from remote-kakao module example code

const bot = BotManager.getCurrentBot();
const secret = Database.readObject("./secret.json");
const config = secret.nodejs;
const socket = new java.net.DatagramSocket();
const address = java.net.InetAddress.getByName(config.address);
const buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 65535);
const inPacket = new java.net.DatagramPacket(buffer, buffer.length);

const getBytes = function (str) { return new java.lang.String(str).getBytes(); };
const sendMessage = function (event, data) {
    const bytes = getBytes(JSON.stringify({ event: event, data: data }));
    const outPacket = new java.net.DatagramPacket(bytes, bytes.length, address, config.port);
    socket.send(outPacket);
};
const sendReply = function (session, success, data) {
    const bytes = getBytes(JSON.stringify({ session: session, success: success, data: data }));
    const outPacket = new java.net.DatagramPacket(bytes, bytes.length, address, config.port);
    socket.send(outPacket);
};
const handleMessage = function (msg) {
    let _a;
    const _b = JSON.parse(decodeURIComponent(msg)), event = _b.event, data = _b.data, session = _b.session;
    switch (event) {
        case 'sendText':
            const res = Api.replyRoom(data.room, ((_a = data.text) !== null && _a !== void 0 ? _a : '').toString());
            sendReply(session, res);
            break;
    }
};

const thread = new java.lang.Thread({
    run: function () {
        while (true) {
            socket.receive(inPacket);
            handleMessage(String(new java.lang.String(inPacket.getData(), inPacket.getOffset(), inPacket.getLength())));
        }
    },
});
thread.start();
bot.addListener(Event.MESSAGE, msg=>{
  sendMessage('chat', {
      room: msg.room,
      content: msg.content,
      sender: msg.author.name,
      isGroupChat: msg.isGroupChat,
      profileImage: java.lang.String(msg.author.avatar.getBase64()).hashCode(),
      packageName: msg.packageName,
  });
});
bot.addListener(Event.START_COMPILE, ()=>thread.interrupt());
```

## Start

### Run Discord Bot
```
yarn
npm run r
```

### Connect from Kakao
해당 방에서 `!link <guild id> <channel id>` 명령어 입력