import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar";
import { WatchlistProvider } from "@/components/WatchlistProvider";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { ScrollProgress } from "@/components/ScrollProgress";
import { FabMenu } from "@/components/FabMenu";
import { AIPanel } from "@/components/AIPanel";
import { CommandPalette } from "@/components/CommandPalette";
import { SakuraCanvas } from "@/components/SakuraCanvas";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";
import "./card-link.css";
import "./nav-polish.css";
import "./sprint-a.css";
import "./ai-panel.css";
import "./cmdk.css";
import "./ancestry.css";

export const metadata: Metadata = {
  title: "AnimeNexus — Lantern",
  description:
    "Mood-based anime recommendations, a deep taste profile, and AI-powered tools — late-night broadcast console.",
  applicationName: "AnimeNexus",
  manifest: "/manifest.webmanifest",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('anime_nexus_theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');var v=localStorage.getItem('anime_nexus_view_mode');if(v)document.documentElement.dataset.viewMode=v;}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <WatchlistProvider>
              <SessionProvider>
                <ScrollProgress />
                <SakuraCanvas />
                <PwaRegister />
                <Navbar />
                {children}
                <FabMenu />
                <AIPanel />
                <CommandPalette />
                <footer className="site-footer">
                  <div className="container">
                    AnimeNexus · Lantern · Data via{" "}
                    <a
                      href="https://anilist.co"
                      target="_blank"
                      rel="noreferrer"
                    >
                      AniList
                    </a>
                  </div>
                </footer>
              </SessionProvider>
            </WatchlistProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
