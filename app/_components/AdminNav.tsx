"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavLinks = [
  { href: "/admin/analytics", label: "📊 Analytics" },
  { href: "/admin/config", label: "⚙️ Config", disabled: true },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center gap-1 border-b border-gray-200 bg-white px-6"
      aria-label="Admin navigation"
    >
      {adminNavLinks.map((link) =>
        link.disabled ? (
          <span
            key={link.href}
            className="px-4 py-3 text-sm font-medium text-gray-400 cursor-not-allowed border-b-2 border-transparent"
            title="Coming in Phase 5.4"
          >
            {link.label}
          </span>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              pathname.startsWith(link.href)
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            {link.label}
          </Link>
        ),
      )}
    </nav>
  );
}
