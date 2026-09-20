import {
  BookOpen,
  ClipboardList,
  FolderOpen,
  Home,
  IdCard,
  Megaphone,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

// icon is a pre-rendered element (not a component reference) because this
// array crosses the Server -> Client boundary (layout.tsx -> SectionNav),
// and only plain objects/React elements can be serialized across it —
// passing the raw forwardRef component object throws at runtime.
export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  available: boolean;
};

const iconClass = "size-3.5";

export const studentNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Beranda",
    icon: <Home className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/dashboard/courses",
    label: "Mata Kuliah",
    icon: <BookOpen className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/dashboard/tasks",
    label: "Tugas",
    icon: <ClipboardList className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/dashboard/groups",
    label: "Kelompok",
    icon: <Users className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/dashboard/materials",
    label: "Materi",
    icon: <FolderOpen className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/dashboard/announcements",
    label: "Pengumuman",
    icon: <Megaphone className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/dashboard/students",
    label: "Mahasiswa",
    icon: <IdCard className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
];

export const adminNavItems: NavItem[] = [
  {
    href: "/admin",
    label: "Ringkasan",
    icon: <Home className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/admin/courses",
    label: "Mata Kuliah",
    icon: <BookOpen className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/admin/students",
    label: "Mahasiswa",
    icon: <IdCard className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/admin/tasks",
    label: "Tugas",
    icon: <ClipboardList className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/admin/groups",
    label: "Kelompok",
    icon: <Users className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/admin/materials",
    label: "Materi",
    icon: <FolderOpen className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
  {
    href: "/admin/announcements",
    label: "Pengumuman",
    icon: <Megaphone className={iconClass} strokeWidth={2.25} />,
    available: true,
  },
];
