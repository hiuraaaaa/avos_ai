"use client";

import { useRouter } from "next/navigation";

export default function StartLanding() {
  const router = useRouter();

  function handleStart() {
    router.push("/personalize");
  }

  return (
    <>
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

                <button
                  className="btn-hero"
                  type="button"
                  onClick={handleStart}
                >
                  <span>Get Started</span>
                  <span className="btn-hero-icon">➜</span>
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* CSS SCOPED UNTUK START LANDING */}
      <style jsx>{`
        :global(html),
        :global(body) {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
            sans-serif;
          background: radial-gradient(
              circle at top,
              #2e0f4d 0%,
              #060015 60%,
              #000000 100%
            );
          color: #f1f3f9;
        }

        .app-root {
          min-height: 100vh;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .main-screen {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          place-items: center;
        }

        .hero-left {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .hero-card {
          width: 100%;
          max-width: 640px;
          padding: 28px 26px 24px;
          border-radius: 32px;
          background: radial-gradient(
            circle at top,
            #3d0e72 0%,
            #050018 55%,
            #020010 100%
          );
          border: 1px solid rgba(180, 200, 255, 0.25);
          box-shadow:
            0 0 0 1px rgba(20, 20, 40, 0.8),
            0 34px 70px rgba(0, 0, 0, 0.95),
            0 0 150px rgba(130, 80, 255, 0.55);
        }

        .hero-orbit {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 32px;
          background: radial-gradient(
            circle at 40% 0,
            #321064 0%,
            #080018 60%
          );
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-orbit-ring {
          position: absolute;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.35);
        }

        .hero-orbit-ring.ring-1 {
          width: 82%;
          height: 82%;
        }

        .hero-orbit-ring.ring-2 {
          width: 62%;
          height: 62%;
          border-color: rgba(168, 85, 247, 0.5);
        }

        .hero-orbit-ring.ring-3 {
          width: 42%;
          height: 42%;
          border-color: rgba(56, 189, 248, 0.5);
        }

        .hero-logo {
          width: 90px;
          height: 90px;
          border-radius: 999px;
          background: radial-gradient(
            circle at 30% 0,
            #fefce8 0,
            #fbbf24 40%,
            #a855f7 70%,
            #020617 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.4rem;
          box-shadow:
            0 0 30px rgba(250, 204, 21, 0.9),
            0 0 80px rgba(168, 85, 247, 0.9);
        }

        .hero-content {
          margin-top: 20px;
        }

        .hero-content h1 {
          margin: 0 0 10px;
          font-size: 1.6rem;
          letter-spacing: 0.02em;
        }

        .hero-content p {
          margin: 0 0 20px;
          font-size: 0.95rem;
          color: #cbd5ff;
          max-width: 460px;
        }

        .btn-hero {
          border: none;
          border-radius: 999px;
          padding: 10px 20px;
          font-size: 0.9rem;
          font-weight: 600;
          background: linear-gradient(135deg, #a855f7, #6366f1);
          color: #f9fafb;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow:
            0 0 18px rgba(168, 85, 247, 0.9),
            0 16px 36px rgba(55, 48, 163, 0.95);
          transition: transform 0.12s ease,
            box-shadow 0.12s ease,
            filter 0.12s ease;
        }

        .btn-hero:hover {
          filter: brightness(1.05);
          box-shadow:
            0 0 24px rgba(168, 85, 247, 1),
            0 22px 40px rgba(55, 48, 163, 1);
        }

        .btn-hero:active {
          transform: translateY(1px) scale(0.98);
          box-shadow:
            0 0 16px rgba(168, 85, 247, 0.85),
            0 12px 30px rgba(55, 48, 163, 0.9);
        }

        .btn-hero-icon {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.95);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          color: #e5e7eb;
        }

        @media (max-width: 640px) {
          .app-root {
            padding: 12px;
          }

          .hero-card {
            padding: 22px 16px 18px;
            border-radius: 28px;
          }

          .hero-content h1 {
            font-size: 1.4rem;
          }

          .hero-content p {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
}
