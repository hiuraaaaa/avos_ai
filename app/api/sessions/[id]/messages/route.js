import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function GET(req, { params }) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return Response.json({ error: "clientId is required" }, { status: 400 });
  }

  const { data: sess, error: sessErr } = await supabaseAdmin
    .from("sessions")
    .select("id, client_id, title, created_at")
    .eq("id", id)
    .single();

  if (sessErr || !sess) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  if (sess.client_id !== clientId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: msgs, error } = await supabaseAdmin
    .from("messages")
    .select("id, role, content, created_at")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    session: {
      id: sess.id,
      title: sess.title,
      created_at: sess.created_at
    },
    messages: msgs || []
  });
}
