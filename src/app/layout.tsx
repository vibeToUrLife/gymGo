import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { LocaleProvider } from "@/lib/i18n";
import { ExercisesProvider } from "@/lib/data";
import { PlanProvider } from "@/lib/plan";
import { SiteHeader } from "@/components/site-header";
import { FooterNote } from "@/components/footer-note";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "gymGo — Plan your training, see every move",
  description:
    "Browse exercises with animated how-to previews and build your personal training plan.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} font-sans`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <LocaleProvider>
            <ExercisesProvider>
              <PlanProvider>
                <SiteHeader />
                <main className="min-h-[calc(100vh-8rem)]">{children}</main>
                <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
                  <FooterNote />
                </footer>
              </PlanProvider>
            </ExercisesProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
