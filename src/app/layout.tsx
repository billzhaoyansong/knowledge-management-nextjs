import type { Metadata } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/nav-bar";
import { ErrorBoundary } from "@/components/error";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bill Zhao Yansong's Knowledge Management Site",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${quicksand.className}`}>
      <body className="antialiased bg-gray-50">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="flex-shrink-0">
            <ErrorBoundary>
              <NavBar />
            </ErrorBoundary>
          </aside>

          {/* Main content area */}
          <main className="flex-1 overflow-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </body>
    </html>
  );
}
