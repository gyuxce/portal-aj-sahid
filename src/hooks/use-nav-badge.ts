"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_PREFIX = "nav-seen:";

function subscribe(callback: () => void) {
  // "storage" cuma nyala buat tab/window LAIN, bukan tab yang nulis — tapi
  // itu cukup buat sinkronisasi lintas-tab; dalam satu tab, badge tetap
  // ke-refresh sendiri tiap kali `isActive` berubah (lihat komentar di bawah).
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getServerSnapshot() {
  return null;
}

/** True kalau ada konten di section ini yang lebih baru dari terakhir kali
 * dibuka di perangkat ini (dibandingkan lewat localStorage, bukan lewat
 * server — nggak ada tabel "read state"). Begitu section-nya aktif (sedang
 * dibuka), langsung ditandai "sudah dilihat" sehingga titiknya hilang dan
 * nggak muncul lagi sampai ada konten baru berikutnya. */
export function useNavBadge(
  href: string,
  latestIso: string | null | undefined,
  isActive: boolean,
) {
  const storageKey = STORAGE_PREFIX + href;

  // useSyncExternalStore (bukan useState+effect) karena localStorage adalah
  // sistem eksternal yang cuma ada di client — snapshot-nya otomatis
  // dihitung ulang tiap render (termasuk pas `isActive` berubah dari true
  // ke false, persis momen yang perlu baca nilai yang baru saja ditulis).
  const seen = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(storageKey);
      } catch {
        return null;
      }
    },
    getServerSnapshot,
  );

  useEffect(() => {
    if (!isActive || !latestIso) return;
    try {
      localStorage.setItem(storageKey, latestIso);
    } catch {
      // Private mode/storage diblokir — dot bisa muncul lagi kunjungan
      // berikutnya, tapi bukan sesuatu yang perlu diributkan.
    }
  }, [storageKey, isActive, latestIso]);

  if (!latestIso || isActive) {
    return false;
  }

  return !seen || new Date(latestIso).getTime() > new Date(seen).getTime();
}
