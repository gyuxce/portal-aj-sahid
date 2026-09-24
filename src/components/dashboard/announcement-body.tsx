import { ExternalLink } from "lucide-react";

import { URL_REGEX, extractFirstUrl } from "@/lib/text";

/** Renders announcement body text with any URL turned into a clickable
 * link, plus a tappable button for the first URL found — plain pasted
 * links otherwise render as static, non-clickable text. Optionally shows
 * the attached banner image above the text. */
export function AnnouncementBody({
  text,
  imageUrl,
}: {
  text: string;
  imageUrl?: string | null;
}) {
  const parts = text.split(URL_REGEX);
  const firstUrl = extractFirstUrl(text);

  return (
    <>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL, not a local asset next/image can optimize
        <img
          src={imageUrl}
          alt=""
          className="mb-3 max-h-64 w-full rounded-2xl object-cover"
        />
      ) : null}
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
        {parts.map((part, i) =>
          part.match(URL_REGEX) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {part}
            </a>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </p>
      {firstUrl ? (
        <a
          href={firstUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/30 transition-opacity hover:opacity-90"
        >
          Buka Link
          <ExternalLink className="size-3.5" strokeWidth={2} />
        </a>
      ) : null}
    </>
  );
}
