import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return Response.json({ error: "clientId is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("sessions")
    .select("id, title, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ sessions: data || [] });
}

export async function POST(req) {
  const body = await req.json();
  const { clientId, title } = body;

  if (!clientId) {
    return Response.json({ error: "clientId is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("sessions")
    .insert({
      client_id: clientId,
      title: title || "New Session"
    })
    .select("id, title, created_at")
    .single();

  if (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ session: data });
}
