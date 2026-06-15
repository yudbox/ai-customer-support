import { getDataSource } from "@/lib/database/connection";

export interface TicketMetricsRow {
  total: string;
  status: string;
  count: string;
}

export interface TicketByCategoryRow {
  category: string | null;
  count: string;
}

export interface TicketByDayRow {
  date: string;
  count: string;
}

export interface ResolutionTimeRow {
  avg_minutes: string | null;
}

export interface HitlRateRow {
  total_with_thread: string;
  total: string;
}

export interface PriorityDistributionRow {
  priority: string | null;
  count: string;
}

export interface AvgPriorityScoreRow {
  avg_score: string | null;
}

export interface TicketCountRow {
  total: string;
}

export interface StatusCountRow {
  status: string;
  count: string;
}

/**
 * AnalyticsRepository — слой доступа к данным для аналитики
 * Все запросы принимают dateRange { from, to }
 */
export class AnalyticsRepository {
  /**
   * Общее кол-во тикетов за период
   */
  async countTotal(from: Date, to: Date): Promise<number> {
    const connection = await getDataSource();
    const rows: TicketCountRow[] = await connection.query(
      `SELECT COUNT(*) as total FROM tickets WHERE created_at >= $1 AND created_at <= $2`,
      [from, to],
    );
    return parseInt(rows[0]?.total ?? "0", 10);
  }

  /**
   * Кол-во тикетов по статусам за период
   */
  async countByStatus(from: Date, to: Date): Promise<StatusCountRow[]> {
    const connection = await getDataSource();
    return connection.query(
      `SELECT status, COUNT(*) as count
       FROM tickets
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY status`,
      [from, to],
    );
  }

  /**
   * Кол-во тикетов по категориям за период
   */
  async countByCategory(from: Date, to: Date): Promise<TicketByCategoryRow[]> {
    const connection = await getDataSource();
    return connection.query(
      `SELECT COALESCE(category, 'Uncategorized') as category, COUNT(*) as count
       FROM tickets
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY category
       ORDER BY count DESC`,
      [from, to],
    );
  }

  /**
   * Кол-во тикетов по дням за период (для bar chart)
   */
  async countByDay(from: Date, to: Date): Promise<TicketByDayRow[]> {
    const connection = await getDataSource();
    return connection.query(
      `SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, COUNT(*) as count
       FROM tickets
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY date
       ORDER BY date ASC`,
      [from, to],
    );
  }

  /**
   * Среднее время решения (в минутах) для resolved тикетов за период
   */
  async avgResolutionMinutes(from: Date, to: Date): Promise<number | null> {
    const connection = await getDataSource();
    const rows: ResolutionTimeRow[] = await connection.query(
      `SELECT AVG(time_to_resolve_minutes) as avg_minutes
       FROM tickets
       WHERE created_at >= $1 AND created_at <= $2
         AND time_to_resolve_minutes IS NOT NULL`,
      [from, to],
    );
    const val = rows[0]?.avg_minutes;
    return val !== null && val !== undefined ? parseFloat(val) : null;
  }

  /**
   * HITL rate — кол-во тикетов с thread_id (прошли через WAIT_APPROVAL)
   * и общее кол-во за период
   */
  async hitlStats(
    from: Date,
    to: Date,
  ): Promise<{ withHitl: number; total: number }> {
    const connection = await getDataSource();
    const rows: HitlRateRow[] = await connection.query(
      `SELECT
         COUNT(*) FILTER (WHERE thread_id IS NOT NULL) as total_with_thread,
         COUNT(*) as total
       FROM tickets
       WHERE created_at >= $1 AND created_at <= $2`,
      [from, to],
    );
    return {
      withHitl: parseInt(rows[0]?.total_with_thread ?? "0", 10),
      total: parseInt(rows[0]?.total ?? "0", 10),
    };
  }

  /**
   * Распределение тикетов по priority level за период
   */
  async countByPriority(
    from: Date,
    to: Date,
  ): Promise<PriorityDistributionRow[]> {
    const connection = await getDataSource();
    return connection.query(
      `SELECT COALESCE(priority, 'unset') as priority, COUNT(*) as count
       FROM tickets
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY priority`,
      [from, to],
    );
  }

  /**
   * Средний priority score за период
   */
  async avgPriorityScore(from: Date, to: Date): Promise<number | null> {
    const connection = await getDataSource();
    const rows: AvgPriorityScoreRow[] = await connection.query(
      `SELECT AVG(priority_score) as avg_score
       FROM tickets
       WHERE created_at >= $1 AND created_at <= $2
         AND priority_score IS NOT NULL`,
      [from, to],
    );
    const val = rows[0]?.avg_score;
    return val !== null && val !== undefined ? parseFloat(val) : null;
  }
}

export const analyticsRepository = new AnalyticsRepository();
