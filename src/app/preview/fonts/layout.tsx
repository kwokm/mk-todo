import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  DM_Sans,
  JetBrains_Mono,
  Lora,
  Plus_Jakarta_Sans,
  Space_Grotesk,
  Nunito,
} from "next/font/google";
import { FontNavLink } from "@/components/preview/FontNavLink";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fontStyles = [
  { href: "/preview/fonts/warm-humanist", label: "Warm Humanist" },
  { href: "/preview/fonts/editorial-mono", label: "Editorial Mono" },
  { href: "/preview/fonts/classic-serif", label: "Classic Serif" },
  { href: "/preview/fonts/geometric-clean", label: "Geometric Clean" },
  { href: "/preview/fonts/brutalist-tight", label: "Brutalist Tight" },
  { href: "/preview/fonts/soft-rounded", label: "Soft Rounded" },
] as const;

export default function FontPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = [
    dmSans.variable,
    jetbrainsMono.variable,
    lora.variable,
    jakartaSans.variable,
    spaceGrotesk.variable,
    nunito.variable,
  ].join(" ");

  return (
    <div className={fontVars}>
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/90 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-6 py-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <h1 className="text-sm font-medium text-white">Font Preview</h1>
        </div>

        {/* Style nav */}
        <nav className="scrollbar-none flex gap-1 overflow-x-auto border-t border-white/5 px-4 py-1">
          {fontStyles.map(({ href, label }) => (
            <FontNavLink key={href} href={href}>
              {label}
            </FontNavLink>
          ))}
        </nav>
      </header>

      {/* Page content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
