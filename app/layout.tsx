import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar";
import { WatchlistProvider } from "@/components/WatchlistProvider";
import "./globals.css";
import "./card-link.css";

export const metadata: Metadata = {
  title: "AnimeNexus — Lantern",
  description:
    "Mood-based anime recommendations, a deep taste profile, and AI-powered tools — late-night broadcast console.",
  applicationName: "AnimeNexus",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#120e0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Outfit:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WatchlistProvider>
          <Navbar />
          {children}
          <footer className="site-footer">
            <div className="container">
              AnimeNexus · Lantern · Sprint 4 · watchlist · Data via{" "}
              <a href="https://anilist.co" target="_blank" rel="noreferrer">
                AniList
              </a>
            </div>
          </footer>
        </WatchlistProvider>
      </body>
    </html>
  );
}
