"use server";

import bcrypt from "bcryptjs";
import { refresh } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { addressSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

export type FormState = { ok?: boolean; message?: string; fieldErrors?: FieldErrors };

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");
  return session.user.id;
}

const DEMO_EMAIL = "demo@example.com";

export async function updateName(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const parsed = z.object({ name: z.string().trim().min(1, "Enter your name").max(80) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };
  await db.user.update({ where: { id: userId }, data: { name: parsed.data.name } });
  refresh();
  return { ok: true, message: "Your name has been updated. It shows everywhere after your next sign-in." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    password: z.string().min(8, "Passwords must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords must match." });

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  // Keeps the one-click demo login working for every reviewer.
  if (user.email === DEMO_EMAIL) return { message: "The demo account's password can't be changed. Create your own account to try this." };
  if (!(await bcrypt.compare(parsed.data.current, user.passwordHash))) {
    return { fieldErrors: { current: "Your current password is incorrect." } };
  }
  await db.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) } });
  return { ok: true, message: "Your password has been changed." };
}

export async function saveAddress(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };
  const makeDefault = formData.get("isDefault") === "on";

  await db.$transaction(async (tx) => {
    if (makeDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    if (id) {
      const data = { ...parsed.data, line2: parsed.data.line2 ?? null, ...(makeDefault ? { isDefault: true } : {}) };
      const res = await tx.address.updateMany({ where: { id, userId }, data });
      if (res.count === 0) throw new Error("Address not found");
    } else {
      // The first address is always the default.
      const isFirst = (await tx.address.count({ where: { userId } })) === 0;
      await tx.address.create({ data: { ...parsed.data, userId, isDefault: makeDefault || isFirst } });
    }
  });
  refresh();
  return { ok: true, message: id ? "Address updated." : "Address saved." };
}

export async function deleteAddress(id: string) {
  const userId = await requireUserId();
  await db.$transaction(async (tx) => {
    const addr = await tx.address.findFirst({ where: { id, userId } });
    if (!addr) return;
    await tx.address.delete({ where: { id: addr.id } });
    // Keep exactly one default when the default is removed.
    if (addr.isDefault) {
      const next = await tx.address.findFirst({ where: { userId }, orderBy: { id: "asc" } });
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  });
  refresh();
}

export async function setDefaultAddress(id: string) {
  const userId = await requireUserId();
  await db.$transaction(async (tx) => {
    const addr = await tx.address.findFirst({ where: { id, userId } });
    if (!addr) return;
    await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    await tx.address.update({ where: { id: addr.id }, data: { isDefault: true } });
  });
  refresh();
}
