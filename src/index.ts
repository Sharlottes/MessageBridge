import { Kakao } from "@KakaoBridge/kakao";
import { Discord } from "@KakaoBridge/discord";

require("dotenv").config();

Kakao.init();
Discord.init();

process.on('unhandledrejection', err => console.log(err));