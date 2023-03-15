<h1 align="center">Message Bridge</h1>

<div align="center">

[![typescript](https://img.shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=white)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/badge/license-MIT-critical)](https://github.com/Sharlottes/MessageBridge/blob/master/LICENSE)
[![GitHub Repo stars](https://img.shields.io/github/stars/sharlottes/MessageBridge?label=Please%20star%20me%21&style=social)](https://github.com/sharlottes/MessageBridge/stargazers)

[![Discord.js](https://img.shields.io/npm/v/discord.js?color=7289DA&label=discord.js&logo=discord&logoColor=white)](https://www.npmjs.com/package/discord.js)
[![RemoteKakao](https://img.shields.io/npm/v/@remote-kakao/core?color=FF8CAD&label=remote-kakao&logo=kakaotalk)](https://www.npmjs.com/package/@remote-kakao/core)

[![Discord](https://img.shields.io/badge/Sharlotte%230018-7289DA?logo=discord&logoColor=white&style=flat-square)](https://discordapp.com/users/473072758629203980)

다중 채팅방 쌍방향 문자 통신 카카오톡/디스코드/Swit 챗봇

</div>

## Motivation

정보화 시대에서, 여러가지 SNS 플렛폼들이 부지기수로 늘어나고 수많은 채팅 어플리케이션들이 생겨나 소통의 기회는 넘치다 못해 과한 상태가 되었습니다.  
수요자에 비해 공급이 비대해져 SNS 수에 비해 커뮤니티 또는 해당 토픽을 가진 사람들의 수가 상대적으로 적어졌습니다. 저는 한 게임에서 여러 사용자들이 르네상스 시대마냥 각 SNS에 소규모로 분포되던걸 목격했습니다. *소통의 갈라파고스화*는 의도치 않은 소통 범주의 소규모화를 초례합니다. **소통의 범주는 통일되어야 할 필요가 있습니다.**  
또한, SNS 플렛폼들의 경쟁 생태계로 개성있는 다양한 SNS들이 생겨났지만 한 단체 및 무리가 여러 SNS 및 메신저 어플리케이션을 동시에 두는건 꽤나 번거롭고, 비생산적인 관리 비용이 생길 수 있습니다. 전 이것 또한 여러 무리와 단체, 팀, 토픽에서 보아왔습니다. **소통은 거침없이 여러 플렛폼을 관통할 수 있어야 합니다.**

## Get Start

> **Notice**  
> 이 서비스는 현재 **24/7 온라인 서비스 상태가 아닙니다.**  
> ~~개발자가 그지라서~~..가 아니라 몇가지 이유로 인해 서비스 운영을 할 수 없는 상태입니다. 이것이 왜 서비스 소개 사이트를 두지 않고 레포지토리만 둔 이유입니다.
>
> 따라서 사용자들이 직접 레포지토리를 다운받아 아래 절차에 따라 서비스를 실행해야 합니다. 개인적으로, 보안상 이게 더 좋은 방법이라 권장드리고 싶습니다.

### 기본 환경변수 설정

```bash
PORT=4000
DEBUG=true
```

- `PORT`: 봇 서버 호스트 포트
- `DEBUG`: 디버깅 여부

### with Kakaotalk Bot

> #### **Notice**
>
> <details>
>
> - **카카오톡 봇은 비공식적이며 해석에 따라 운영정책 위반 사유가 될 수 있습니다.**  
>   카카오톡 봇을 구현하는 방법엔 여러가지가 있으나 이 문단에선 그나마 가장 해가 되지 않은 방법을 소개합니다. 이건 정지를 절대 먹지 않는단 말이 아닙니다, 가능한 해외 전화번호나 투넘버 요금제를 구매하여 봇 계정을 따로 만들어서 사용하세요!
>
> - **카카오톡 봇은 오직 안드로이드 기기에서만 가능합니다.**  
>   카카오톡 봇의 구조적인 문제로 인해, 이 봇은 오직 안드로이드 기기에서만 사용할 수 있습니다. 애플과 같은 IOS는 부득이하게도 사용할 수 없습니다.
>
> - **카카오톡 봇은 사용자가 봇 기기/계정으로 카카오톡을 사용할 땐 작동하지 않습니다.**  
>   위와 같이 카카오톡 봇의 구조적인 문제로 인해, 사용자가 봇 기기/계정으로 카카오톡을 사용하면 최종적으로 **봇 계정에 알람이 생기지 않아** 앱이 알람을 후킹하지 못하여 스크립트가 메시지 데이터를 받을 수 없기 때문에 봇이 작동할 땐 봇 계정으로 메시지를 확인해선 안됩니다. 알람이 생기지 않아요.
>
> </details>

#### 봇 초기 설정

1. [채팅 자동응답 봇](https://github.com/DarkTornado/KakaoTalkBot/releases/latest)을 설치하고 앱에서 새로운 자바스크립트 봇을 생성하세요.

   > **notice**
   >
   > - config의 address와 port에 알맞은 서버 IP와 포트 숫자를 입력하는 것을 잊지 마세요.
   > - 카카오톡 봇이 작동하지 않을 땐 기존 ThroubleShooting를 확인하기 전 [채팅 자동응답 봇 체크리스트](https://darktornado.github.io/KakaoTalkBot/docs/check-list/)를 먼저 확인해주세요.

2. 아래 코드를 입력해주세요. 앱이 카카오톡으로부터 알람을 후킹하고 분석해서 재가공한 메시지 데이터를 서버로 송신하는 코드입니다.

   <details>
   <summary>카카오톡 봇 코드 확인하기</summary>

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
   const buffer = java.lang.reflect.Array.newInstance(
     java.lang.Byte.TYPE,
     65535
   );
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

   </details>

3. 저장하고 컴파일한 다음 봇을 키세요.

#### 카카오톡 봇 실행

봇을 키고 네트워크 상태를 확인하세요. 봇 서버는 메인 서버가 담당하고 있기 때문에 서버가 켜져있다면 봇 서버도 정상적으로 작동합니다.

### with Discord Bot

#### Discord 환경변수 설정

디스코드 봇은 공식적이며, 개발자와 디스코드 팀에 의해 제어됩니다. 그러므로 제어를 위해 보안상 토큰이 필요합니다.
[discord.js의 공식 문서에서 디스코드 봇 어플리케이션 설정 문서를 확인해보세요.](https://discordjs.guide/preparations/setting-up-a-bot-application.html#setting-up-a-bot-application)

```bash
DISCORD_TOKEN="디스코드 봇 토큰"
```

#### 디스코드 봇 실행

네트워크 상태를 확인하고 봇을 **자신의 디스코드 서버**에 초대한 다음 `!refresh`를 입력하세요.

### with Swit Bot

comming soon...

#### Swit 환경변수 설정

```bash
SWIT_CLIENT_ID="Swit OAuth2 어플리케이션 ID"
SWIT_CLIENT_SECRET="Swit OAuth2 어플리케이션 Secret"
```

#### 스윗 봇 실행

네트워크 상태를 확인하고 봇을 자신의 워크스페이스에 초대하세요. **현재 미개발 상태**
