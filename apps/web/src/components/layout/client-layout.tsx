"use client"

import dynamic from "next/dynamic"
import { AutumnProvider } from "autumn-js/react"
import { OrganizationProvider } from "@/contexts/organization-context"
import { TeamProvider } from "@/contexts/team-context"
import { Navbar } from "@/components/navigation/navbar"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import { ToasterWrapper } from "@/components/toaster-wrapper"
import { config } from "@/lib/config"

// Dynamic import to prevent SSR issues with hooks
const ImpersonationBanner = dynamic(
  () => import("@/components/admin/impersonation-banner").then((mod) => ({ default: mod.ImpersonationBanner })),
  { ssr: false }
)

interface ClientLayoutProps {
  children: React.ReactNode
  betterAuthUrl: string
}

export function ClientLayout({ children, betterAuthUrl }: ClientLayoutProps) {
  const content = (
    <OrganizationProvider>
      <TeamProvider>
        <ImpersonationBanner />
        <Navbar />
        <Breadcrumb />
        <main>{children}</main>
        <ToasterWrapper />
      </TeamProvider>
    </OrganizationProvider>
  )

  // Only wrap with AutumnProvider if billing is enabled
  // if (config.features.billing) {
  //   return (
  //     <AutumnProvider betterAuthUrl={betterAuthUrl}>
  //       {content}
  //     </AutumnProvider>
  //   )
  // }

  return content
}
