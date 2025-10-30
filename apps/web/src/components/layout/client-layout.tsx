"use client"

import { AutumnProvider } from "autumn-js/react"
import { OrganizationProvider } from "@/contexts/organization-context"
import { TeamProvider } from "@/contexts/team-context"
import { Navbar } from "@/components/navigation/navbar"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import { ImpersonationBanner } from "@/components/admin/impersonation-banner"
import { ToasterWrapper } from "@/components/toaster-wrapper"
import { config } from "@/lib/config"

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
