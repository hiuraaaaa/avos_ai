"use client";

import { useRouter } from "next/navigation";

export default function StartLanding() {
  const router = useRouter();

  function handleStart() {
    router.push("/personalize");
  }

  return (
    <div className="app-root">
      <main className="main-screen">
        <section className="hero-left">
          <div className="hero-card">
            {/* ORBIT */}
            <div className="hero-orbit">
              <div className="hero-orbit-ring ring-1" />
              <div className="hero-orbit-ring ring-2" />
              <div className="hero-orbit-ring ring-3" />

              {/* ICON CROWN */}
              <div className="hero-logo">👑</div>
            </div>

            {/* TEXT + BUTTON */}
            <div className="hero-content">
              <h1>Discover Intelligence with DeepSeek AVOS</h1>

              <p>
                History chat dan project kamu tersimpan di Supabase.  
                Kamu bisa fokus bikin prompt — AVOS yang mikir.
              </p>

              <button className="btn-hero" type="button" onClick={handleStart}>
                <span>Get Started</span>
                <span className="btn-hero-icon">➜</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
