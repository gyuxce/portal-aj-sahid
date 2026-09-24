export const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function extractFirstUrl(text: string): string | null {
  return text.match(URL_REGEX)?.[0] ?? null;
}
