"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const LS_KEY = "avos_gemini_supabase_state_v1";

export default function PersonalizeHero() {
  const router = useRouter();
  const [nickname, setNickname] = useState("Robin");
  const [instruction, setInstruction] = useState(
    "Kamu AVOS AI, pintar, cepat, humor cerdas, pakai bahasa Indonesia santai tapi to the point."
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.nickname) setNickname(parsed.nickname);
      if (parsed.instruction) setInstruction(parsed.instruction);
    } catch {}
  }, []);

  function handleSave() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        LS_KEY,
        JSON.stringify({ nickname, instruction })
      );
    }
    router.push("/chat");
  }

  return (
    <div className="app-root">
      <main className="main-screen" style={{ maxWidth: 960 }}>
        <section className="hero-left" style={{ gridColumn: "1 / -1" }}>
          <div className="hero-card" style={{ maxWidth: 640 }}>
            <div className="hero-orbit">
              <div className="hero-orbit-ring ring-1" />
              <div className="hero-orbit-ring ring-2" />
              <div className="hero-orbit-ring ring-3" />
              <div className="hero-logo">👑</div>
            </div>

            <div className="hero-content">
              <h1>Personalisasi AVOS</h1>
              <p>
                Atur nama panggilan dan kepribadian AI. Setting disimpan di
                browser kamu dan dipakai di setiap chat.
              </p>

              <label className="field-label">
                Nama panggilan Anda
                <span className="field-hint">
                  Contoh: Robin, Boss, Founder AVOS, dll.
                </span>
                <input
                  className="field-input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Robin"
                />
              </label>

              <label className="field-label">
                Instruksi AI / Logic
                <span className="field-hint">
                  Jelaskan gaya bicara & cara berpikir AI. Misal: “Kamu pintar,
                  respon cepat, humor cerdas, pakai bahasa Indonesia santai.”
                </span>
                <textarea
                  className="field-textarea"
                  rows={5}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                />
              </label>

              <div className="personal-actions" style={{ marginTop: 8 }}>
                <button className="btn-primary" type="button" onClick={handleSave}>
                  Simpan &amp; Mulai Chat
                </button>
              </div>

              <p className="personal-note">
                Catatan: semua pengaturan disimpan di <b>localStorage</b>{" "}
                browser.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
