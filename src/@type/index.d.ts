declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      DEBUG: boolean;
      DISCORD_TOKEN: string;
      KAKAOLINK_EMAIL?: string;
      KAKAOLINK_PASSWORD?: string;
      KAKAOLINK_DOMAIN?: string;
      KAKAOLINK_JAVASCRIPT_KEY?: string;
    }
  }
}

export {};
