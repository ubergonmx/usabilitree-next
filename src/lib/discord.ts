import { env } from "@/env";
import { REST } from "@discordjs/rest";
import {
  RESTPostAPIChannelMessageResult,
  RESTPostAPICurrentUserCreateDMChannelResult,
  Routes,
  APIEmbed,
} from "discord-api-types/v10";

export class DiscordClient {
  private rest: REST;
  private DISCORD_ID = 263841596213035009;

  constructor() {
    this.rest = new REST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);
  }

  private async createDM(discordId: number = this.DISCORD_ID) {
    return this.rest.post(Routes.userChannels(), {
      body: {
        recipient_id: discordId,
      },
    }) as Promise<RESTPostAPICurrentUserCreateDMChannelResult>;
  }

  async sendEmbed(embed: APIEmbed, discordId?: number) {
    const { id } = await this.createDM(discordId);
    return this.rest.post(Routes.channelMessages(id), {
      body: {
        embeds: [embed],
      },
    }) as Promise<RESTPostAPIChannelMessageResult>;
  }
}

export const notifyNewUser = async (
  id: string,
  email: string,
  verified: string,
  avatar: string | null
) => {
  const discord = new DiscordClient();
  await discord.sendEmbed({
    title: "👤 New User",
    description: "A new user has signed up!",
    color: 0x00d9c2,
    fields: [
      {
        name: "ID",
        value: id,
        inline: true,
      },
      {
        name: "Email",
        value: email,
        inline: true,
      },
      {
        name: "Verified",
        value: verified,
        inline: true,
      },
    ],
    image: {
      url: avatar ?? "",
    },
    timestamp: new Date().toISOString(),
  });
};
