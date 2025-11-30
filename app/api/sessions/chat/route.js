import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      clientId,
      sessionId,
      nickname,
      instruction,
      prompt,
      imageBase64,
      imageMime,
      imagePrompt
    } = body;

    if (!clientId) {
      return Response.json({ error: "clientId is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY belum di-set" },
        { status: 500 }
      );
    }

    // 1. session
    let currentSessionId = sessionId;

    if (!currentSessionId) {
      const { data, error } = await supabaseAdmin
        .from("sessions")
        .insert({
          client_id: clientId,
          title: prompt ? prompt.slice(0, 40) : "New Session"
        })
        .select("id")
        .single();

      if (error) {
        console.error(error);
        return Response.json(
          { error: "Gagal membuat session" },
          { status: 500 }
        );
      }
      currentSessionId = data.id;
    }

    // 2. history
    const { data: historyMsgs } = await supabaseAdmin
      .from("messages")
      .select("role, content")
      .eq("session_id", currentSessionId)
      .order("created_at", { ascending: true })
      .limit(12);

    const parts = [];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMime || "image/png",
          data: imageBase64
        }
      });
      if (imagePrompt && imagePrompt.trim()) {
        parts.push({ text: imagePrompt.trim() });
      }
    }

    const systemText =
      `${instruction || ""}\n` +
      `Nama panggilan user: ${nickname || "User"}.\n` +
      `Jawab dengan bahasa Indonesia santai, jelas, dan to the point. ` +
      `Jika diminta JSON, balas JSON valid tanpa penjelasan tambahan.\n\n`;

    let historyText = "";
    if (historyMsgs && historyMsgs.length) {
      historyText =
        "Riwayat percakapan singkat:\n" +
        historyMsgs
          .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
          .join("\n") +
        "\n\n";
    }

    const finalPrompt =
      systemText +
      historyText +
      `User sekarang: ${prompt || "(tanpa teks, mungkin hanya gambar)"}`;

    parts.push({ text: finalPrompt });

    // 3. simpan user msg
    if (prompt || imageBase64) {
      const userText = prompt
        ? prompt
        : "[User mengirim gambar]" +
          (imagePrompt ? `\nPrompt: ${imagePrompt}` : "");
      await supabaseAdmin.from("messages").insert({
        session_id: currentSessionId,
        role: "user",
        content: userText
      });
    }

    // 4. panggil Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts
          }
        ]
      })
    });

    if (!geminiRes.ok) {
      const text = await geminiRes.text();
      console.error("Gemini error:", text);
      return Response.json(
        { error: `Gemini error: ${geminiRes.status}`, detail: text },
        { status: 500 }
      );
    }

    const data = await geminiRes.json();
    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("") || "(Model tidak mengembalikan teks)";

    await supabaseAdmin.from("messages").insert({
      session_id: currentSessionId,
      role: "ai",
      content: reply
    });

    return Response.json({ reply, sessionId: currentSessionId });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
              }
