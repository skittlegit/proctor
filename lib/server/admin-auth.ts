import "server-only";
import { timingSafeEqual } from "node:crypto";

export function isAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  const provided = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!expected || !provided) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
