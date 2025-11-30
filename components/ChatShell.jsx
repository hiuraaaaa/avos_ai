"use client";

import { useEffect, useRef, useState } from "react";

const LS_KEY = "avos_gemini_supabase_state_v1";
const CLIENT_ID_KEY = "avos_client_id_v1";

function ensureClientId() {
  if (typeof window === "undefined") return null;
  let id = window.localStorage.getItem(CLIENT_ID_KEY);
  if (!id && window.crypto?.randomUUID) {
    id = window.crypto.randomUUID();
    window.localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export default function ChatShell() {
  const [clientId, setClientId] = useState(null);
  const [nickname, setNickname] = useState("Robin");
  const [instruction, setInstruction] = useState(
    "Kamu AVOS AI, pintar, cepat, humor cerdas, pakai bahasa Indonesia santai tapi to the point."
  );

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [userInput, setUserInput] = useState("");
  const [pendingImage, setPendingImage] = useState(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [showHistory, setShowHistory] = useState(false);

  const msgRef = useRef(null);
  const imgInputRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = ensureClientId();
    setClientId(id);

    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.nickname) setNickname(parsed.nickname);
        if (parsed.instruction) setInstruction(parsed.instruction);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!clientId) return;
    loadSessions(clientId);
  }, [clientId]);

  async function loadSessions(cid) {
    setLoadingSessions(true);
    try {
      const res = await fetch(`/api/sessions?clientId=${cid}`);
      const data = await res.json();
      const list = data.sessions || [];
      setSessions(list);
      if (list.length > 0 && !activeSessionId) {
        setActiveSessionId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    if (!clientId || !activeSessionId) return;
    loadMessages(activeSessionId, clientId);
  }, [activeSessionId, clientId]);

  async function loadMessages(sessionId, cid) {
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/sessions/${sessionId}/messages?clientId=${cid}`
      );
      const data = await res.json();
      setMessages(
        (data.messages || []).map((m) => ({
          id: m.id,
          role: m.role,
          text: m.content,
          created_at: m.created_at
        }))
      );
      scrollToBottom();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (msgRef.current) {
        msgRef.current.scrollTop = msgRef.current.scrollHeight;
      }
    }, 0);
  }

  async function handleSend() {
    if (!clientId) return;
    if (sending) return;
    if (!userInput.trim() && !pendingImage) return;

    const prompt = userInput.trim();
    const uiUserText = prompt
      ? prompt
      : "[User mengirim gambar]" +
        (imagePrompt ? `\nPrompt: ${imagePrompt}` : "");

    setMessages((prev) => [
      ...prev,
      { id: `tmp-u-${Date.now()}`, role: "user", text: uiUserText }
    ]);
    setUserInput("");
    scrollToBottom();

    setSending(true);

    try {
      let imageBase64 = null;
      let imageMime = null;
      if (pendingImage) {
        const b64 = await fileToBase64(pendingImage);
        imageBase64 = b64;
        imageMime = pendingImage.type || "image/png";
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          sessionId: activeSessionId,
          nickname,
          instruction,
          prompt,
          imageBase64,
          imageMime,
          imagePrompt
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error dari server");
      }

      const reply = data.reply || "(Jawaban kosong)";
      const newSessionId = data.sessionId;

      if (!activeSessionId) {
        setActiveSessionId(newSessionId);
      }

      loadSessions(clientId);

      setMessages((prev) => [
        ...prev,
        { id: `tmp-ai-${Date.now()}`, role: "ai", text: reply }
      ]);
      scrollToBottom();
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-ai-err-${Date.now()}`,
          role: "ai",
          text:
            "Maaf, terjadi error saat memanggil AI.\n" + (err.message || "")
        }
      ]);
    } finally {
      setSending(false);
      setPendingImage(null);
      setImagePrompt("");
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  }

  function handleNewSession() {
    if (!clientId) return;
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, title: "New Project" })
    })
      .then((res) => res.json())
      .then((data) => {
        const s = data.session;
        if (!s) return;
        setSessions((prev) => [...prev, s]);
        setActiveSessionId(s.id);
        setMessages([]);
      })
      .catch(console.error);
  }

  return (
    <div className="app-root">
      <main className="main-screen">
        {/* LEFT HERO */}
        <section className="hero-left">
          <div className="hero-card">
            <div className="hero-orbit">
              <div className="hero-orbit-ring ring-1" />
              <div className="hero-orbit-ring ring-2" />
              <div className="hero-orbit-ring ring-3" />
              <div className="hero-logo">🜲</div>
            </div>
            <div className="hero-content">
              <h1>Discover Intelligence with DeepSeek AVOS</h1>
              <p>
                History chat dan project kamu tersimpan di Supabase. Kamu bisa
                fokus bikin prompt — AVOS yang mikir.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT CHAT */}
        <section className="chat-right">
          <header className="topbar">
            <button
              type="button"
              className="round-icon top"
              onClick={() => setShowHistory(true)}
            >
              ☰
            </button>

            <button className="model-pill" type="button">
              <span className="model-dot" />
              <span>Gemini 2.0 Flash</span>
            </button>

            <div className="top-right-actions">
              <button
                type="button"
                className="round-icon top"
                onClick={handleNewSession}
              >
                ＋
              </button>
            </div>
          </header>

          <div className="chat-card">
            <div className="chat-header-mini">
              <div className="chat-header-left">
                <div className="avatar mini">
                  <div className="avatar-icon" />
                </div>
                <div>
                  <div className="chat-title">Deep Think (AI)</div>
                  <div className="chat-subtitle">
                    {nickname || "Hi"}, how can I assist you today? ✨
                  </div>
                </div>
              </div>
            </div>

            <div ref={msgRef} className="message-list">
              {loadingMessages && (
                <div className="msg-row ai">
                  <div className="bubble ai">Loading messages...</div>
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={"msg-row " + (m.role === "user" ? "user" : "ai")}
                >
                  <div
                    className={
                      "bubble " + (m.role === "user" ? "user" : "ai")
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="typing-row">
                  <div className="typing-bubble">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* INPUT BAR */}
            <div className="input-bar">
              <button
                type="button"
                className="input-left"
                onClick={() => imgInputRef.current?.click()}
              >
                +
              </button>
              <input
                ref={imgInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) {
                    setPendingImage(null);
                    return;
                  }
                  setPendingImage(f);
                }}
              />

              <div className="input-mid">
                <div className="input-top-row">
                  <span className="ai-chip">message DeepSeek AVOS</span>
                  <input
                    className="input-field"
                    placeholder="Tulis pesan atau prompt di sini..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                </div>
                <div
                  className={
                    "image-prompt-row " + (pendingImage ? "" : "hidden")
                  }
                >
                  <span className="image-pill">📷 1 image selected</span>
                  <input
                    className="image-prompt-input"
                    placeholder="Tambahkan prompt untuk gambar (opsional)..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                  />
                  <button
                    type="button"
                    className="round-icon tiny"
                    onClick={() => {
                      setPendingImage(null);
                      setImagePrompt("");
                      if (imgInputRef.current)
                        imgInputRef.current.value = "";
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <button
                type="button"
                className={"input-right " + (sending ? "disabled" : "")}
                onClick={handleSend}
              >
                <div className="send-icon" />
              </button>
            </div>

            <div className="footer-label">
              Model: <span>Gemini 2.0 Flash</span> • AVOS + Supabase
            </div>
          </div>
        </section>
      </main>

      {/* HISTORY PANEL */}
      {showHistory && (
        <div className="history-panel open">
          <div className="history-inner">
            <div className="history-header">
              <h2>Project History</h2>
              <button
                className="round-icon small"
                type="button"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>
            <div className="history-list">
              {loadingSessions && (
                <div className="history-item">
                  <div className="history-title">Loading sessions…</div>
                </div>
              )}
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={
                    "history-item " +
                    (s.id === activeSessionId ? "active" : "")
                  }
                  onClick={() => {
                    setActiveSessionId(s.id);
                    setShowHistory(false);
                  }}
                >
                  <div className="history-title">{s.title || "Session"}</div>
                  <div className="history-meta">
                    {new Date(s.created_at).toLocaleString("id-ID", {
                      dateStyle: "short",
                      timeStyle: "short"
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn-secondary full"
              type="button"
              onClick={handleNewSession}
            >
              + New Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const base64 = r.result.split(",")[1];
      resolve(base64);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
