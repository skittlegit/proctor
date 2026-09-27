import "server-only";

import { assessment } from "@/components/interview/config";

export type AdminSettings = { allowWithoutMedia: boolean };

function credentials() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  return { url: `${url.replace(/\/$/, "")}/rest/v1/assessment_settings`, key };
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const { url, key } = credentials();
  const response = await fetch(`${url}?assessment_id=eq.${encodeURIComponent(assessment.id)}&select=allow_without_media`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not read assessment settings.");
  const rows = await response.json() as { allow_without_media: boolean }[];
  return { allowWithoutMedia: rows[0]?.allow_without_media === true };
}

export async function saveAdminSettings(settings: AdminSettings): Promise<void> {
  const { url, key } = credentials();
  const response = await fetch(`${url}?on_conflict=assessment_id`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ assessment_id: assessment.id, allow_without_media: settings.allowWithoutMedia }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not save assessment settings.");
}
