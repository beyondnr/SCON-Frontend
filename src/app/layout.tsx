import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/providers/query-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { GA4Provider } from "@/components/analytics/ga4-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SCON PoC",
  description: "직원 근무표 & 급여 관리 SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          inter.variable
        )}
      >
        <ErrorBoundary>
          <QueryProvider>
            <GA4Provider>
              {children}
            </GA4Provider>
            <Toaster />
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
