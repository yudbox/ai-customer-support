/**
 * Minimal in-memory router and scheduler for the Blast Radius demo module.
 * They only record registrations — nothing listens on a port or runs on a
 * timer — so the demo stays free of extra dependencies.
 */

export type Handler = (params: Record<string, string>) => unknown;

interface Route {
  method: "GET" | "POST";
  path: string;
  handler: Handler;
}

export function createRouter() {
  const routes: Route[] = [];
  return {
    routes,
    get(path: string, handler: Handler) {
      routes.push({ method: "GET", path, handler });
    },
    post(path: string, handler: Handler) {
      routes.push({ method: "POST", path, handler });
    },
  };
}

interface ScheduledJob {
  expression: string;
  task: () => unknown;
}

const jobs: ScheduledJob[] = [];

export const cron = {
  jobs,
  schedule(expression: string, task: () => unknown) {
    jobs.push({ expression, task });
  },
};
