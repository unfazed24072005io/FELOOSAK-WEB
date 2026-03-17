import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════
// FELOSAK — www.felosak.com Marketing Website
// Kudwa-inspired • Light Premium • Egypt 🇪🇬 & UAE 🇦🇪
// ═══════════════════════════════════════════════════════════════════════

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const FadeIn = ({ children, delay = 0, className = "", y = 30 }) => {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} className={className}
      style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : `translateY(${y}px)`, transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s` }}>
      {children}
    </div>
  );
};

// ── SVG Icons ──
const CheckSVG = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#22A06B" fillOpacity="0.12"/><path d="M6 10.5L8.5 13L14 7.5" stroke="#22A06B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const StarSVG = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="#F59E0B"><path d="M8 0l2.47 4.94L16 5.76l-4 3.84.94 5.4L8 12.56 3.06 15l.94-5.4-4-3.84 5.53-.82z"/></svg>;

const AppleSVG = () => <svg width="20" height="24" viewBox="0 0 20 24" fill="white"><path d="M16.52 12.62c-.03-2.85 2.33-4.22 2.44-4.29-1.33-1.94-3.4-2.21-4.13-2.24-1.76-.18-3.43 1.03-4.33 1.03-.89 0-2.27-1-3.73-.98-1.92.03-3.69 1.12-4.68 2.84-1.99 3.46-.51 8.59 1.43 11.4.95 1.37 2.08 2.92 3.57 2.86 1.43-.06 1.97-.93 3.7-.93 1.73 0 2.22.93 3.73.9 1.54-.03 2.52-1.4 3.46-2.78 1.09-1.59 1.54-3.13 1.57-3.21-.03-.01-3.01-1.16-3.03-4.6z"/><path d="M13.65 4.15c.79-.96 1.32-2.29 1.18-3.62-1.14.05-2.52.76-3.33 1.71-.73.84-1.37 2.19-1.2 3.48 1.27.1 2.56-.65 3.35-1.57z"/></svg>;

const PlaySVG = () => <svg width="20" height="22" viewBox="0 0 20 22" fill="white"><path d="M1 1.54v18.92c0 .87.96 1.4 1.7.96l15.77-9.46c.72-.43.72-1.49 0-1.92L2.7.58C1.96.14 1 .67 1 1.54z"/></svg>;

export default function FelosakWebsite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const features = [
    { icon: "📊", title: "Smart Cash Book", desc: "Track every piaster and fils. Cash in, cash out — with AI auto-categorization, voice entry in Arabic, and real-time balance calculations.", color: "#22A06B" },
    { icon: "🧾", title: "E-Invoicing (ETA & FTA)", desc: "Generate compliant e-invoices instantly. Egypt ETA real-time submission with GS1 codes. UAE FTA tax invoices with TRN — Peppol CTC ready.", color: "#2680EB" },
    { icon: "📈", title: "AI-Powered Insights", desc: "Ask questions in Arabic or English. \"كام كسبت الشهر ده؟\" — get instant answers with variance analysis and anomaly detection.", color: "#8B5CF6" },
    { icon: "💰", title: "Cashflow Forecasting", desc: "See your projected cash position for the next 7, 14, 30, and 90 days. Know when to collect, when to pay, and when to worry.", color: "#E5890A" },
    { icon: "🧮", title: "VAT & Tax Engine", desc: "Egypt 14% VAT + 22.5% corporate tax. UAE 5% VAT + 9% CT (AED 375K threshold). Automatic calculations, return preparation, and filing reminders.", color: "#E34935" },
    { icon: "👥", title: "Customer Ledger", desc: "Track who owes you, who you owe. Trust scores, WhatsApp reminders, payment history — turn receivables into cash faster.", color: "#C8A630" },
  ];

  const howSteps = [
    { n: "01", title: "Choose Your Region", desc: "Select Egypt or UAE. Felosak auto-configures VAT rates, tax rules, e-invoicing format, and compliance requirements.", icon: "🌍" },
    { n: "02", title: "Add Your First Entry", desc: "Cash in or cash out — it takes 3 seconds. Use voice, type, or scan a receipt. Works offline, syncs when connected.", icon: "✍️" },
    { n: "03", title: "Get AI Insights", desc: "Ask Felosak anything about your money. Generate reports, track customers, forecast cashflow — all in Arabic or English.", icon: "🤖" },
    { n: "04", title: "Stay Compliant", desc: "Auto-generate ETA/FTA compliant invoices, track VAT returns, estimate corporate tax, and never miss a filing deadline.", icon: "✅" },
  ];

  const testimonials = [
    { name: "Ahmed El-Masry", role: "Shop Owner, Cairo", text: "Finally an app that speaks Egyptian Arabic and understands my business. I track every transaction in seconds — even when my internet is down.", stars: 5, avatar: "أ" },
    { name: "Fatima Al-Hashimi", role: "Freelancer, Dubai", text: "The VAT calculation saved me hours every quarter. And the e-invoicing is ready for when UAE makes it mandatory. Very impressed.", stars: 5, avatar: "ف" },
    { name: "Omar Saeed", role: "Restaurant Chain, Alexandria", text: "Managing 4 branches used to be a nightmare. Now I see everything in one dashboard. The AI insights caught a supplier overcharge I would've missed.", stars: 5, avatar: "ع" },
  ];

  const faqs = [
    { q: "What is Felosak?", a: "Felosak is an AI-powered finance and bookkeeping app built for businesses in Egypt and the UAE. It combines cash tracking, e-invoicing, VAT automation, and AI insights — all in Arabic and English." },
    { q: "Is Felosak compliant with ETA and FTA?", a: "Yes. Felosak supports Egypt's ETA e-invoicing (real-time XML/JSON submission, UUID, QR codes, GS1 product codes) and UAE's FTA tax invoicing. We're Peppol CTC ready for the UAE's 2026-2027 mandate." },
    { q: "Does it work offline?", a: "Absolutely. Felosak is built offline-first. All your transactions are stored locally on your device. When internet is available, data syncs automatically to the cloud." },
    { q: "How does pricing work?", a: "Felosak is free to start with our Lite plan (unlimited cash book, up to 20 customers, 5 invoices/month). Paid plans start at 49 EGP/month for Egypt and 9 AED/month for UAE." },
    { q: "What makes Felosak different from QuickBooks or Wafeq?", a: "Felosak is Arabic-native (not translated), offline-first (works without internet), mobile-first (designed for phone), and AI-powered (ask questions in Egyptian Arabic). We're built for the MENA reality — cash-heavy, informal, mobile-dependent." },
    { q: "Can I manage multiple businesses?", a: "Yes! Felosak supports multiple businesses and branches under one account. See consolidated reports or drill down per branch." },
  ];

  const stats = [
    { value: "50K+", label: "Active Businesses" },
    { value: "2M+", label: "Transactions Tracked" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.8★", label: "App Store Rating" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: "#1A1A1A", background: "#FAFAF7", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: #C8A63040; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .marquee-track { display:flex; animation: marquee 25s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .glow { box-shadow: 0 0 60px rgba(200,166,48,0.15), 0 0 120px rgba(200,166,48,0.05); }
        .card-hover { transition: all 0.35s cubic-bezier(0.16,1,0.3,1); }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
        .btn-primary { background: linear-gradient(135deg, #1A1A1A 0%, #333 100%); color: #fff; border: none; padding: 14px 32px; border-radius: 14px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
        .btn-outline { background: transparent; color: #1A1A1A; border: 2px solid #E0DDD6; padding: 12px 28px; border-radius: 14px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; }
        .btn-outline:hover { border-color: #1A1A1A; background: #1A1A1A; color: #fff; }
        .gradient-text { background: linear-gradient(135deg, #C8A630 0%, #A68B20 50%, #8B7420 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; filter: blur(120px); opacity: 0.12; pointer-events: none; }
        input:focus { outline: none; box-shadow: 0 0 0 3px rgba(200,166,48,0.2); }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(250,250,247,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid #E8E6E1" : "none",
        transition: "all 0.3s",
        padding: scrolled ? "12px 0" : "20px 0",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-1.5px", color: "#1A1A1A" }}>felosak</span>
          </div>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["Product", "Solutions", "Pricing", "About"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ textDecoration: "none", color: "#6B6560", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#1A1A1A"} onMouseLeave={e => e.target.style.color = "#6B6560"}>{l}</a>
            ))}
            <a href="#download" className="btn-primary" style={{ padding: "10px 24px", fontSize: 13 }}>Download App</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#1A1A1A" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", padding: "160px 24px 100px", maxWidth: 1200, margin: "0 auto", textAlign: "center", overflow: "hidden" }}>
        <div className="hero-glow" style={{ top: -200, left: "10%", background: "#C8A630" }} />
        <div className="hero-glow" style={{ top: -100, right: "5%", background: "#2680EB" }} />

        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F0EDE8", borderRadius: 100, padding: "8px 20px", marginBottom: 28 }}>
            <span style={{ fontSize: 12 }}>🇪🇬</span>
            <span style={{ fontSize: 12 }}>🇦🇪</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6B6560" }}>Now live in Egypt & UAE</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", maxWidth: 800, margin: "0 auto 24px", color: "#1A1A1A" }}>
            Your money,{" "}
            <span className="gradient-text">finally understood</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p style={{ fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.6, color: "#6B6560", maxWidth: 580, margin: "0 auto 40px", fontWeight: 400 }}>
            AI-powered cash tracking, e-invoicing, and tax compliance for every business in Egypt and the UAE. Arabic-native. Offline-first. Beautifully simple.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
            <a href="#download" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Get Started — It's Free
            </a>
            <a href="#product" className="btn-outline">See How It Works</a>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", marginBottom: 56 }}>
            {["ETA Compliant", "FTA Ready", "Offline-First", "Arabic-Native", "SOC-2 Security"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckSVG />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#6B6560" }}>{t}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Hero Dashboard Mockup */}
        <FadeIn delay={0.5} y={50}>
          <div className="glow" style={{ background: "#fff", borderRadius: 24, padding: 8, maxWidth: 900, margin: "0 auto", border: "1px solid #E8E6E1", boxShadow: "0 40px 100px rgba(0,0,0,0.08)" }}>
            <div style={{ background: "linear-gradient(145deg, #0F2337 0%, #1A3A5C 100%)", borderRadius: 18, padding: "32px 32px 0", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22A06B" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[
                  { l: "Total Balance", v: "EGP 70,050", c: "#C8A630", ch: "+17%" },
                  { l: "Income", v: "EGP 91,500", c: "#22A06B", ch: "+8.9%" },
                  { l: "Expenses", v: "EGP 21,450", c: "#EF4444", ch: "-3.2%" },
                  { l: "Receivable", v: "EGP 49,500", c: "#F59E0B", ch: "4 customers" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 14px", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: 10, color: "#7A8FA3", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.l}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#E8EDF2", marginTop: 6 }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: s.c, fontWeight: 700, marginTop: 4 }}>{s.ch}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 2, background: "rgba(255,255,255,0.04)", borderRadius: "14px 14px 0 0", padding: 16, border: "1px solid rgba(255,255,255,0.06)", borderBottom: "none" }}>
                  <div style={{ fontSize: 9, color: "#7A8FA3", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>AI-GENERATED</div>
                  <div style={{ fontSize: 13, color: "#E8EDF2", fontWeight: 700, marginTop: 4 }}>Analytics Dashboard</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 16, alignItems: "flex-end", height: 80 }}>
                    {[40, 55, 45, 70, 60, 85, 75, 90, 65, 80, 95, 72].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: i % 2 === 0 ? "linear-gradient(180deg, #22A06B, #22A06B60)" : "linear-gradient(180deg, #EF4444, #EF444460)", borderRadius: "4px 4px 0 0", opacity: 0.8 }} />
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: "14px 14px 0 0", padding: 16, border: "1px solid rgba(255,255,255,0.06)", borderBottom: "none" }}>
                  <div style={{ fontSize: 13, color: "#E8EDF2", fontWeight: 700 }}>Top Categories</div>
                  <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#C8A630" strokeWidth="12" strokeDasharray="70 220" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#22A06B" strokeWidth="12" strokeDasharray="50 220" strokeDashoffset="-70" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#2680EB" strokeWidth="12" strokeDasharray="40 220" strokeDashoffset="-120" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#EF4444" strokeWidth="12" strokeDasharray="30 220" strokeDashoffset="-160" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══ SOCIAL PROOF MARQUEE ═══ */}
      <section style={{ padding: "40px 0", borderTop: "1px solid #E8E6E1", borderBottom: "1px solid #E8E6E1", overflow: "hidden", background: "#fff" }}>
        <p style={{ textAlign: "center", fontSize: 13, fontWeight: 500, color: "#9C9590", marginBottom: 24, letterSpacing: 1, textTransform: "uppercase" }}>Trusted by businesses across MENA</p>
        <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
          <div className="marquee-track">
            {[...Array(2)].flatMap((_, r) =>
              ["Carrefour Egypt", "Talabat", "Noon", "Geidea", "Paymob", "Fawry", "Al Tayer", "Landmark Group", "Seoudi Market", "Spinneys", "Aramex", "Fetchr"].map((n, i) => (
                <div key={`${r}-${i}`} style={{ display: "inline-flex", alignItems: "center", padding: "0 40px", fontSize: 18, fontWeight: 700, color: "#D5D0C8", letterSpacing: "-0.5px" }}>
                  {n}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {stats.map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{ textAlign: "center", padding: 32 }}>
                <div style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-2px", color: "#1A1A1A" }}>{s.value}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#9C9590", marginTop: 8 }}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="product" style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "#C8A63012", borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#C8A630", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Product Suite</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 16 }}>Everything your business needs,<br />in one place</h2>
            <p style={{ fontSize: 17, color: "#6B6560", maxWidth: 500, margin: "0 auto" }}>From daily cash tracking to full tax compliance — Felosak grows with your business.</p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="card-hover" style={{ background: "#fff", borderRadius: 20, padding: 32, border: "1px solid #E8E6E1", cursor: "default", height: "100%" }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, background: `${f.color}10`, marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.5px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#6B6560" }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ REGION SECTION ═══ */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ display: "inline-block", background: "#22A06B12", borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#22A06B", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Region-Specific Compliance</div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.1 }}>Built for MENA tax law,<br />not adapted from Western tools</h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              { fl: "🇪🇬", nm: "Egypt", items: ["VAT 14% auto-calculation", "ETA e-invoicing (real-time XML/JSON)", "GS1 product codes & UUID + QR", "22.5% corporate tax estimation", "Withholding tax 5% tracking", "Social insurance: 11% + 18.75%", "7-year invoice archival", "Fawry, Vodafone Cash, InstaPay"] },
              { fl: "🇦🇪", nm: "UAE", items: ["VAT 5% with zero-rate & exempt handling", "FTA tax invoices — Peppol CTC ready", "CT: 0% up to AED 375K, then 9%", "Free Zone qualifying income tracking", "2026 VAT amendments compliance", "Supplier due diligence documentation", "5-year invoice archival", "Apple Pay, Tabby, Tamara, PayTabs"] },
            ].map((r, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="card-hover" style={{ background: "#FAFAF7", borderRadius: 24, padding: "36px 32px", border: "1px solid #E8E6E1", height: "100%" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>{r.fl}</div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, letterSpacing: "-0.5px" }}>{r.nm}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {r.items.map((item, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <CheckSVG />
                        <span style={{ fontSize: 14, color: "#4A4540", lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="solutions" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "#2680EB12", borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#2680EB", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>How It Works</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.1 }}>Up and running in 2 minutes</h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {howSteps.map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{ position: "relative", padding: "32px 24px", borderRadius: 20, background: "#fff", border: "1px solid #E8E6E1", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: "#F0EDE8", position: "absolute", top: 12, right: 16 }}>{s.n}</div>
                <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{s.title}</h4>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#6B6560" }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ display: "inline-block", background: "#F59E0B12", borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Customer Stories</div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px" }}>Loved across MENA</h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div className="card-hover" style={{ background: "#FAFAF7", borderRadius: 20, padding: 32, border: "1px solid #E8E6E1", height: "100%" }}>
                  <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                    {[...Array(t.stars)].map((_, j) => <StarSVG key={j} />)}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "#4A4540", marginBottom: 24, fontStyle: "italic" }}>"{t.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #C8A630, #E8C840)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#1A1510" }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "#9C9590" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DOWNLOAD APPS ═══ */}
      <section id="download" style={{ padding: "100px 24px", background: "linear-gradient(145deg, #1A1A1A 0%, #2A2520 50%, #1A1510 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "#C8A630", opacity: 0.04, filter: "blur(80px)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 60, flexWrap: "wrap" }}>
          <FadeIn>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: "inline-block", background: "#C8A63020", borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#C8A630", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 24 }}>Download Now</div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 20 }}>
                Take Felosak<br />everywhere you go
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "#A89878", marginBottom: 36, maxWidth: 420 }}>
                Track cash, send invoices, and get AI insights — even without internet. Available on iOS, Android, and web.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
                {/* App Store Button */}
                <a href="#" style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 14, padding: "12px 24px", textDecoration: "none", transition: "transform 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="#1A1A1A"><path d="M22.5 17.5c-.5 1.1-1.1 2.1-1.8 3-1 1.3-1.8 1.7-2.8 1.7-.7 0-1.8-.5-3-.5-1.2 0-2.2.5-3 .5-.9 0-1.8-.4-2.7-1.7C7.2 18.2 6 15.2 6 12.4c0-2.6.9-4.3 2.4-5.4.9-.7 2-1.1 3.2-1.1 1 0 2.1.5 2.8.5.7 0 1.9-.6 3.2-.5.8 0 2.2.2 3.2 1.4-2.1 1.3-1.7 4.6.7 5.6-.4 1.2-.9 2.4-1.7 3.4l1.7 1.2zM17.5 4c-1.3.1-2.9 1-3.7 2-.7.9-1.2 2-1 3.2 1.4.1 2.8-.8 3.6-1.9.7-.9 1.2-2.1 1.1-3.3z"/></svg>
                  <div>
                    <div style={{ fontSize: 9, color: "#9C9590", fontWeight: 500 }}>Download on the</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", marginTop: -2 }}>App Store</div>
                  </div>
                </a>
                {/* Google Play Button */}
                <a href="#" style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 14, padding: "12px 24px", textDecoration: "none", transition: "transform 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <svg width="24" height="26" viewBox="0 0 24 26" fill="none"><path d="M1 1.5L14.5 13 1 24.5V1.5z" fill="#4285F4"/><path d="M1 1.5l17 10.5L14.5 13 1 1.5z" fill="#34A853"/><path d="M1 24.5L14.5 13 18 12l5 3-22 9.5z" fill="#FBBC04"/><path d="M23 15L18 12l-3.5 1L1 1.5l22 8.5v5z" fill="#EA4335"/></svg>
                  <div>
                    <div style={{ fontSize: 9, color: "#9C9590", fontWeight: 500 }}>Get it on</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", marginTop: -2 }}>Google Play</div>
                  </div>
                </a>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                {[{ v: "4.8★", l: "App Store" }, { v: "4.7★", l: "Google Play" }, { v: "100K+", l: "Downloads" }].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: "#7A7060" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ flex: 1, minWidth: 300, display: "flex", justifyContent: "center" }}>
              {/* Phone Mockup */}
              <div style={{ width: 260, height: 520, background: "#0F2337", borderRadius: 36, border: "6px solid #333", position: "relative", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}>
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 120, height: 28, background: "#333", borderRadius: "0 0 16px 16px" }} />
                <div style={{ padding: "40px 16px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#E8EDF2" }}>Welcome 🇪🇬</div>
                      <div style={{ fontSize: 9, color: "#7A8FA3" }}>Egypt • VAT 14% • ETA</div>
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #C8A630, #E8C840)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#1A1510" }}>ف</div>
                  </div>
                  {[
                    { l: "Balance", v: "EGP 70,050", c: "#C8A630" },
                    { l: "Cash In", v: "EGP 91,500", c: "#22A06B" },
                    { l: "Cash Out", v: "EGP 21,450", c: "#EF4444" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 9, color: "#7A8FA3", fontWeight: 600 }}>{s.l}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#E8EDF2", marginTop: 2 }}>{s.v}</div>
                      <div style={{ height: 3, borderRadius: 2, background: `${s.c}30`, marginTop: 6 }}>
                        <div style={{ height: "100%", width: `${60 + i * 15}%`, borderRadius: 2, background: s.c }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, background: "rgba(200,166,48,0.08)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(200,166,48,0.15)" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "#C8A630", textTransform: "uppercase" }}>AI Insight</div>
                    <div style={{ fontSize: 10, color: "#E8EDF2", marginTop: 4, lineHeight: 1.5 }}>Profit +17% MoM. Khaled 16 days overdue (EGP 22,000).</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
                    {["📊", "💰", "📄", "⚡", "⚙️"].map((ic, i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 8, background: i === 0 ? "rgba(200,166,48,0.12)" : "transparent", fontSize: 16 }}>{ic}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="pricing" style={{ padding: "100px 24px", maxWidth: 800, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px" }}>Questions? Answers.</h2>
          </div>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faqs.map((f, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E6E1", overflow: "hidden" }}>
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  style={{ width: "100%", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A" }}>{f.q}</span>
                  <span style={{ fontSize: 20, color: "#9C9590", transition: "transform 0.3s", transform: activeFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                <div style={{ maxHeight: activeFaq === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
                  <p style={{ padding: "0 24px 20px", fontSize: 14, lineHeight: 1.7, color: "#6B6560" }}>{f.a}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <FadeIn>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 20 }}>
              Ready to understand<br />your money?
            </h2>
            <p style={{ fontSize: 17, color: "#6B6560", marginBottom: 36 }}>Join thousands of businesses across Egypt and UAE using Felosak to track, analyze, and grow their finances.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
              <a href="#download" className="btn-primary" style={{ fontSize: 16, padding: "16px 36px" }}>Get Started — Free</a>
              <a href="mailto:support@felosak.com" className="btn-outline" style={{ fontSize: 16, padding: "14px 32px" }}>Contact Sales</a>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: "60px 24px 32px", background: "#1A1A1A", color: "#9C9590" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", marginBottom: 12 }}>felosak</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280, marginBottom: 20 }}>AI-powered finance intelligence for every MENA business. Arabic-native. Offline-first.</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🇪🇬</span>
                <span style={{ fontSize: 20 }}>🇦🇪</span>
              </div>
              <div style={{ fontSize: 13, color: "#6B6560" }}>
                <a href="mailto:support@felosak.com" style={{ color: "#C8A630", textDecoration: "none" }}>support@felosak.com</a>
              </div>
            </div>
            {[
              { title: "Product", links: ["Cash Book", "E-Invoicing", "AI Insights", "Tax Engine", "Cashflow", "Reports"] },
              { title: "Company", links: ["About", "Careers", "Blog", "Press", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>{col.title}</h4>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none", marginBottom: 10, transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#6B6560"}>{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #333", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <p style={{ fontSize: 12, color: "#6B6560" }}>© 2026 Felosak. Built by Aura Tech Labs. All rights reserved.</p>
            <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
              <span style={{ padding: "4px 12px", borderRadius: 8, background: "#22A06B15", color: "#22A06B", fontWeight: 600 }}>ETA Compliant</span>
              <span style={{ padding: "4px 12px", borderRadius: 8, background: "#2680EB15", color: "#2680EB", fontWeight: 600 }}>FTA Ready</span>
              <span style={{ padding: "4px 12px", borderRadius: 8, background: "#8B5CF615", color: "#8B5CF6", fontWeight: 600 }}>SOC-2</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
