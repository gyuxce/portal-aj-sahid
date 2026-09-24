"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { extractFirstUrl } from "@/lib/text";
import { cn } from "@/lib/utils";

export type BannerAnnouncement = {
  id: string;
  title: string;
  body: string;
  imageUrl: string;
};

const AUTO_ADVANCE_MS = 6000;

/** Auto-advancing image banner for announcements that have a picture
 * attached — each slide opens the link inside the announcement body (if
 * any), otherwise the full announcements page. */
export function AnnouncementCarousel({
  announcements,
}: {
  announcements: BannerAnnouncement[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % announcements.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (announcements.length === 0) {
    return null;
  }

  const current = announcements[index];
  const href = extractFirstUrl(current.body) ?? "/dashboard/announcements";

  function goTo(next: number) {
    setIndex((next + announcements.length) % announcements.length);
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl">
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
        className="block"
        aria-label={current.title}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL, not a local asset next/image can optimize */}
        <img
          src={current.imageUrl}
          alt={current.title}
          className="aspect-[16/7] w-full object-cover sm:aspect-[21/8]"
        />
      </a>

      {announcements.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Sebelumnya"
            onClick={() => goTo(index - 1)}
            className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="size-4.5" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            aria-label="Berikutnya"
            onClick={() => goTo(index + 1)}
            className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="size-4.5" strokeWidth={2.25} />
          </button>

          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
            {announcements.map((a, i) => (
              <button
                key={a.id}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
