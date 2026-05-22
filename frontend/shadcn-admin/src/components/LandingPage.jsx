import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Sora:wght@400;600;700&display=swap');

  .hb-root {
    font-family: 'Nunito', sans-serif;
    background: #f8f7ff;
    color: #1a1a2e;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }

  /* NAV */
  .hb-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(248,247,255,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .hb-logo {
    font-family: 'Sora', sans-serif;
    font-size: 1.4rem;
    font-weight: 700;
    background: linear-gradient(135deg, #FF6B6B, #A855F7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hb-nav-btn {
    background: #1a1a2e;
    color: #fff;
    border: none;
    padding: 0.5rem 1.25rem;
    border-radius: 99px;
    font-family: 'Nunito', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .hb-nav-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26,26,46,0.25);
  }

  /* HERO */
  .hb-hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 6rem 1.5rem 3rem;
    position: relative;
    overflow: hidden;
  }
  .hb-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;
    animation: hbFloat 6s ease-in-out infinite;
    pointer-events: none;
  }
  .hb-blob1 { width: 500px; height: 500px; background: #FF6B6B; top: -100px; left: -150px; animation-delay: 0s; }
  .hb-blob2 { width: 400px; height: 400px; background: #4ECDC4; top: 100px; right: -100px; animation-delay: 2s; }
  .hb-blob3 { width: 350px; height: 350px; background: #FFD93D; bottom: -50px; left: 30%; animation-delay: 4s; }

  @keyframes hbFloat {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-30px) scale(1.05); }
  }

  .hb-hero-tag {
    display: inline-block;
    background: linear-gradient(135deg, #fff8e1, #ffe0b2);
    color: #e65100;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.35rem 1rem;
    border-radius: 99px;
    margin-bottom: 1.5rem;
    border: 1.5px solid #ffcc80;
    position: relative;
    z-index: 1;
  }
  .hb-hero h1 {
    font-family: 'Sora', sans-serif;
    font-size: clamp(2.4rem, 6vw, 4rem);
    font-weight: 700;
    line-height: 1.15;
    max-width: 700px;
    position: relative;
    z-index: 1;
    margin-bottom: 1.25rem;
    color: #1a1a2e;
  }
  .hb-gradient-text {
    background: linear-gradient(135deg, #FF6B6B, #A855F7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hb-hero p {
    font-size: 1.1rem;
    color: #6b7280;
    max-width: 520px;
    line-height: 1.7;
    position: relative;
    z-index: 1;
    margin-bottom: 2.5rem;
  }
  .hb-hero-btns {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    position: relative;
    z-index: 1;
  }
  .hb-btn-primary {
    background: linear-gradient(135deg, #FF6B6B, #A855F7);
    color: #fff;
    border: none;
    padding: 0.85rem 2rem;
    border-radius: 99px;
    font-family: 'Nunito', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 20px rgba(168,85,247,0.35);
  }
  .hb-btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(168,85,247,0.45);
  }
  .hb-btn-secondary {
    background: #fff;
    color: #1a1a2e;
    border: 2px solid rgba(0,0,0,0.1);
    padding: 0.85rem 2rem;
    border-radius: 99px;
    font-family: 'Nunito', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .hb-btn-secondary:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }

  /* PREVIEW CARD */
  .hb-preview {
    position: relative;
    z-index: 1;
    margin-top: 3.5rem;
    background: #fff;
    border-radius: 24px;
    padding: 1.5rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    max-width: 580px;
    width: 100%;
    border: 1.5px solid rgba(0,0,0,0.06);
  }
  .hb-preview-bar { display: flex; gap: 6px; margin-bottom: 1rem; }
  .hb-dot { width: 10px; height: 10px; border-radius: 50%; }
  .hb-d1 { background: #FF6B6B; }
  .hb-d2 { background: #FFD93D; }
  .hb-d3 { background: #6BCB77; }
  .hb-preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .hb-pcard {
    border-radius: 14px;
    padding: 1rem;
    text-align: left;
  }
  .hb-pcard h4 {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.4rem;
    opacity: 0.7;
  }
  .hb-pcard .hb-big { font-size: 1.6rem; font-weight: 900; }
  .hb-pcard .hb-sub { font-size: 0.78rem; margin-top: 4px; opacity: 0.7; }
  .hb-tasks  { background: #fff8f0; color: #e65100; }
  .hb-docs   { background: #f0f4ff; color: #3730a3; }
  .hb-money  { background: #f0fdf4; color: #166534; }
  .hb-ai {
    background: #fdf4ff;
    color: #7e22ce;
    grid-column: span 2;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .hb-ai-msg { font-size: 0.85rem; font-weight: 600; opacity: 0.8; flex: 1; }
  .hb-ai-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #A855F7;
    flex-shrink: 0;
    animation: hbPulse 1.5s ease-in-out infinite;
  }
  @keyframes hbPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  /* FEATURES */
  .hb-features {
    padding: 5rem 1.5rem;
    max-width: 1000px;
    margin: 0 auto;
  }
  .hb-section-label {
    text-align: center;
    font-size: 0.8rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #A855F7;
    margin-bottom: 0.75rem;
  }
  .hb-section-title {
    text-align: center;
    font-family: 'Sora', sans-serif;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    font-weight: 700;
    margin-bottom: 3rem;
    color: #1a1a2e;
  }
  .hb-features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.25rem;
  }
  .hb-feat {
    background: #fff;
    border-radius: 20px;
    padding: 1.5rem;
    border: 1.5px solid rgba(0,0,0,0.06);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .hb-feat:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.1);
  }
  .hb-feat-icon {
    width: 48px; height: 48px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
  .hb-feat h3 { font-size: 1rem; font-weight: 800; margin-bottom: 0.4rem; color: #1a1a2e; }
  .hb-feat p  { font-size: 0.85rem; color: #6b7280; line-height: 1.6; }
  .hb-icon-tasks  { background: #fff8f0; }
  .hb-icon-docs   { background: #f0f4ff; }
  .hb-icon-cal    { background: #f0fdf4; }
  .hb-icon-fin    { background: #fdf4ff; }
  .hb-icon-ai     { background: #fff0f0; }
  .hb-icon-notify { background: #fffbeb; }

  /* CTA */
  .hb-cta {
    margin: 2rem 1.5rem 5rem;
    background: linear-gradient(135deg, #1a1a2e, #2d1b69);
    border-radius: 28px;
    padding: 4rem 2rem;
    text-align: center;
    color: #fff;
    position: relative;
    overflow: hidden;
  }
  .hb-cta h2 {
    font-family: 'Sora', sans-serif;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .hb-cta p {
    color: rgba(255,255,255,0.7);
    margin-bottom: 2rem;
    font-size: 1rem;
  }
  .hb-cta .hb-btn-primary {
    box-shadow: 0 4px 30px rgba(255,107,107,0.5);
    font-size: 1.05rem;
    padding: 1rem 2.5rem;
  }

  /* FOOTER */
  .hb-footer {
    text-align: center;
    padding: 2rem;
    font-size: 0.85rem;
    color: #6b7280;
    border-top: 1px solid rgba(0,0,0,0.06);
  }
`;

const features = [
  { icon: "📋", bg: "hb-icon-tasks", title: "Tasks & reminders",   desc: "Create tasks with priorities and deadlines. Never forget what matters." },
  { icon: "📄", bg: "hb-icon-docs",  title: "Smart documents",     desc: "Upload bills and contracts. The AI extracts deadlines and key info automatically." },
  { icon: "📅", bg: "hb-icon-cal",   title: "Calendar",            desc: "Daily, weekly and monthly views. See your whole life at a glance." },
  { icon: "💰", bg: "hb-icon-fin",   title: "Finance tracking",    desc: "Track income and expenses by category. Understand where your money goes." },
  { icon: "🤖", bg: "hb-icon-ai",    title: "AI assistant",        desc: "Ask anything about your data. Get summaries, answers and suggestions in seconds." },
  { icon: "🔔", bg: "hb-icon-notify",title: "Smart notifications", desc: "Get notified before deadlines. The app watches your schedule so you don't have to." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const goToSignup = () => navigate({ to: "/sign-up" });
  const goToSignin = () => navigate({ to: "/sign-in" });
  const scrollToFeatures = () => featuresRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="hb-root">
      {/* NAV */}
      <nav className="hb-nav">
        <span className="hb-logo">Personal Manager</span>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button className="hb-btn-secondary" style={{ padding: "0.45rem 1.1rem", fontSize: "0.9rem" }} onClick={goToSignin}>Sign in</button>
          <button className="hb-nav-btn" onClick={goToSignup}>Get started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hb-hero">
        <div className="hb-blob hb-blob1" />
        <div className="hb-blob hb-blob2" />
        <div className="hb-blob hb-blob3" />

        <span className="hb-hero-tag">Your personal life assistant</span>

        <h1>
          Organize your life,<br />
          <span className="hb-gradient-text">all in one place</span>
        </h1>

        <p>
          Manage your documents, tasks, finances, and calendar — with an AI
          assistant that actually understands your life.
        </p>

        <div className="hb-hero-btns">
          <button className="hb-btn-primary" onClick={goToSignup}>Start for free</button>
          <button className="hb-btn-secondary" onClick={scrollToFeatures}>See what's inside</button>
        </div>

        {/* DASHBOARD PREVIEW */}
        <div className="hb-preview">
          <div className="hb-preview-bar">
            <div className="hb-dot hb-d1" />
            <div className="hb-dot hb-d2" />
            <div className="hb-dot hb-d3" />
          </div>
          <div className="hb-preview-grid">
            <div className="hb-pcard hb-tasks">
              <h4>Tasks today</h4>
              <div className="hb-big">5</div>
              <div className="hb-sub">3 completed</div>
            </div>
            <div className="hb-pcard hb-docs">
              <h4>Documents</h4>
              <div className="hb-big">12</div>
              <div className="hb-sub">2 deadlines soon</div>
            </div>
            <div className="hb-pcard hb-money">
              <h4>Balance</h4>
              <div className="hb-big">€1,240</div>
              <div className="hb-sub">This month</div>
            </div>
            <div className="hb-pcard hb-ai">
              <div className="hb-ai-dot" />
              <div className="hb-ai-msg">
                "You have an electricity bill due in 3 days — €87.50"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="hb-features" ref={featuresRef}>
        <div className="hb-section-label">Everything you need</div>
        <div className="hb-section-title">Built for real life</div>
        <div className="hb-features-grid">
          {features.map((f) => (
            <div className="hb-feat" key={f.title}>
              <div className={`hb-feat-icon ${f.bg}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="hb-cta">
        <h2>Ready to take control?</h2>
        <p>Join HomeBase and stop juggling between apps.</p>
        <button className="hb-btn-primary" onClick={goToSignup}>
          Create your account →
        </button>
      </div>

      {/* FOOTER */}
      <footer className="hb-footer">
        © 2026 HomeBase — Personal Life Planner
      </footer>
    </div>
  );
}