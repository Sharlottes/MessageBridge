export { default as Command } from "./Command";

import { ApplicationCommand, Collection, Guild, GuildResolvable } from "discord.js";
import { Routes } from "discord-api-types/v9";

import { CommandInfo } from "../@type";
import { Command } from "../commands";
import app from "../index";

namespace CommandManager {
    export const commands: Collection<string, Command> = new Collection();
    
    /**
     * 
     * @param command
     * @returns 명령어 추가여부
     */
    export async function register(command: Command): Promise<boolean> {
        const commandName: string = command.builder.name;

        if(!commands.has(commandName)) {
            commands.set(commandName, command);
            console.log(`[Command] register [ /${command.builder.name} ] to ${command.category} command.`);
            return true;
        } else {
            return false;
        }
    }

    /**
     * 
     * @param target 
     */
    export async function refreshCommand(target: "global"): Promise<ApplicationCommand<{guild: GuildResolvable;}>[]>;
    /**
     * 
     * @param target
     * @param guild 
     */
    export async function refreshCommand(target: "guild", guild: Guild): Promise<ApplicationCommand<{guild: GuildResolvable;}>[]>;
    
    export async function refreshCommand(target: "global" | "guild", guild?: Guild)
    : Promise<ApplicationCommand<{guild: GuildResolvable;}>[]> {
        const application = app.client.application;
        if(application == null || guild == undefined) return [];

        const commandPath = target == "global" ? 
            Routes.applicationCommands(application.id) : 
            Routes.applicationGuildCommands(application.id, guild.id);
    
        const data = await app.rest.get(commandPath) as CommandInfo[];
        const promiese = [];
        for(let i = 0; i < data.length; i++) {
            const command: CommandInfo = data[i];
            promiese.push(app.rest.delete(`${commandPath}/${command.id}`));
        }
        
        await Promise.all(promiese);

        // 명령어 재선언
        const createSeq: Promise<ApplicationCommand>[] = [];
        
        commands.forEach(command => {
            if(command.category == target) {
                const data = command.setHiddenConfig(command.builder.toJSON());
                createSeq.push(application.commands.create(data, target == "global" ? undefined : guild.id));
            }
        })

        return await Promise.all(createSeq);
    }
}

export default CommandManager;