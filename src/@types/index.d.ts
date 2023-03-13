declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      DEBUG: boolean;
      DISCORD_TOKEN: string;
    }
  }
}

export {};
