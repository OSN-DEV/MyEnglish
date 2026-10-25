#!/usr/bin/env node
// PostToolUse(Edit|Write): 編集したファイルに応じて型チェック / cargo check を実行し、
// 失敗したら exit 2 でエラー内容を Claude に返す
import { execSync } from "node:child_process";

let input = "";
for await (const chunk of process.stdin) input += chunk;
const file = JSON.parse(input).tool_input?.file_path ?? "";
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

let cmd;
if (/\.(ts|tsx)$/.test(file)) {
  cmd = "pnpm exec tsc --noEmit";
} else if (/src-tauri\/.*\.rs$/.test(file)) {
  cmd = "cargo check --quiet --manifest-path src-tauri/Cargo.toml";
}
if (!cmd) process.exit(0);

try {
  execSync(cmd, { cwd: root, stdio: "pipe" });
} catch (e) {
  const out = `${e.stdout ?? ""}${e.stderr ?? ""}`.slice(0, 4000);
  process.stderr.write(`${cmd} が失敗しました:\n${out}`);
  process.exit(2);
}
