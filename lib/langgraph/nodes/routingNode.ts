/**
 * Routing Node
 *
 * Функции для routing и team assignment
 */

import { getDataSource } from "@/lib/database/connection";
import { Team } from "@/lib/database/entities/Team";
import { Category } from "@/lib/database/entities/Category";
import type { WorkflowStateType } from "../state/WorkflowState";
import { WorkflowState } from "../state/WorkflowState";
import { WorkflowStep } from "@/lib/types/common";

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
      console.warn("⚠️  No category provided for team assignment");
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
      console.warn(`❌ Category "${category}" not found in database`);
      return null;
    }

    console.log(`📋 Category: ${categoryData.name}`);
    console.log(`   → Assigned Team: ${categoryData.assigned_team}`);
    console.log(`   → SLA: ${categoryData.sla_hours}h`);
    console.log(`   → Priority Boost: +${categoryData.priority_boost}`);

    // Query team from database
    const team = await teamRepo.findOne({
      where: { name: categoryData.assigned_team },
    });

    if (!team || team.members.length === 0) {
      console.warn(
        `❌ Team "${categoryData.assigned_team}" not found or has no members`,
      );
      return null;
    }

    // Randomly select a member (simple load balancing)
    const randomIndex = Math.floor(Math.random() * team.members.length);
    const selectedMember = team.members[randomIndex];

    console.log(`✅ Assigned to team: ${team.name} → ${selectedMember}`);

    return {
      team: team.name,
      member: selectedMember,
      sla_hours: categoryData.sla_hours,
      priority_boost: categoryData.priority_boost,
    };
  } catch (error) {
    console.error("❌ Error in autoSelectTeam:", error);
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
  if (state.needs_approval) {
    console.log(
      "⏸️  Ticket requires manager approval (HIGH/CRITICAL priority)",
    );
    console.log("   → Routing to WAIT_APPROVAL node");
    console.log("   → Workflow will PAUSE after this node");
    console.log(
      `   → Priority: ${state.priority?.level} (${state.priority?.score}/100)`,
    );
    return WorkflowStep.WAIT_APPROVAL;
  }

  // All other cases: continue to finalization
  console.log("✅ Ticket processing - checking for auto-resolution");
  console.log(
    `   → Priority: ${state.priority?.level} (${state.priority?.score}/100)`,
  );
  console.log("   → Continuing to FINALIZE_TICKET node");
  return WorkflowStep.FINALIZE_TICKET;
}
