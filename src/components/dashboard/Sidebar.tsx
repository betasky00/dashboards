"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  Users,
  BarChart2,
  Sparkles,
  Newspaper,
  LayoutTemplate,
  Film,
  Palette,
  Library,
  AtSign,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
  username?: string;
  name?: string;
}

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/studio", label: "News Studio", icon: Newspaper },
  { href: "/reels", label: "Reel Remix", icon: Film },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/library", label: "Library", icon: Library },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/brand", label: "Brand Kit", icon: Palette, admin: true },
  { href: "/accounts", label: "Accounts", icon: AtSign, admin: true },
  { href: "/team", label: "Team", icon: Users, admin: true },
  { href: "/settings", label: "Settings", icon: Settings, admin: true },
];

export function Sidebar({ role, username, name }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "admin";
  const nav = NAV.filter((n) => !n.admin || isAdmin);

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen bg-[#efeae1] border-r border-[#dbd4c7] sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#dbd4c7]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#1c1a17] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#f7f3ec]" />
          </div>
          <span className="font-semibold text-[#1c1a17] text-[15px] tracking-tight">Orbit</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-[#1c1a17]/10 text-[#1c1a17] font-medium"
                : "text-[#6b655b] hover:text-[#1c1a17] hover:bg-[#e3ddd0]"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[#dbd4c7]">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#e3ddd0] cursor-pointer transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-[#1c1a17] flex items-center justify-center text-xs text-[#f7f3ec] font-medium uppercase">
            {(name || username || "U").charAt(0)}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs text-[#1c1a17] truncate">{name || username || "Account"}</p>
            <p className="text-[10px] text-[#857f74] capitalize">{isAdmin ? "Admin" : "Member"}</p>
          </div>
          <LogOut className="w-3.5 h-3.5 text-[#857f74]" />
        </button>
      </div>
    </aside>
  );
}
