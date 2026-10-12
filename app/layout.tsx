import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "SeptaTyper | Ciprofloxacin resistance in Enterobacteriaceae",
  description:
    "A predictive database of ciprofloxacin resistance syntax in Enterobacteriaceae: browse isolates, septatype a genome, and explore the context-dependent grammar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <SiteNav />
        {children}
        <footer className="mt-10 border-t border-slate-200 px-4 py-5 text-center text-xs text-slate-500">
          SeptaTyper. Data are provided for research use.
        </footer>
      </body>
    </html>
  );
}
