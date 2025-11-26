import { z } from "zod";

/**
 * Validates that a URL is safe and from an allowed domain.
 * In production, you should restrict this to your own image hosting service.
 */
export const imageUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        // Allow common image hosting services and HTTPS only
        const allowedDomains = [
          "images.unsplash.com",
          "unsplash.com",
          "cloudinary.com",
          "imgur.com",
          "imagekit.io",
          "uploadthing.com",
          "vercel.app",
          "vercel-storage.com",
        ];

        // In development, allow localhost
        if (process.env.NODE_ENV === "development") {
          if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
            return true;
          }
        }

        // Check if HTTPS
        if (parsed.protocol !== "https:") {
          return false;
        }

        // Check if domain is allowed
        return allowedDomains.some((domain) =>
          parsed.hostname.endsWith(domain),
        );
      } catch {
        return false;
      }
    },
    {
      message:
        "Image URL must be HTTPS and from an allowed domain (e.g., Unsplash, Cloudinary, Imgur)",
    },
  );

/**
 * Sanitizes text input by trimming and limiting length.
 * Removes potentially dangerous characters for XSS prevention.
 */
export function sanitizeText(text: string, maxLength = 1000): string {
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ""); // Remove angle brackets to prevent HTML injection
}

/**
 * Validates and sanitizes country name
 */
export const countrySchema = z
  .string()
  .min(2, "Country name must be at least 2 characters")
  .max(120, "Country name must not exceed 120 characters")
  .transform((val) => sanitizeText(val));

/**
 * Validates and sanitizes person name
 */
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(120, "Name must not exceed 120 characters")
  .transform((val) => sanitizeText(val));

/**
 * Validates spice level input
 */
export const spiceLevelSchema = z
  .string()
  .max(50)
  .transform((val) => sanitizeText(val))
  .refine(
    (val) => {
      const validLevels = ["none", "mild", "medium", "hot", "extra hot", ""];
      return validLevels.includes(val.toLowerCase()) || /^[0-5]$/.test(val);
    },
    {
      message:
        "Spice level must be: none, mild, medium, hot, extra hot, or a number 0-5",
    },
  )
  .optional();
