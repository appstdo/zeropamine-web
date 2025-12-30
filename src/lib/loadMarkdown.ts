import { readFileSync } from "fs";
import { join } from "path";

/**
 * Loads a markdown file from the legal content directory
 * @param filename - The base filename without language suffix (e.g., "privacy-policy", "terms-of-service")
 * @param locale - The locale to load (e.g., "en", "ko", "ja")
 * @returns The markdown content as a string
 */
export function loadMarkdown(filename: string, locale: string): string {
  // Map locale to effective locale (fallback to English for unsupported locales)
  const effectiveLocale = locale === "ko" ? "ko" : "en";

  // Construct the full filename with locale
  const fullFilename = `${filename}.${effectiveLocale}.md`;

  // Get the path to the markdown file
  const filePath = join(process.cwd(), "src", "content", "legal", fullFilename);

  try {
    // Read and return the file content
    const content = readFileSync(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error loading markdown file: ${filePath}`, error);
    throw new Error(`Failed to load ${filename} for locale ${locale}`);
  }
}
