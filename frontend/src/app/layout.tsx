import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ErrorBoundary from "@/components/ErrorBoundary";
import WakingScreen from "@/components/WakingScreen";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} bg-base text-ink`}>
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
