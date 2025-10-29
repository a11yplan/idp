# Team Feature Quick Start Guide

## Overview
The team feature is now fully enabled and ready to use! This guide shows you how to use the new team management capabilities.

## Accessing Team Features

### For Users

#### 1. Navigate to Your Organization
- Go to **Organizations** from the main menu
- Click on your organization

#### 2. Access Teams
- Click the **Teams** card on the organization dashboard
- Or navigate to `/organizations/{orgId}/teams`

#### 3. Create a Team (Owners/Admins only)
- Click **Create Team** button
- Enter team name (e.g., "Engineering", "Sales", "Marketing")
- Click **Create Team**

#### 4. Manage Team Members
- Click on any team to view details
- Click **Add Member** to add organization members to the team
- Click **Remove** next to any member to remove them from the team

#### 5. Team Settings (Owners/Admins only)
- Click **Settings** button on team detail page
- Update team name
- Delete team (with confirmation)

#### 6. Invite Members to Teams
- Go to organization **Members** page
- Click **Invite Member**
- Fill in email and role
- **Optionally select a team** to auto-assign the member when they accept

## For Developers

### Using Team API Methods

```typescript
import { team } from "@/lib/auth-client"

// Create a team
const { data, error } = await team.create({
  name: "Engineering",
  organizationId: "org-id", // optional - defaults to active org
})

// List all teams in organization
const { data: teams } = await team.list({
  query: {
    organizationId: "org-id",
  },
})

// List teams user belongs to
const { data: userTeams } = await team.listUserTeams()

// Update team
await team.update({
  teamId: "team-id",
  data: {
    name: "New Team Name",
  },
})

// Delete team
await team.remove({
  teamId: "team-id",
  organizationId: "org-id", // optional
})

// Set active team
await team.setActive({
  teamId: "team-id", // or null to unset
})

// List team members
const { data: members } = await team.listMembers({
  teamId: "team-id", // optional - defaults to active team
})

// Add member to team
await team.addMember({
  teamId: "team-id",
  userId: "user-id",
})

// Remove member from team
await team.removeMember({
  teamId: "team-id",
  userId: "user-id",
})
```

### Using Team Context

```typescript
import { useTeam } from "@/contexts/team-context"

function MyComponent() {
  const { activeTeam, teams, setActiveTeam, refreshTeams } = useTeam()

  return (
    <div>
      <h2>Active Team: {activeTeam?.name || "None"}</h2>

      <select
        value={activeTeam?.id || ""}
        onChange={(e) => {
          const team = teams.find(t => t.id === e.target.value)
          setActiveTeam(team || null)
        }}
      >
        <option value="">No Team</option>
        {teams.map(team => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      <button onClick={refreshTeams}>Refresh Teams</button>
    </div>
  )
}
```

### Using Team Switcher Component

```typescript
import { TeamSwitcher } from "@/components/team/team-switcher"

function Layout() {
  return (
    <div>
      <TeamSwitcher />
      {/* Your content */}
    </div>
  )
}
```

## Routes

### Public Team Routes
- `/organizations/{orgId}/teams` - List all teams
- `/organizations/{orgId}/teams/{teamId}` - Team detail page
- `/organizations/{orgId}/teams/{teamId}/settings` - Team settings (owners/admins only)

## Permissions

### Owner
- ✅ Create teams
- ✅ Update any team
- ✅ Delete any team
- ✅ Add/remove members
- ✅ View all teams

### Admin
- ✅ Create teams
- ✅ Update teams
- ✅ Delete teams
- ✅ Add/remove members
- ✅ View all teams

### Member
- ✅ View teams they belong to
- ❌ Create teams
- ❌ Update teams
- ❌ Delete teams
- ❌ Add/remove members

## Configuration

The team feature is configured in `apps/web/src/lib/auth.ts`:

```typescript
teamConfiguration: {
  enabled: true,
  maximumTeams: 20, // Max teams per organization
  maximumMembersPerTeam: 50, // Max members per team
  allowRemovingAllTeams: false, // Prevent removing the last team
}
```

## Troubleshooting

### Teams not showing up?
1. Make sure you're logged in and part of an organization
2. Check that teams are enabled in `auth.ts`
3. Verify database migration ran successfully: `npx @better-auth/cli migrate`

### Can't create teams?
1. Check your user role (must be Owner or Admin)
2. Verify you haven't reached the maximum team limit (20 per organization)
3. Check browser console for any errors

### API returns 404?
1. Ensure Better Auth server is running
2. Check that organization plugin is enabled with teams
3. Verify you're using the correct API endpoint format

## Next Steps

### Integration Ideas
1. **Add TeamProvider to root layout** - Make team context available app-wide
2. **Add TeamSwitcher to navbar** - Quick team switching from anywhere
3. **Filter resources by team** - Show only team-specific data
4. **Team-based permissions** - Implement granular access control
5. **Team analytics** - Track team performance and activity

### Advanced Features
- Team-specific roles and permissions
- Team activity logs
- Team resource allocation
- Team notifications
- Team templates

## Support

For issues or questions:
1. Check the main documentation: `TEAM_FEATURE_IMPLEMENTATION.md`
2. Review Better Auth docs: https://www.better-auth.com/docs/plugins/organization
3. Check the Better Auth GitHub: https://github.com/better-auth/better-auth

Happy team building! 🎉
