export { default as Command } from "./Command";

import { Collection, Guild } from "discord.js";
import { Routes } from "discord-api-types/v10";

import { Command, Discord } from "@KakaoBridge/discord";

type CommandInfo = {
  id: string;
  application_id: string;
  version: string;
  default_permissions: null;
  type: number;
  name: string;
  description: string;
  guild_id: string;
};

namespace CommandManager {
  export const commands: Collection<string, Command> = new Collection();

  /**
   * 새로운 빗금 명령어를 등록합니다.
   * @param command
   * @returns 명령어 추가여부
   */
  export async function register(command: Command): Promise<boolean> {
    if (commands.has(command.builder.name)) return false;
    commands.set(command.builder.name, command);
    if (process.env.DEBUG)
      console.log(
        `[Command] register [ /${command.builder.name} ] to ${command.category} command.`
      );
    return true;
  }

  export async function refreshCommand(target: "global"): Promise<void>;
  export async function refreshCommand(
    target: "guild",
    guild: Guild
  ): Promise<void>;
  /**
   * 빗금 명령어를 새로고침합니다.
   * @param target 명령어 적용 범주, 서버 또는 전역
   * @param guild 적용할 서버
   */
  export async function refreshCommand(
    target: "global" | "guild",
    guild?: Guild
  ): Promise<void> {
    const application = Discord.client.application;
    if (!(application && guild)) return;

    const commandPath =
      target == "global"
        ? Routes.applicationCommands(application.id)
        : Routes.applicationGuildCommands(application.id, guild.id);

    // 명령어 제거
    await Promise.all(
      ((await Discord.client.rest.get(commandPath)) as CommandInfo[]).map(
        (command) => Discord.client.rest.delete(`${commandPath}/${command.id}`)
      )
    );

    // 명령어 재등록
    await Promise.all(
      commands.reduce(
        (sequence, command) =>
          command.category == target
            ? [
                ...sequence,
                application.commands.create(
                  command.builder.toJSON(),
                  target == "global" ? undefined : guild.id
                ),
              ]
            : sequence,
        [] as Promise<any>[]
      )
    );
  }
}

export default CommandManager;
