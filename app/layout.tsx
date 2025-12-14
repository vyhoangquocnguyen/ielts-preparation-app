import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedOut, SignIn } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/themeProvider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IELTS Preparation App - Master your IELTS Exam",
  description: "AI-powered IELTS preparation platform for Listening, Reading, Writing, and Speaking modules",
  keywords: ["IELTS", "exam preparation", "English test", "study app"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <ClerkProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </ClerkProvider>
        </body>
      </html>
    </>
  );
}
