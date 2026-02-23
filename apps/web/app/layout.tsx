import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "API-CIWEI | API Code Scanner",
    template: "%s | API-CIWEI",
  },
  description:
    "Scan your API code for security vulnerabilities, design issues, and best practice violations. Free, open-source API code quality tool.",
  keywords: [
    "API scanner",
    "code quality",
    "security",
    "REST API",
    "linter",
    "static analysis",
  ],
  authors: [{ name: "API-CIWEI" }],
  openGraph: {
    title: "API-CIWEI | API Code Scanner",
    description: "Scan your API code for errors, security issues, and best practice violations.",
    type: "website",
  },
  icons: {
    icon: "/icons/CIWEI.svg",
    shortcut: "/icons/CIWEI.svg",
    apple: "/icons/CIWEI.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
