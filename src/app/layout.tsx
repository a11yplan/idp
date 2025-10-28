import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { ToasterWrapper } from "@/components/toaster-wrapper";
import { AutumnProvider } from "autumn-js/react";
import { OrganizationProvider } from "@/contexts/organization-context";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Better Auth + Next.js",
  description: "Authentication system with Better Auth and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const betterAuthUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000';

  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AutumnProvider betterAuthUrl={betterAuthUrl}>
            <AuthProvider>
              <OrganizationProvider>
                <Navbar />
                <Breadcrumb />
                <main>{children}</main>
                <ToasterWrapper />
              </OrganizationProvider>
            </AuthProvider>
          </AutumnProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
