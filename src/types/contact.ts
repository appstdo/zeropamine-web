export const CONTACT_CATEGORIES = [
  "bug",
  "feature",
  "payment",
  "account",
  "other",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export interface ContactRequest {
  category: ContactCategory;
  email?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  error?: string;
}
