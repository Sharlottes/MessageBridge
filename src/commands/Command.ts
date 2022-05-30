import { CommandInteraction, CacheType } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { CommandCategory } from "../@type";

abstract class Command {
    public readonly category: CommandCategory;
    public readonly dmOnly: boolean;
    public readonly debug: boolean;
    public readonly builder: SlashCommandBuilder;
    
    public abstract run(interaction: CommandInteraction<CacheType>): void;

    constructor(
        category: CommandCategory = "guild", 
        debug = true,
        dmOnly = false,
        builder = new SlashCommandBuilder()
    ) {
        this.builder = builder;
        this.category = category;
        this.dmOnly = dmOnly;
        this.debug = debug ;
        
        this.builder.setDefaultPermission(false);
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public /*virtual*/ setHiddenConfig(option: any): any {
        return option;
    }
}

export default Command;