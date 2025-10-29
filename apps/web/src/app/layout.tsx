import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';
import "./globals.css";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { ToasterWrapper } from "@/components/toaster-wrapper";
import { AutumnProvider } from "autumn-js/react";
import { OrganizationProvider } from "@/contexts/organization-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { config } from "@/lib/config";

// Dynamically import Navbar to ensure it only renders on client-side
// This prevents React hooks errors during server-side rendering
const Navbar = dynamic(() => import("@/components/navigation/navbar").then(mod => ({ default: mod.Navbar })), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: config.appName,
  description: config.appDescription,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const betterAuthUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000';

  // Get locale from next-intl middleware
  const locale = await getLocale();

  // Get messages for the locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href={config.appFavicon} />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AutumnProvider betterAuthUrl={betterAuthUrl}>
              <OrganizationProvider>
                <Navbar />
                <Breadcrumb />
                <main>{children}</main>
                <ToasterWrapper />
              </OrganizationProvider>
            </AutumnProvider>
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
