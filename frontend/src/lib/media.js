/**
 * Resolve a media URL or fallback through to absolute URL.
 * - Relative URLs starting with /api/media/ get prefixed with REACT_APP_BACKEND_URL.
 * - Any other absolute URL (https://…) is returned as-is.
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

export function resolveMediaUrl(url) {
    if (!url) return "";
    if (typeof url !== "string") return "";
    if (url.startsWith("/api/")) return `${BACKEND_URL}${url}`;
    return url;
}
