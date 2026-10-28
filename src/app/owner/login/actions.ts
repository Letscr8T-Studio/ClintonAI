"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { OWNER_HOME_PATH, loginLimiter } from "@/server/auth/guard";
import {
  SESSION_COOKIE,
  checkCredentials,
  createSessionToken,
  sessionCookieOptions,
} from "@/server/auth/session";
import { clientIp } from "@/server/http";

export type LoginState = { error?: string };

const GENERIC_ERROR = "Wrong email or password.";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = clientIp(await headers());
  if (loginLimiter.isLimited(ip)) return { error: "Too many attempts. Try again in 15 minutes." };

  const email = formData.get("email");
  const password = formData.get("password");
  const wellFormed =
    typeof email === "string" &&
    typeof password === "string" &&
    email.length <= 254 &&
    password.length <= 200;

  const token = wellFormed && checkCredentials(email, password) ? createSessionToken(email) : null;
  if (!token) {
    loginLimiter.hit(ip);
    return { error: GENERIC_ERROR };
  }

  loginLimiter.reset(ip);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect(OWNER_HOME_PATH);
}
