import DiscordClient from "..";
import { Collection, Guild } from "discord.js";
import { Routes } from "discord-api-types/v10";
import DiscordCommand from "./DiscordCommand";

class DiscordCommandManager {
  public commands: Collection<string, DiscordCommand> = new Collection();

  /**
   * 새로운 빗금 명령어를 등록합니다.
   * @param command
   * @returns 명령어 추가여부
   */
  public async register(command: DiscordCommand): Promise<boolean> {
    if (this.commands.has(command.builder.name)) return false;
    this.commands.set(command.builder.name, command);
    if (process.env.DEBUG)
      console.log(
        `[Command] register [ /${command.builder.name} ] to ${command.category} command.`
      );
    return true;
  }

  public async refreshCommand(target: "global"): Promise<void>;
  public async refreshCommand(target: "guild", guild: Guild): Promise<void>;
  /**
   * 빗금 명령어를 새로고침합니다.
   * @param target 명령어 적용 범주, 서버 또는 전역
   * @param guild 적용할 서버
   */
  public async refreshCommand(
    target: "global" | "guild",
    guild?: Guild
  ): Promise<void> {
    const application = DiscordClient.client.application;
    if (!(application && guild)) return;

    const commandPath =
      target == "global"
        ? Routes.applicationCommands(application.id)
        : Routes.applicationGuildCommands(application.id, guild.id);

    // 명령어 제거
    await Promise.all(
      (
        (await DiscordClient.client.rest.get(
          commandPath
        )) as DiscordCommandInfo[]
      ).map((command) =>
        DiscordClient.client.rest.delete(`${commandPath}/${command.id}`)
      )
    );

    // 명령어 재등록
    await Promise.all(
      this.commands.reduce(
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

export default new DiscordCommandManager();
