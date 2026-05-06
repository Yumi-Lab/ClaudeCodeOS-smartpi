import { query, type PermissionMode } from "@anthropic-ai/claude-code";
import cron from "node-cron";
import { getHomeDir } from "../utils/os.ts";
import { readTextFile, writeTextFile, exists, mkdir } from "../utils/fs.ts";
import { logger } from "../utils/logger.ts";

export interface CronJob {
  id: string;
  name: string;
  schedule: string; // cron expression
  prompt: string;
  workingDirectory?: string;
  allowedTools?: string[];
  permissionMode?: PermissionMode;
  enabled: boolean;
  lastRun?: string;
  lastResult?: string;
  createdAt: string;
}

type ScheduledTask = ReturnType<typeof cron.schedule>;
const SCHEDULED_TASKS = new Map<string, ScheduledTask>();

function getJobsPath(): string {
  const home = getHomeDir() || "/tmp";
  return `${home}/.claude/cron/jobs.json`;
}

async function ensureCronDir() {
  const home = getHomeDir() || "/tmp";
  const dir = `${home}/.claude/cron`;
  if (!(await exists(dir))) {
    await mkdir(dir);
  }
}

export async function loadJobs(): Promise<CronJob[]> {
  try {
    const path = getJobsPath();
    if (!(await exists(path))) {
      return [];
    }
    const content = await readTextFile(path);
    return JSON.parse(content) as CronJob[];
  } catch (error) {
    logger.app.error("Failed to load cron jobs: {error}", { error });
    return [];
  }
}

async function saveJobs(jobs: CronJob[]) {
  await ensureCronDir();
  const path = getJobsPath();
  await writeTextFile(path, JSON.stringify(jobs, null, 2));
}

async function executeJob(
  job: CronJob,
  cliPath: string,
): Promise<string> {
  try {
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
    const result = lines.join("\n").slice(0, 2000); // truncate
    return result || "Done (no output)";
  } catch (error) {
    const err =
      error instanceof Error ? error.message : String(error);
    logger.app.error("Cron job {id} failed: {error}", {
      id: job.id,
      error: err,
    });
    return `Error: ${err}`;
  }
}

export async function startScheduler(cliPath: string) {
  // Stop existing tasks
  for (const task of SCHEDULED_TASKS.values()) {
    task.stop();
  }
  SCHEDULED_TASKS.clear();

  const jobs = await loadJobs();
  for (const job of jobs) {
    if (!job.enabled || !cron.validate(job.schedule)) {
      continue;
    }
    const task = cron.schedule(
      job.schedule,
      async () => {
        logger.app.info("Executing cron job {name} ({id})", {
          name: job.name,
          id: job.id,
        });
        const result = await executeJob(job, cliPath);
        job.lastRun = new Date().toISOString();
        job.lastResult = result;
        await saveJobs(jobs);
      },
    );
    SCHEDULED_TASKS.set(job.id, task);
  }

  logger.app.info("Cron scheduler started with {count} jobs", {
    count: SCHEDULED_TASKS.size,
  });
}

export async function addJob(
  job: Omit<CronJob, "id" | "createdAt">,
  cliPath: string,
): Promise<CronJob> {
  const jobs = await loadJobs();
  const newJob: CronJob = {
    ...job,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  jobs.push(newJob);
  await saveJobs(jobs);
  await startScheduler(cliPath);
  return newJob;
}

export async function updateJob(
  id: string,
  updates: Partial<Omit<CronJob, "id" | "createdAt">>,
  cliPath: string,
): Promise<CronJob | null> {
  const jobs = await loadJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return null;
  jobs[idx] = { ...jobs[idx], ...updates };
  await saveJobs(jobs);
  await startScheduler(cliPath);
  return jobs[idx];
}

export async function deleteJob(
  id: string,
  cliPath: string,
): Promise<boolean> {
  const jobs = await loadJobs();
  const filtered = jobs.filter((j) => j.id !== id);
  if (filtered.length === jobs.length) return false;
  await saveJobs(filtered);
  await startScheduler(cliPath);
  return true;
}
