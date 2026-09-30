// Exports the current Claude Code session (prompts, responses, tool calls) to
// .agent-logs/<date>-<session>.md. Runs from the Stop and UserPromptSubmit hooks.
// The file is regenerated from the full transcript each time, and secrets are redacted.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const transcript = input.transcript_path;
const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
if (!transcript || !existsSync(transcript)) process.exit(0);

const REDACTIONS = [
  [/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "postgresql://[REDACTED]"],
  [/\b(AUTH_SECRET|DEMO_USER_PASSWORD|DATABASE_URL|DIRECT_URL|[A-Z_]*(?:TOKEN|SECRET|PASSWORD|API_KEY))(\s*[=:]\s*)("?)[^\s"'`]+\3/g, "$1$2[REDACTED]"],
  [/\b(gh[opsur]_|github_pat_|sk-|sk_live_|sk_test_|npg_|vercel_|xox[abp]-)[A-Za-z0-9_-]{6,}/g, "[REDACTED_TOKEN]"],
  [/\bBearer\s+[A-Za-z0-9._-]+/g, "Bearer [REDACTED]"],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, "[REDACTED_JWT]"],
  [/[A-Za-z0-9._%+-]+@(?!example\.com\b|anthropic\.com\b|x\.dummyjson\.com\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[REDACTED_EMAIL]"],
];
const redact = (s) => REDACTIONS.reduce((acc, [re, rep]) => acc.replace(re, rep), String(s));
const clean = (s) => s.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "").trim();
const clip = (s, n) => (s.length > n ? s.slice(0, n) + " …" : s);

function toolLine(block) {
  const i = block.input || {};
  const detail = i.description || i.command || i.file_path || i.pattern || i.prompt || i.skill || "";
  const cmd = i.command && i.description ? `\n\n\`\`\`\n${clip(i.command, 1500)}\n\`\`\`` : "";
  return `> **Tool: ${block.name}** — ${clip(String(detail).split("\n")[0], 200)}${cmd}`;
}

const out = [];
let started;
for (const line of readFileSync(transcript, "utf8").split("\n")) {
  if (!line.trim()) continue;
  let e;
  try { e = JSON.parse(line); } catch { continue; }
  if (e.isMeta || e.isSidechain || !e.message) continue;
  started ??= e.timestamp;
  const ts = e.timestamp ? ` · ${e.timestamp.replace("T", " ").slice(0, 19)} UTC` : "";
  const content = typeof e.message.content === "string"
    ? [{ type: "text", text: e.message.content }]
    : e.message.content || [];
  if (e.type === "user") {
    const text = clean(content.filter((b) => b.type === "text").map((b) => b.text).join("\n"));
    if (text && !text.startsWith("[SYSTEM NOTIFICATION")) out.push(`## Prompt${ts}\n\n${text}`);
  } else if (e.type === "assistant") {
    for (const b of content) {
      if (b.type === "text" && b.text.trim()) out.push(`### Response${ts}\n\n${b.text.trim()}`);
      else if (b.type === "tool_use") out.push(toolLine(b));
    }
  }
}

const dir = join(projectDir, ".agent-logs");
mkdirSync(dir, { recursive: true });
const date = (started || new Date().toISOString()).slice(0, 10);
const session = String(input.session_id || "session").slice(0, 8);
const header = `# Agent log ${date} (session ${session})\n\nCaptured automatically from Claude Code by \`.claude/hooks/capture.mjs\`. Secrets are redacted.\n`;
writeFileSync(join(dir, `${date}-${session}.md`), redact([header, ...out].join("\n\n")) + "\n");
