interface MessageData {
  sender: {
    name: string;
    profile_img?: string | undefined | null;
  };
  content: string;
  room_name: string;
}

interface DiscordCommandInfo {
  id: string;
  application_id: string;
  version: string;
  default_permissions: null;
  type: number;
  name: string;
  description: string;
  guild_id: string;
}
