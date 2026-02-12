"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface FontNavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function FontNavLink({ href, children }: FontNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "whitespace-nowrap px-3 py-1.5 text-sm transition-colors duration-150",
        isActive
          ? "text-white underline underline-offset-4 decoration-[#9333ea]"
          : "text-white/50 hover:text-white/80"
      )}
    >
      {children}
    </Link>
  );
}
