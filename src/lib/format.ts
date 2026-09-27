const DAY_LABEL: Record<string, string> = {
  friday: "Jumat",
  saturday: "Sabtu",
};

export function formatDayOfWeek(day: string) {
  return DAY_LABEL[day] ?? day;
}

export function formatTime(time: string) {
  return time.slice(0, 5);
}

export type DeadlineStatus = "overdue" | "today" | "soon" | "upcoming";

const DEADLINE_STATUS_LABEL: Record<DeadlineStatus, string> = {
  overdue: "Terlewat",
  today: "Hari ini",
  soon: "Segera",
  upcoming: "Akan datang",
};

// "Segera" = deadline within the next 3 days but not today. Not specified
// as an exact number in VIBE-CODING-SPEC.md rule 4, chosen as a reasonable
// default — adjust here if the real class cadence needs a different window.
const SOON_WINDOW_DAYS = 3;

export function getDeadlineStatus(deadline: string | Date): DeadlineStatus {
  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (deadlineDate.getTime() < now.getTime()) {
    return "overdue";
  }

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDeadlineDay = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate(),
  );
  const dayDiff = Math.round(
    (startOfDeadlineDay.getTime() - startOfToday.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (dayDiff === 0) {
    return "today";
  }
  if (dayDiff > 0 && dayDiff <= SOON_WINDOW_DAYS) {
    return "soon";
  }
  return "upcoming";
}

export function formatDeadlineStatusLabel(status: DeadlineStatus) {
  return DEADLINE_STATUS_LABEL[status];
}

export function formatDeadline(deadline: string | Date) {
  return new Date(deadline).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MATERIAL_TYPE_LABEL: Record<string, string> = {
  pdf: "PDF",
  ppt: "PPT",
  doc: "DOC",
  xls: "XLS",
  zip: "ZIP",
  photo: "Foto",
  link: "Link",
  other: "File",
};

export function formatMaterialType(type: string) {
  return MATERIAL_TYPE_LABEL[type] ?? type;
}

/** Sapaan yang berubah sesuai jam WIB (bukan jam server) — dipakai buat
 * salam pembuka Beranda biar kerasa "hidup", bukan teks statis. */
export function getGreeting(now: Date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hourCycle: "h23",
    }).format(now),
  );

  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 19) return "Selamat sore";
  return "Selamat malam";
}

/** Waktu relatif kasar ("X menit/jam/hari lalu") — buat label "diperbarui"
 * di Beranda. Jatuh balik ke tanggal biasa kalau sudah lebih dari seminggu
 * supaya nggak nampilin angka hari yang nggak informatif lagi. */
export function formatRelativeTime(value: string | Date) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;

  return formatDeadline(value);
}
