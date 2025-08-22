import { Discord, Google } from "arctic";
import { env } from "@/env";
import { absoluteUrl } from "@/lib/utils";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { Session, sessions, User, users } from "@/db/schema";
import { eq } from "drizzle-orm/expressions";
import { sha256 } from "@oslojs/crypto/sha2";
import { getSessionToken } from "./session";
import { db } from "@/db";
import * as Sentry from "@sentry/react";

export const discord = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  absoluteUrl("api/login/discord/callback")
);

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  absoluteUrl("api/login/google/callback")
);

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15;
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2;

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export function generateId(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(array[i] % charactersLength);
  }
  return result;
}

export async function createSession(token: string, userId: string): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + SESSION_MAX_DURATION_MS),
  };
  await db.insert(sessions).values(session);
  return session;
}

export async function validateRequest(): Promise<SessionValidationResult> {
  const sessionToken = getSessionToken();
  if (!sessionToken) {
    return { session: null, user: null };
  }
  return validateSessionToken(sessionToken);
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const [sessionInDb] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  if (!sessionInDb) {
    return { session: null, user: null };
  }
  if (Date.now() >= sessionInDb.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, sessionInDb.id));
    return { session: null, user: null };
  }
  const [user] = await db.select().from(users).where(eq(users.id, sessionInDb.userId));

  if (!user) {
    await db.delete(sessions).where(eq(sessions.id, sessionInDb.id));
    return { session: null, user: null };
  }

  if (Date.now() >= sessionInDb.expiresAt.getTime() - SESSION_REFRESH_INTERVAL_MS) {
    sessionInDb.expiresAt = new Date(Date.now() + SESSION_MAX_DURATION_MS);
    await db
      .update(sessions)
      .set({
        expiresAt: sessionInDb.expiresAt,
      })
      .where(eq(sessions.id, sessionInDb.id));
  }
  return { session: sessionInDb, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  try {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  } catch (error) {
    console.error(`Error invalidating session with ID ${sessionId}:`, error);
    Sentry.captureException(error);
  }
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  try {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  } catch (error) {
    console.error(`Error invalidating sessions for user with ID ${userId}:`, error);
    Sentry.captureException(error);
  }
}
export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
