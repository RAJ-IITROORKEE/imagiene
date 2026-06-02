export function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function appendSlugSuffix(slug: string, suffix: string | number) {
  const cleanSlug = createSlug(slug);
  const cleanSuffix = createSlug(String(suffix));

  return [cleanSlug, cleanSuffix].filter(Boolean).join("-");
}
