"use client"

import { AutumnProvider } from "autumn-js/react"
import { OrganizationProvider } from '../../contexts/organization-context'
import { Navbar } from '../navigation/navbar'
import { Breadcrumb } from '../navigation/breadcrumb'
import { ToasterWrapper } from '../toaster-wrapper'

interface ClientLayoutProps {
  children: React.ReactNode
  betterAuthUrl: string
}

export function ClientLayout({ children, betterAuthUrl }: ClientLayoutProps) {
  return (
    <AutumnProvider betterAuthUrl={betterAuthUrl}>
      <OrganizationProvider>
        <Navbar />
        <Breadcrumb />
        <main>{children}</main>
        <ToasterWrapper />
      </OrganizationProvider>
    </AutumnProvider>
  )
}
