/**
 * Save to Database Node
 *
 * Persists workflow results to PostgreSQL
 * Updates ticket with all data collected by agents
 */

import { getDataSource } from "@/lib/database/connection";
import { Ticket, TicketPriority } from "@/lib/database/entities/Ticket";

import type { WorkflowStateType } from "../state/WorkflowState";

/**
 * Save results to database
 *
 * Updates ticket with:
 * - Status (open, pending_approval, resolved)
 * - Priority (level, score)
 * - Classification (category, subcategory)
 * - Sentiment (label, score)
 * - Assignment (team, member)
 * - Resolution (if auto-resolved)
 *
 * @param state - Current workflow state with ticket_id
 * @returns Empty object (no state changes)
 */
export async function saveToDatabaseNode(state: WorkflowStateType) {
  if (!state.ticket_id) {
    return {};
  }

  try {
    const connection = await getDataSource();
    const ticketRepo = connection.getRepository(Ticket);

    // Prepare update data (only fields that exist in Ticket entity)
    const updateData: Partial<Ticket> = {
      status: state.status,
    };

    // Add priority data if available
    if (state.priority) {
      const priorityLevel = state.priority.level.toLowerCase();
      updateData.priority = priorityLevel as TicketPriority;
      updateData.priority_score = state.priority.score;
    }

    // Add classification data if available
    if (state.classification) {
      updateData.category = state.classification.category;
      updateData.subcategory = state.classification.subcategory;
    }

    // Add sentiment data if available
    if (state.sentiment) {
      updateData.sentiment_label = state.sentiment.label;
      updateData.sentiment_score = state.sentiment.score;
    }

    // Add automation data (assigned_team, assigned_to, resolution)
    if (state.assigned_team != null) {
      updateData.assigned_team = state.assigned_team;
    }
    if (state.assigned_to != null) {
      updateData.assigned_to = state.assigned_to;
    }
    if (state.resolution != null) {
      updateData.resolution = state.resolution;
    }

    // Update ticket in database
    await ticketRepo.update(state.ticket_id, updateData);
  } catch (_error) {
    // Don't throw - let workflow complete even if DB update fails
  }

  return {}; // No state changes
}
