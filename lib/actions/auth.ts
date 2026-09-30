"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { mergeGuestCartInto } from "@/lib/actions/cart";

export type AuthState = { error?: string; fieldErrors?: Record<string, string>; email?: string; step?: "email" | "password" };

const safeCallback = (raw: FormDataEntryValue | null) => {
  const url = typeof raw === "string" ? raw : "";
  return url.startsWith("/") && !url.startsWith("//") ? url : "/";
};

async function signInAndMerge(email: string, password: string, redirectTo: string): Promise<AuthState | undefined> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Your password is incorrect.", email, step: "password" };
  }
  await mergeGuestCartInto(user.id);
  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (e) {
    if (e instanceof AuthError) return { error: "We couldn't sign you in. Please try again.", email, step: "password" };
    throw e; // redirect
  }
}

const emailSchema = z.email("Enter a valid email address").transform((e) => e.toLowerCase().trim());

// Two-step sign-in: step one checks the email exists, step two checks the password.
export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const emailParsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!emailParsed.success) return { error: emailParsed.error.issues[0].message, step: "email" };
  const email = emailParsed.data;
  const password = String(formData.get("password") ?? "");

  if (formData.get("step") === "email") {
    const exists = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (!exists) return { error: "We cannot find an account with that email address.", step: "email", email };
    return { step: "password", email };
  }
  if (!password) return { error: "Enter your password.", step: "password", email };
  return (await signInAndMerge(email, password, safeCallback(formData.get("callbackUrl")))) ?? {};
}

export async function demoSignInAction(formData: FormData) {
  const password = process.env.DEMO_USER_PASSWORD;
  if (!password) throw new Error("Demo account is not configured");
  await signInAndMerge("demo@example.com", password, safeCallback(formData.get("callbackUrl")));
}

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(80),
    email: emailSchema,
    password: z.string().min(8, "Passwords must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords must match." });

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { fieldErrors, email: String(formData.get("email") ?? "") };
  }
  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return { fieldErrors: { email: "An account with this email already exists. Sign in instead." }, email };
  }
  await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 10) } });
  return (await signInAndMerge(email, password, safeCallback(formData.get("callbackUrl")))) ?? {};
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
