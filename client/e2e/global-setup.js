import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export default async function globalSetup() {
  await execFileAsync(process.execPath, ["e2e/ensure-admin.cjs"], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "development" },
  });
}
