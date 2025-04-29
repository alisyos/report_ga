import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Google Analytics & Ads Report",
  description: "Google Analytics 및 Google Ads 데이터 리포트",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <header className="border-b">
          <div className="container mx-auto flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">GA & Ads Report</h1>
            </div>
            <nav>
              <ul className="flex gap-6">
                <li>
                  <Link
                    href="/"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    홈
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    애널리틱스
                  </Link>
                </li>
                <li>
                  <Link
                    href="/conversion-card"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    전환카드
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
