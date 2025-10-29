import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getMessages, getLocale } from 'next-intl/server';
import "./globals.css";
import { ClientLayout } from "@/components/layout/client-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { IntlErrorHandlerProvider } from "@/components/providers/intl-error-handler-provider";
import { config } from "@/lib/config";

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
          <IntlErrorHandlerProvider locale={locale} messages={messages}>
            <ClientLayout betterAuthUrl={betterAuthUrl}>
              {children}
            </ClientLayout>
          </IntlErrorHandlerProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
