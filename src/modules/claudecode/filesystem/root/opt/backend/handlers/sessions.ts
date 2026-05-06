import { Context } from "hono";
import { logger } from "../utils/logger.ts";
import { readDir, exists, stat } from "../utils/fs.ts";
import { getHomeDir } from "../utils/os.ts";

export interface SessionInfo {
  sessionId: string;
  project: string;
  encodedProjectName: string;
  lastModified?: number;
}

/**
 * Scan ~/.claude/projects and list all sessions across all projects
 */
export async function handleSessionsRequest(c: Context) {
  try {
    const homeDir = getHomeDir();
    if (!homeDir) {
      return c.json({ error: "Home directory not found" }, 500);
    }

    const projectsDir = `${homeDir}/.claude/projects`;
    if (!(await exists(projectsDir))) {
      return c.json({ sessions: [] });
    }

    const sessions: SessionInfo[] = [];

    for await (const projectEntry of readDir(projectsDir)) {
      if (!projectEntry.isDirectory) continue;

      const encodedProjectName = projectEntry.name;
      const historyDir = `${projectsDir}/${encodedProjectName}`;

      for await (const fileEntry of readDir(historyDir)) {
        if (!fileEntry.isFile || !fileEntry.name.endsWith(".jsonl")) continue;

        const sessionId = fileEntry.name.replace(".jsonl", "");
        let lastModified: number | undefined;
        try {
          const s = await stat(`${historyDir}/${fileEntry.name}`);
          lastModified = s.mtime?.getTime();
        } catch {
          // ignore
        }
        sessions.push({
          sessionId,
          project: historyDir,
          encodedProjectName,
          lastModified,
        });
      }
    }

    // Sort by last modified desc
    sessions.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

    return c.json({ sessions, count: sessions.length });
  } catch (error) {
    logger.app.error("Error listing sessions: {error}", { error });
    return c.json(
      {
        error: "Failed to list sessions",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
}
