import type { Pool } from 'pg'

/**
 * Custom session population with intelligent defaults
 *
 * Automatically populates active organization and team based on the following logic:
 * 1. If team is set but not org → use team's organization
 * 2. If org is set but not team → use first team in that org (if user is a member)
 * 3. If neither is set → use first org and first team in that org (if user is a member)
 */
export async function populateCustomSession(
  user: any,
  session: any,
  pool: Pool
) {
  let activeOrganizationId = session.activeOrganizationId
  let activeTeamId = session.activeTeamId
  let activeOrganization = null
  let activeTeam = null

  // Case 1: Team is set but org is not → get org from team
  if (activeTeamId && !activeOrganizationId) {
    try {
      const teamResult = await pool.query(
        'SELECT "organizationId" FROM team WHERE id = $1',
        [activeTeamId]
      )
      if (teamResult.rows[0]) {
        activeOrganizationId = teamResult.rows[0].organizationId
      }
    } catch (error) {
      console.error('Failed to fetch organization from team:', error)
    }
  }

  // Case 2: Org is set but team is not → get first team in org where user is a member
  if (activeOrganizationId && !activeTeamId) {
    try {
      const teamResult = await pool.query(
        `SELECT t.id, t.name, t."organizationId"
         FROM team t
         INNER JOIN member m ON m."teamId" = t.id
         WHERE t."organizationId" = $1 AND m."userId" = $2
         LIMIT 1`,
        [activeOrganizationId, user.id]
      )
      if (teamResult.rows[0]) {
        activeTeamId = teamResult.rows[0].id
      }
    } catch (error) {
      console.error('Failed to fetch first team in organization:', error)
    }
  }

  // Case 3: Neither is set → get first org and first team for user
  if (!activeOrganizationId && !activeTeamId) {
    try {
      // Get user's first organization
      const orgResult = await pool.query(
        `SELECT m."organizationId"
         FROM member m
         WHERE m."userId" = $1 AND m."organizationId" IS NOT NULL
         LIMIT 1`,
        [user.id]
      )

      if (orgResult.rows[0]) {
        activeOrganizationId = orgResult.rows[0].organizationId

        // Try to get first team in that org where user is a member
        const teamResult = await pool.query(
          `SELECT t.id
           FROM team t
           INNER JOIN member m ON m."teamId" = t.id
           WHERE t."organizationId" = $1 AND m."userId" = $2
           LIMIT 1`,
          [activeOrganizationId, user.id]
        )

        if (teamResult.rows[0]) {
          activeTeamId = teamResult.rows[0].id
        }
      }
    } catch (error) {
      console.error('Failed to fetch default organization and team:', error)
    }
  }

  // Fetch full organization details if we have an ID
  if (activeOrganizationId) {
    try {
      const result = await pool.query(
        'SELECT id, name, slug, logo FROM organization WHERE id = $1',
        [activeOrganizationId]
      )

      if (result.rows[0]) {
        const org = result.rows[0]
        activeOrganization = {
          id: org.id,
          name: org.name,
          slug: org.slug,
          logo: org.logo,
        }
      }
    } catch (error) {
      console.error('Failed to fetch active organization:', error)
    }
  }

  // Fetch full team details if we have an ID
  if (activeTeamId) {
    try {
      const result = await pool.query(
        'SELECT id, name, "organizationId" FROM team WHERE id = $1',
        [activeTeamId]
      )

      if (result.rows[0]) {
        const team = result.rows[0]
        activeTeam = {
          id: team.id,
          name: team.name,
          organizationId: team.organizationId,
        }
      }
    } catch (error) {
      console.error('Failed to fetch active team:', error)
    }
  }

  return {
    user: user,
    session: {
      ...session,
      activeOrganization,
      activeTeam,
    }
  }
}
