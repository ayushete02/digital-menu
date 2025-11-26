import slugify from "slugify";

export const makeSlug = (value: string) =>
  slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });
