"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Plus, Users, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useOrganization } from "@/contexts/organization-context"
import { useTeam } from "@/contexts/team-context"
import { cn } from "@/lib/utils"

export function OrganizationSwitcher() {
  const router = useRouter()
  const { activeOrganization, organizations, setActiveOrganization, isLoading } = useOrganization()
  const { teams, activeTeam, setActiveTeam, isLoading: teamsLoading } = useTeam()

  const handleSwitch = async (orgId: string) => {
    if (orgId === "create") {
      router.push("/organizations/create")
      return
    }

    const selectedOrg = organizations.find((org) => org.id === orgId)
    if (selectedOrg) {
      await setActiveOrganization(selectedOrg)
    }
  }

  const handleTeamSelect = async (team: any) => {
    try {
      await setActiveTeam(team)
    } catch (error) {
      console.error("Failed to switch team:", error)
    }
  }

  // Don't show if loading or no organizations
  if (isLoading) {
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

  return (
    <div className="flex items-center gap-2">
      <Select value={activeOrganization?.id || ""} onValueChange={handleSwitch}>
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <SelectValue>
              {activeOrganization ? (
                <div className="flex flex-col items-start">
                  <span className="truncate text-sm">{activeOrganization.name}</span>
                  {activeTeam && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {activeTeam.name}
                    </span>
                  )}
                </div>
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

          {/* Team Selection Section */}
          {activeOrganization && teams.length > 0 && (
            <div className="border-t mt-2 pt-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                <Users className="h-3 w-3" />
                Teams
              </div>
              <div className="space-y-1">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleTeamSelect(team)}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between",
                      activeTeam?.id === team.id && "bg-accent"
                    )}
                  >
                    <span className="truncate">{team.name}</span>
                    {activeTeam?.id === team.id && (
                      <Check className="h-4 w-4 ml-2" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <Link href={`/organizations/${activeOrganization.id}/teams`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Teams
                  </Button>
                </Link>
              </div>
            </div>
          )}

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
