"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { authClient } from '../lib/auth-client'
import { useOrganization } from "./organization-context"

interface Team {
  id: string
  name: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

interface TeamContextType {
  activeTeam: Team | null
  teams: Team[]
  setActiveTeam: (team: Team | null) => Promise<void>
  isLoading: boolean
  refreshTeams: () => Promise<void>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

const ACTIVE_TEAM_KEY = "activeTeamId"

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { activeOrganization } = useOrganization()
  const [teams, setTeams] = useState<Team[]>([])
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshTeams = async () => {
    if (!activeOrganization?.id) {
      setTeams([])
      setActiveTeamState(null)
      setIsLoading(false)
      return
    }

    try {
      const result = await authClient.organization.listTeams({
        query: {
          organizationId: activeOrganization.id,
        },
      })

      if (result.data) {
        const teamsList = (result.data as any[]).map((t: any) => ({
          id: t.id,
          name: t.name,
          organizationId: t.organizationId,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }))
        setTeams(teamsList)

        // Get active team from localStorage
        const savedActiveTeamId = localStorage.getItem(ACTIVE_TEAM_KEY)

        if (savedActiveTeamId) {
          const savedTeam = teamsList.find((t) => t.id === savedActiveTeamId)
          if (savedTeam) {
            setActiveTeamState(savedTeam)
            // Sync with server session
            await authClient.organization.setActiveTeam({ teamId: savedTeam.id })
            return
          }
        }

        // Default to first team if available
        if (teamsList.length > 0) {
          const firstTeam = teamsList[0]
          setActiveTeamState(firstTeam)
          localStorage.setItem(ACTIVE_TEAM_KEY, firstTeam.id)
          // Sync with server session
          await authClient.organization.setActiveTeam({ teamId: firstTeam.id })
        } else {
          setActiveTeamState(null)
          localStorage.removeItem(ACTIVE_TEAM_KEY)
          // Unset active team in session
          await authClient.organization.setActiveTeam({ teamId: null })
        }
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshTeams()
  }, [activeOrganization?.id])

  const setActiveTeam = async (t: Team | null) => {
    setActiveTeamState(t)
    if (t) {
      localStorage.setItem(ACTIVE_TEAM_KEY, t.id)
      // Sync with server session
      try {
        await authClient.organization.setActiveTeam({ teamId: t.id })
      } catch (error) {
        console.error("Failed to set active team in session:", error)
      }
    } else {
      localStorage.removeItem(ACTIVE_TEAM_KEY)
      // Unset active team in session
      try {
        await authClient.organization.setActiveTeam({ teamId: null })
      } catch (error) {
        console.error("Failed to unset active team in session:", error)
      }
    }
  }

  return (
    <TeamContext.Provider
      value={{
        activeTeam,
        teams,
        setActiveTeam,
        isLoading,
        refreshTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}

// Hook to get active team ID for filtering and other integrations
export function useActiveTeamId(): string | null {
  const { activeTeam } = useTeam()
  return activeTeam?.id || null
}
