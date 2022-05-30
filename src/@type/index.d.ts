
export type CommandCategory = "guild" | "global"

export type CommandInfo = {
    id: string
    application_id: string
    version: string
    default_permissions: null
    type: number
    name: string
    description: string
    guild_id: string
}