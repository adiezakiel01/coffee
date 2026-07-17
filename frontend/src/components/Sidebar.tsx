"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import {
  Coffee,
  BarChart2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Icon,
} from "lucide-react";
import { coffeeBean } from "@lucide/lab";

const ICON_SIZE = 17;
const MOBILE_BREAKPOINT = 768;

const navItems = [
  {
    href: "/brews",
    label: "Brews",
    renderIcon: (className: string) => (
      <Coffee size={ICON_SIZE} className={className} />
    ),
  },
  {
    href: "/beans",
    label: "Beans",
    renderIcon: (className: string) => (
      <Icon iconNode={coffeeBean} size={ICON_SIZE} className={className} />
    ),
  },
  {
    href: "/analytics",
    label: "Analytics",
    renderIcon: (className: string) => (
      <BarChart2 size={ICON_SIZE} className={className} />
    ),
  },
  {
    href: "/assistant",
    label: "Assistant",
    renderIcon: (className: string) => (
      <MessageCircle size={ICON_SIZE} className={className} />
    ),
  },
];

const STORAGE_KEY = "sidebar-collapsed";

export default function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      if (mobile) {
        setCollapsed(true);
        return;
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setCollapsed(stored === "true");
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [pathname]);

  function toggleCollapsed() {
    if (isMobile) {
      setCollapsed((prev) => !prev);
      return;
    }
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  const navContent = (
    <>
      <div
        className={`flex items-center border-b border-accent/15 mb-2 pb-5 ${
          collapsed ? "justify-center px-0" : "justify-between px-5"
        }`}
      >
        {!collapsed && (
          <div>
            <p className="text-base font-display font-medium text-ink">
              Brew tracker
            </p>
            <p className="text-xs text-accent font-sans mt-1">
              pour-over journal
            </p>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className="bg-accent/10 hover:bg-accent/20 rounded-md w-[26px] h-[26px] flex items-center justify-center text-accent transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
      <div className="flex flex-col py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const iconClass = isActive ? "text-ink" : "text-ink/55";
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`relative flex items-center hover:bg-accent/5 transition-colors ${
                collapsed ? "justify-center py-2.5 px-0" : "gap-2.5 px-5 py-2.5"
              }`}
            >
              <span
                className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent-crema transition-opacity"
                style={{ opacity: isActive ? 1 : 0 }}
              />
              {item.renderIcon(iconClass)}
              {!collapsed && (
                <span
                  className={`text-sm ${isActive ? "text-ink font-medium" : "text-ink/55"}`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <nav
          className="flex-shrink-0 flex flex-col py-6 transition-all duration-200"
          style={{
            width: 56,
            background: "linear-gradient(180deg, #382e27 0%, #6b4530 100%)",
          }}
        >
          {collapsed && navContent}
        </nav>

        {!collapsed && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setCollapsed(true)}
            />
            <nav
              className="fixed left-0 top-0 bottom-0 flex flex-col py-6 z-50 transition-all duration-200"
              style={{
                width: 208,
                background: "linear-gradient(180deg, #382e27 0%, #6b4530 100%)",
              }}
            >
              {navContent}
            </nav>
          </>
        )}
      </>
    );
  }

  return (
    <nav
      className="flex-shrink-0 flex flex-col py-6 transition-all duration-200"
      style={{
        width: collapsed ? 56 : 208,
        background: "linear-gradient(180deg, #382e27 0%, #6b4530 100%)",
      }}
    >
      {navContent}
    </nav>
  );
}
