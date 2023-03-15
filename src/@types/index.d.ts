import { Envs } from "./envs";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Envs {}
  }
}
