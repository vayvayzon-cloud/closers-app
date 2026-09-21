import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "./db";
import type { User } from "./types";

const COOKIE_NAME = "closers_session";
const SESSION_DAYS = 7;

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  const db = await readDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.active
  );
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  const token = uuid();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await updateDb((d) => {
    d.sessions = d.sessions.filter((s) => new Date(s.expiresAt) > now);
    d.sessions.push({
      token,
      userId: user.id,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    });
  });

  return { user, token };
}

export async function logout(token: string) {
  await updateDb((d) => {
    d.sessions = d.sessions.filter((s) => s.token !== token);
  });
}

export async function getUserFromToken(
  token: string | undefined
): Promise<User | null> {
  if (!token) return null;
  const db = await readDb();
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    await updateDb((d) => {
      d.sessions = d.sessions.filter((s) => s.token !== token);
    });
    return null;
  }
  const user = db.users.find((u) => u.id === session.userId && u.active);
  return user || null;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return await getUserFromToken(token);
}

export function getSessionToken(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export { COOKIE_NAME, SESSION_DAYS };

export function publicUser(user: User) {
  const { passwordHash, ...rest } = user;
  void passwordHash;
  return rest;
}
