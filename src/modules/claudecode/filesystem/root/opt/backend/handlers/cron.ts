import { Context } from "hono";
import { logger } from "../utils/logger.ts";
import {
  loadJobs,
  addJob,
  updateJob,
  deleteJob,
  startScheduler,
  type CronJob,
} from "../scheduler/cronManager.ts";

export async function handleCronListRequest(c: Context) {
  try {
    const jobs = await loadJobs();
    return c.json({ jobs, count: jobs.length });
  } catch (error) {
    logger.app.error("Error listing cron jobs: {error}", { error });
    return c.json({ error: "Failed to list cron jobs" }, 500);
  }
}

export async function handleCronCreateRequest(c: Context) {
  try {
    const body = await c.req.json();
    const { name, schedule, prompt, workingDirectory, allowedTools, permissionMode, enabled } = body;

    if (!name || !schedule || !prompt) {
      return c.json({ error: "name, schedule, and prompt are required" }, 400);
    }

    const { cliPath } = c.var.config;
    const job = await addJob(
      {
        name,
        schedule,
        prompt,
        workingDirectory,
        allowedTools,
        permissionMode,
        enabled: enabled !== false,
      },
      cliPath,
    );

    return c.json({ job }, 201);
  } catch (error) {
    logger.app.error("Error creating cron job: {error}", { error });
    return c.json(
      {
        error: "Failed to create cron job",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
}

export async function handleCronUpdateRequest(c: Context) {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { cliPath } = c.var.config;

    const job = await updateJob(id, body, cliPath);
    if (!job) {
      return c.json({ error: "Job not found" }, 404);
    }
    return c.json({ job });
  } catch (error) {
    logger.app.error("Error updating cron job: {error}", { error });
    return c.json(
      {
        error: "Failed to update cron job",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
}

export async function handleCronDeleteRequest(c: Context) {
  try {
    const id = c.req.param("id");
    const { cliPath } = c.var.config;

    const deleted = await deleteJob(id, cliPath);
    if (!deleted) {
      return c.json({ error: "Job not found" }, 404);
    }
    return c.json({ success: true });
  } catch (error) {
    logger.app.error("Error deleting cron job: {error}", { error });
    return c.json({ error: "Failed to delete cron job" }, 500);
  }
}

export async function handleCronRunRequest(c: Context) {
  try {
    const id = c.req.param("id");
    const { cliPath } = c.var.config;

    const jobs = await loadJobs();
    const job = jobs.find((j) => j.id === id);
    if (!job) {
      return c.json({ error: "Job not found" }, 404);
    }

    // Import execute logic inline to avoid circular deps
    const { query } = await import("@anthropic-ai/claude-code");
    const lines: string[] = [];
    for await (const msg of query({
      prompt: job.prompt,
      options: {
        executable: "node",
        executableArgs: [],
        pathToClaudeCodeExecutable: cliPath,
        ...(job.workingDirectory ? { cwd: job.workingDirectory } : {}),
        ...(job.allowedTools ? { allowedTools: job.allowedTools } : {}),
        ...(job.permissionMode ? { permissionMode: job.permissionMode } : {}),
      },
    })) {
      if (typeof msg === "object" && msg !== null) {
        lines.push(JSON.stringify(msg));
      }
    }

    return c.json({
      result: lines.join("\n").slice(0, 2000) || "Done (no output)",
    });
  } catch (error) {
    logger.app.error("Error running cron job: {error}", { error });
    return c.json({ error: "Failed to run job" }, 500);
  }
}
