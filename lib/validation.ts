import { z } from "zod";

export function luhnValid(number: string) {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function expiryValid(exp: string, now = new Date()) {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(exp.trim());
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  return year > now.getUTCFullYear() || (year === now.getUTCFullYear() && month >= now.getUTCMonth() + 1);
}

export const cardSchema = z.object({
  name: z.string().trim().min(2, "Enter the name on the card"),
  number: z.string().refine(luhnValid, "Enter a valid card number"),
  exp: z.string().refine((v) => expiryValid(v), "Enter a valid future expiry date (MM/YY)"),
  cvc: z.string().regex(/^\d{3,4}$/, "Enter the 3 or 4 digit security code"),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter a full name").max(80),
  line1: z.string().trim().min(3, "Enter a street address").max(120),
  line2: z.string().trim().max(120).optional().transform((v) => v || undefined),
  city: z.string().trim().min(2, "Enter a city").max(60),
  state: z.string().trim().regex(/^[A-Za-z]{2}$/, "Use the 2-letter state code").transform((s) => s.toUpperCase()),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  phone: z.string().trim().regex(/^[\d\s()+-]{7,20}$/, "Enter a valid phone number"),
});

export type AddressInput = z.input<typeof addressSchema>;
export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

export const cardBrand = (number: string) => {
  const d = number.replace(/\D/g, "");
  if (/^4/.test(d)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "American Express";
  if (/^6/.test(d)) return "Discover";
  return "Card";
};
