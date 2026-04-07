/**
 * Routing Node
 *
 * Функции для routing и team assignment
 */

import { getDataSource } from "@/lib/database/connection";
import { Category } from "@/lib/database/entities/Category";
import { Team } from "@/lib/database/entities/Team";
import { WorkflowStep } from "@/lib/types/common";

import { WorkflowState } from "../state/WorkflowState";

// ===========================
// TYPES
// ===========================

export interface TeamAssignment {
  team: string;
  member: string;
  sla_hours: number;
  priority_boost: number;
}

// ===========================
// TEAM SELECTION
// ===========================

/**
 * Auto-select support team based on ticket category
 * Used when Manager approves a ticket and assigns it to a team
 * Queries Category table to get assigned_team, then queries Team for member selection
 *
 * @param category - Ticket category (e.g., "Payment Problems", "Shipping Delays")
 * @returns Team assignment data or null if not found
 */
export async function autoSelectTeam(
  category?: string,
): Promise<TeamAssignment | null> {
  try {
    if (!category) {
      return null;
    }

    const connection = await getDataSource();
    const categoryRepo = connection.getRepository(Category);
    const teamRepo = connection.getRepository(Team);

    // Query category from database to get assigned_team
    const categoryData = await categoryRepo.findOne({
      where: { name: category },
    });

    if (!categoryData) {
      return null;
    }

    // Query team from database
    const team = await teamRepo.findOne({
      where: { name: categoryData.assigned_team },
    });

    if (!team || team.members.length === 0) {
      return null;
    }

    // Randomly select a member (simple load balancing)
    const randomIndex = Math.floor(Math.random() * team.members.length);
    const selectedMember = team.members[randomIndex];

    return {
      team: team.name,
      member: selectedMember,
      sla_hours: categoryData.sla_hours,
      priority_boost: categoryData.priority_boost,
    };
  } catch (_error) {
    return null;
  }
}

// ===========================
// PRIORITY ROUTING
// ===========================

/**
 * Router function for human-in-the-loop
 * Determines next node based on priority score
 *
 * HIGH/CRITICAL priority → requires manager approval (workflow STOPS here)
 * LOW/MEDIUM priority → auto-process (continues to FINALIZE_TICKET)
 *
 * @param state - Current workflow state
 * @returns Next node name: WAIT_APPROVAL or FINALIZE_TICKET
 */
export function routePriority(state: typeof WorkflowState.State): string {
  const route = state.needs_approval
    ? WorkflowStep.WAIT_APPROVAL
    : WorkflowStep.FINALIZE_TICKET;

  return route;
}
