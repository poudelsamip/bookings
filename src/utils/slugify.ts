export function slugify(input: string, maxLength = 80): string {
    return input
        .normalize("NFKD") // split accents from letters (é → e + ´)
        .replace(/[\u0300-\u036f]/g, "") // strip the accent marks
        .toLowerCase()
        .replace(/&/g, " and ") // "a & b" → "a and b"
        .replace(/['’]/g, "") // "don't" → "dont"
        .replace(/[^a-z0-9]+/g, "-") // anything else → hyphen
        .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
        .slice(0, maxLength)
        .replace(/-+$/g, ""); // re-trim in case the cut landed on a hyphen
}
