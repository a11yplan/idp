import { useTeam } from '../../contexts/team-context'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Check, ChevronDown, Users } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { useOrganization } from '../../contexts/organization-context'

export function TeamSwitcher() {
  const navigate = useNavigate()
  const { activeOrganization } = useOrganization()
  const { activeTeam, teams, setActiveTeam, isLoading } = useTeam()

  if (!activeOrganization) {
    return null
  }

  const handleTeamSelect = async (team: any) => {
    await setActiveTeam(team)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="truncate">
              {isLoading ? "Loading..." : activeTeam?.name || "No Team"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>Teams</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {teams.length === 0 && !isLoading && (
          <DropdownMenuItem disabled>No teams yet</DropdownMenuItem>
        )}
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => handleTeamSelect(team)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{team.name}</span>
              {activeTeam?.id === team.id && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate({ to: `/organizations/${activeOrganization.id}/teams` })}
          className="cursor-pointer"
        >
          Manage Teams
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
