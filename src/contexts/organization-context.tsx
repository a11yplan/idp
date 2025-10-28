"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { organization } from "@/lib/auth-client"

interface Organization {
  id: string
  name: string
  slug: string
  role: string
}

interface OrganizationContextType {
  activeOrganization: Organization | null
  organizations: Organization[]
  setActiveOrganization: (org: Organization | null) => Promise<void>
  isLoading: boolean
  refreshOrganizations: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

const ACTIVE_ORG_KEY = "activeOrganizationId"

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [activeOrganization, setActiveOrganizationState] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshOrganizations = async () => {
    try {
      const result = await organization.list()
      if (result.data) {
        const orgs = (result.data as any[]).map((org: any) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          role: org.role,
        }))
        setOrganizations(orgs)

        // Get active organization from localStorage
        const savedActiveOrgId = localStorage.getItem(ACTIVE_ORG_KEY)

        if (savedActiveOrgId) {
          const savedOrg = orgs.find((org) => org.id === savedActiveOrgId)
          if (savedOrg) {
            setActiveOrganizationState(savedOrg)
            // Sync with server session
            await organization.setActive({ organizationId: savedOrg.id })
            return
          }
        }

        // Default to first organization if available
        if (orgs.length > 0) {
          const firstOrg = orgs[0]
          setActiveOrganizationState(firstOrg)
          localStorage.setItem(ACTIVE_ORG_KEY, firstOrg.id)
          // Sync with server session
          await organization.setActive({ organizationId: firstOrg.id })
        } else {
          setActiveOrganizationState(null)
          localStorage.removeItem(ACTIVE_ORG_KEY)
          // Unset active organization in session
          await organization.setActive({ organizationId: null })
        }
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshOrganizations()
  }, [])

  const setActiveOrganization = async (org: Organization | null) => {
    setActiveOrganizationState(org)
    if (org) {
      localStorage.setItem(ACTIVE_ORG_KEY, org.id)
      // Sync with server session
      try {
        await organization.setActive({ organizationId: org.id })
      } catch (error) {
        console.error("Failed to set active organization in session:", error)
      }
    } else {
      localStorage.removeItem(ACTIVE_ORG_KEY)
      // Unset active organization in session
      try {
        await organization.setActive({ organizationId: null })
      } catch (error) {
        console.error("Failed to unset active organization in session:", error)
      }
    }
  }

  return (
    <OrganizationContext.Provider
      value={{
        activeOrganization,
        organizations,
        setActiveOrganization,
        isLoading,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider")
  }
  return context
}

// Hook to get active organization ID for billing and other integrations
export function useActiveOrganizationId(): string | null {
  const { activeOrganization } = useOrganization()
  return activeOrganization?.id || null
}
