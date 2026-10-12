"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/browse", "Browse"],
  ["/submit", "Submit"],
  ["/curator", "Curator"],
  ["/theory", "Theory"],
] as const;

export default function SiteNav() {
  const path = usePathname();
  return (
    <nav className="sticky top-0 z-20 bg-blue-950 text-white shadow" aria-label="Main">
      <div className="mx-auto flex h-[52px] max-w-[1300px] items-center gap-1 overflow-x-auto px-4">
        <Link href="/" className="mr-4 flex items-center gap-2 whitespace-nowrap text-lg font-bold">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" fill="#F5B301" />
          </svg>
          Septa<span className="text-amber-400">Typer</span>
        </Link>
        {LINKS.map(([href, label]) => {
          const active = path === href || path.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm ${active ? "bg-white/15 font-semibold" : "text-blue-200 hover:bg-white/10 hover:text-white"}`}>
              {label}
            </Link>
          );
        })}
        <Link href="/submit" className="ml-auto whitespace-nowrap rounded-md bg-amber-400 px-3 py-1.5 text-sm font-bold text-blue-950 hover:brightness-105">
          Upload genome for septatyping
        </Link>
      </div>
    </nav>
  );
}
