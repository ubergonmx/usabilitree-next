import { cookies } from "next/headers";
import { generateId } from "@/lib/auth";
import { OAuth2RequestError } from "arctic";
import { eq, or } from "drizzle-orm";
import { discord } from "@/lib/auth";
import { db } from "@/db";
import { Paths } from "@/lib/constants";
import { users } from "@/db/schema";
import { setSession } from "@/lib/auth/session";
import { notifyNewUser } from "@/lib/discord";
import * as Sentry from "@sentry/react";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("discord_oauth_state")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
      headers: { Location: Paths.Login },
    });
  }

  try {
    const tokens = await discord.validateAuthorizationCode(code);

    const discordUserRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });
    const discordUser = (await discordUserRes.json()) as DiscordUser;

    if (!discordUser.email || !discordUser.verified) {
      return new Response(
        JSON.stringify({
          error: "Your Discord account must have a verified email address.",
        }),
        { status: 400, headers: { Location: Paths.Login } }
      );
    }
    const [existingUser] = await db
      .select()
      .from(users)
      .where(or(eq(users.discordId, discordUser.id), eq(users.email, discordUser.email!)));

    const avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.webp`
      : null;

    if (!existingUser) {
      const userId = generateId(21);
      await db.insert(users).values({
        id: userId,
        email: discordUser.email,
        emailVerified: true,
        discordId: discordUser.id,
        avatar,
      });
      await notifyNewUser(
        userId,
        discordUser.email,
        discordUser.verified ? "Yes (Discord)" : "No (Discord)",
        avatar
      );
      await setSession(userId);
      return new Response(null, {
        status: 302,
        headers: { Location: Paths.Dashboard },
      });
    }

    if (existingUser.discordId !== discordUser.id || existingUser.avatar !== avatar) {
      await db
        .update(users)
        .set({
          discordId: discordUser.id,
          emailVerified: true,
          avatar,
        })
        .where(eq(users.id, existingUser.id));
    }
    await setSession(existingUser.id);
    return new Response(null, {
      status: 302,
      headers: { Location: Paths.Dashboard },
    });
  } catch (error) {
    // the specific error message depends on the provider
    if (error instanceof OAuth2RequestError) {
      // invalid code
      return new Response(JSON.stringify({ message: "Invalid code" }), {
        status: 400,
      });
    }
    Sentry.captureException(error);
    return new Response(JSON.stringify({ message: "internal server error" }), {
      status: 500,
    });
  }
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  global_name: string | null;
  banner_color: string | null;
  mfa_enabled: boolean;
  locale: string;
  email: string | null;
  verified: boolean;
}
