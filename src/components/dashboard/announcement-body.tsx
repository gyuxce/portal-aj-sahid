import { ExternalLink } from "lucide-react";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/** Renders announcement body text with any URL turned into a clickable
 * link, plus a tappable button for the first URL found — plain pasted
 * links otherwise render as static, non-clickable text. */
export function AnnouncementBody({ text }: { text: string }) {
  const parts = text.split(URL_REGEX);
  const firstUrl = text.match(URL_REGEX)?.[0] ?? null;

  return (
    <>
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
