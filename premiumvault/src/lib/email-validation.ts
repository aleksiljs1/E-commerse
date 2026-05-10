import { z } from "zod";

// Strict email regex: requires valid format with a real TLD (2+ chars)
// Rejects: test@test, user@localhost, a@b, fake@.com, etc.
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .regex(EMAIL_REGEX, "Please enter a valid email address");

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
