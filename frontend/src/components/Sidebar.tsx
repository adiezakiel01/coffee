"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/brews", label: "Brews", icon: "🫗" },
  { href: "/beans", label: "Beans", icon: "☕" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
  { href: "/assistant", label: "Assistant", icon: "💬" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="w-52 flex-shrink-0 flex flex-col py-6"
      style={{
        background: "linear-gradient(180deg, #382e27 0%, #6b4530 100%)",
      }}
    >
      <div className="px-5 pb-4 mb-2 border-b border-accent/15">
        <p className="text-base font-medium text-ink">Brew Tracker</p>
        <p className="text-xs text-accent mt-1">pour-over journal</p>
      </div>

      <div className="flex flex-col py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-2.5 px-5 py-2 hover:bg-accent/5 transition-colors"
            >
              <span
                className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent-strong transition-opacity"
                style={{ opacity: isActive ? 1 : 0 }}
              />
              <span className="text-base" aria-hidden="true">
                {item.icon}
              </span>
              <span
                className={`text-sm ${
                  isActive ? "text-ink font-medium" : "text-ink/55"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
