"use client"

import { useEffect, useState } from "react"
import { organization } from "@/lib/auth-client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Organization {
  id: string
  name: string
  slug: string
  role: string
}

const ACTIVE_ORG_KEY = "activeOrganizationId"

export function OrganizationSwitcher() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [activeOrgId, setActiveOrgId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const result = await organization.list()
      if (result.data) {
        const orgs = result.data as any[]
        setOrganizations(orgs)

        // Get active organization from localStorage (client-side storage)
        const savedActiveOrgId = localStorage.getItem(ACTIVE_ORG_KEY)

        if (savedActiveOrgId && orgs.some(org => org.id === savedActiveOrgId)) {
          setActiveOrgId(savedActiveOrgId)
        } else if (orgs.length > 0) {
          // Default to first organization if no saved active org
          const firstOrg = orgs[0]
          setActiveOrgId(firstOrg.id)
          localStorage.setItem(ACTIVE_ORG_KEY, firstOrg.id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitch = async (orgId: string) => {
    if (orgId === "create") {
      router.push("/organizations/create")
      return
    }

    try {
      // Save to localStorage (client-side for immediate UI update)
      localStorage.setItem(ACTIVE_ORG_KEY, orgId)
      setActiveOrgId(orgId)

      // Sync with server-side session
      await organization.setActive({ organizationId: orgId })

      // Refresh the page to update organization context
      router.refresh()
    } catch (error: any) {
      console.error("Failed to switch organization:", error)
    }
  }

  // Don't show if loading or no organizations
  if (loading) {
    return null
  }

  if (organizations.length === 0) {
    return (
      <Link href="/organizations/create">
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </Link>
    )
  }

  const activeOrg = organizations.find((org) => org.id === activeOrgId)

  return (
    <div className="flex items-center gap-2">
      <Select value={activeOrgId} onValueChange={handleSwitch}>
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <SelectValue>
              {activeOrg ? (
                <span className="truncate">{activeOrg.name}</span>
              ) : (
                "Select organization"
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{org.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {org.role}
                </span>
              </div>
            </SelectItem>
          ))}
          <div className="border-t mt-2 pt-2">
            <Link href="/organizations/create">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </Link>
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}
