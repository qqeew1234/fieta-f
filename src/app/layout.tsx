import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/src/components/theme-provider';
import SidebarServer from '@/src/components/sidebar-server';
import FloatingChatbot from '@/src/components/aichatbot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "FIETA - AI ETF 추천 서비스",
  description: "수익률 높은 ETF 추천 서비스",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            <SidebarServer />
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
        <FloatingChatbot />
      </body>
    </html>
  );
}
