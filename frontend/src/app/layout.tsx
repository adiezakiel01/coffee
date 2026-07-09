import type { Metadata } from "next";
import { Sora, Fraunces } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ErrorBoundary from "@/components/ErrorBoundary";
import WakingScreen from "@/components/WakingScreen";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Brew Tracker",
  description: "Pour-over coffee logging and analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${sora.className} ${fraunces.variable} bg-base text-ink`}
      >
        <WakingScreen>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
        </WakingScreen>
      </body>
    </html>
  );
}
