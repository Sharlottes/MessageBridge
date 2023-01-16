import { Kakao } from "@KakaoBridge/kakao";
import { Discord } from "@KakaoBridge/discord";

require("dotenv").config();

Kakao.init();
Discord.init();

process.on("unhandledRejection", (err) => console.log(err));
process.on("uncaughtException", (err) => console.log(err));
