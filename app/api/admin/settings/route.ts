import { isAdmin } from "@/lib/server/admin-auth";
import { getAdminSettings, saveAdminSettings } from "@/lib/server/admin-settings";

export async function GET(request: Request) {
  if (!isAdmin(request)) return Response.json({ error: "Invalid admin password." }, { status: 401 });
  try {
    return Response.json(await getAdminSettings(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Assessment settings are unavailable." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  if (!isAdmin(request)) return Response.json({ error: "Invalid admin password." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object" || typeof (body as { allowWithoutMedia?: unknown }).allowWithoutMedia !== "boolean") {
    return Response.json({ error: "Invalid setting." }, { status: 400 });
  }
  const settings = { allowWithoutMedia: (body as { allowWithoutMedia: boolean }).allowWithoutMedia };
  try {
    await saveAdminSettings(settings);
    return Response.json(settings, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Could not save assessment settings." }, { status: 503 });
  }
}
