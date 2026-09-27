import { getAdminSettings } from "@/lib/server/admin-settings";

export async function GET() {
  try {
    return Response.json(await getAdminSettings(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Assessment settings are unavailable." }, { status: 503 });
  }
}
