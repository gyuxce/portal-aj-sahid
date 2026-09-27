"use client";

import Link from "next/link";
import { Megaphone } from "lucide-react";

export type TickerAnnouncement = {
  id: string;
  title: string;
  body: string;
};

// Kecepatan disesuaikan ke total panjang teks — biar teks pendek nggak
// ngebut dan teks panjang nggak keburu-buru merayap.
const PIXELS_PER_SECOND = 40;
const MIN_DURATION_S = 12;
const SEPARATOR = "     •     ";

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

/** Strip notifikasi berjalan buat pengumuman — berhenti kalau di-hover/focus
 * (screen reader/pointer) supaya tetap bisa dibaca, dan diam total kalau
 * sistem pengguna minta reduced motion. Satu link besar ke /dashboard/
 * announcements, bukan per-item, karena tujuannya cuma kasih notif sekilas. */
export function AnnouncementTicker({
  announcements,
}: {
  announcements: TickerAnnouncement[];
}) {
  if (announcements.length === 0) {
    return null;
  }

  const items = announcements.map((a) => {
    const body = cleanText(a.body);
    return body ? `${cleanText(a.title)} — ${body}` : cleanText(a.title);
  });
  // Separator ditaruh di ujung juga (bukan cuma di antara item), jadi pas
  // teksnya diulang buat looping, jaraknya tetap konsisten — nggak keliatan
  // seperti dua salinan yang nempel tanpa jeda.
  const loopText = items.join(SEPARATOR) + SEPARATOR;
  const duration = Math.max(
    MIN_DURATION_S,
    Math.round((loopText.length * 9) / PIXELS_PER_SECOND),
  );

  return (
    <Link
      href="/dashboard/announcements"
      className="group flex items-center gap-2.5 overflow-hidden rounded-full border bg-card px-3.5 py-2 text-sm shadow-sm transition-colors hover:bg-muted/40"
      aria-label={`Pengumuman terbaru: ${items.join(". ")}. Buka semua pengumuman.`}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Megaphone className="size-3.5" strokeWidth={2} />
      </span>
      <span
        className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        aria-hidden="true"
      >
        <span
          className="animate-marquee flex w-max whitespace-nowrap group-hover:[animation-play-state:paused] group-focus-visible:[animation-play-state:paused]"
          style={{ animationDuration: `${duration}s` }}
        >
          <span className="text-foreground/80">{loopText}</span>
          <span className="text-foreground/80">{loopText}</span>
        </span>
      </span>
    </Link>
  );
}
