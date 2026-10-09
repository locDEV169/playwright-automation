import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "..", ".env"), quiet: true });

export const AUTH_FILE = path.resolve(__dirname, "..", "playwright", ".auth", "user.json");

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}
