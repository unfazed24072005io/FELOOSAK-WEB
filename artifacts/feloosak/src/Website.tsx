import { useState, useEffect, useRef } from "react";

export default function FelosakWebsite({ onGoToLogin }: { onGoToLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    
    const faders = document.querySelectorAll(".fade-up");
    faders.forEach((el) => observer.observe(el));
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      faders.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const toggleFaq = (index: number) => {
    const answers = document.querySelectorAll(".faq-answer");
    const icons = document.querySelectorAll(".faq-icon");
    
    if (answers[index]?.style.display === "block") {
      answers[index].style.display = "none";
      if (icons[index]) icons[index].textContent = "+";
    } else {
      answers.forEach((ans) => (ans as HTMLElement).style.display = "none");
      icons.forEach((icon) => (icon as HTMLElement).textContent = "+");
      answers[index].style.display = "block";
      if (icons[index]) icons[index].textContent = "−";
    }
  };

  const faqs = [
    { q: "What is Felosak?", a: "Felosak is an AI-powered finance and bookkeeping app built for businesses in Egypt and the UAE. It combines cash tracking, e-invoicing, VAT automation, and AI insights — all in Arabic and English." },
    { q: "Is Felosak compliant with ETA and FTA?", a: "Yes. Felosak supports Egypt's ETA e-invoicing (real-time XML/JSON submission, UUID, QR codes) and UAE's FTA tax invoicing. We're Peppol CTC ready for the UAE's 2026-2027 mandate." },
    { q: "Does it work offline?", a: "Absolutely. Felosak is built offline-first. All your transactions are stored locally on your device. When internet is available, data syncs automatically to the cloud." },
    { q: "How does pricing work?", a: "Felosak is free to start with our Lite plan (unlimited cash book, up to 20 customers, 5 invoices/month). Paid plans start at 49 EGP/month for Egypt and 9 AED/month for UAE." },
  ];

  const features = [
    { icon: "📊", title: "Smart Cash Book", desc: "Track every piaster and fils. AI auto-categorization, voice entry in Arabic, and real-time balance calculations.", color: "#22A06B" },
    { icon: "🧾", title: "E-Invoicing (ETA & FTA)", desc: "Generate compliant e-invoices instantly. Egypt ETA real‑time submission with GS1 codes. UAE FTA tax invoices with TRN — Peppol CTC ready.", color: "#2680EB" },
    { icon: "📈", title: "AI-Powered Insights", desc: "Ask in Arabic or English. \"كام كسبت الشهر ده؟\" — instant answers with variance analysis and anomaly detection.", color: "#8B5CF6" },
    { icon: "💰", title: "Cashflow Forecasting", desc: "See projected cash position for 7, 14, 30, and 90 days. Know when to collect, when to pay, and when to worry.", color: "#E5890A" },
  ];

  const steps = [
    { icon: "🌍", num: "01", title: "Choose Your Region", desc: "Select Egypt or UAE. Felosak auto-configures VAT rates, tax rules, e-invoicing format." },
    { icon: "✍️", num: "02", title: "Add Your First Entry", desc: "Cash in or out — takes 3 seconds. Use voice, type, or scan receipt. Works offline." },
    { icon: "🤖", num: "03", title: "Get AI Insights", desc: "Ask Felosak anything about your money. Generate reports, track customers." },
    { icon: "✅", num: "04", title: "Stay Compliant", desc: "Auto-generate ETA/FTA compliant invoices, track VAT returns, estimate corporate tax." },
  ];

  const testimonials = [
    { stars: 5, text: "Finally an app that speaks Egyptian Arabic and understands my business. I track every transaction in seconds — even when my internet is down.", name: "Ahmed El-Masry", role: "Shop Owner, Cairo", avatar: "أ" },
    { stars: 5, text: "The VAT calculation saved me hours every quarter. And the e-invoicing is ready for when UAE makes it mandatory. Very impressed.", name: "Fatima Al-Hashimi", role: "Freelancer, Dubai", avatar: "ف" },
    { stars: 5, text: "Managing 4 branches used to be a nightmare. Now I see everything in one dashboard. The AI insights caught a supplier overcharge I would've missed.", name: "Omar Saeed", role: "Restaurant Chain, Alexandria", avatar: "ع" },
  ];

  const teamMembers = [
    { name: "Youssef Ayman", role: "CEO & Founder", bio: "Former fintech executive with 10+ years in MENA banking", avatar: "ي" },
    { name: "Mariam Khaled", role: "CTO", bio: "Ex-Google engineer passionate about AI and offline-first architecture", avatar: "م" },
    { name: "Omar Farouk", role: "Head of Product", bio: "Product leader who built finance tools used by millions", avatar: "ع" },
    { name: "Nadia El-Sayed", role: "Head of Compliance", bio: "Former ETA advisor with deep expertise in tax regulations", avatar: "ن" },
  ];

  const values = [
    { icon: "🎯", title: "Built for MENA", desc: "Every feature designed specifically for Egyptian and UAE businesses — not adapted from Western tools." },
    { icon: "🔒", title: "Privacy First", desc: "Your financial data belongs to you. We never sell or share your information." },
    { icon: "⚡", title: "Offline-First", desc: "Work anywhere, anytime. No internet? No problem. Syncs when you're back online." },
    { icon: "🌍", title: "Arabic-Native", desc: "Full Arabic support with local dialects. Your money, in your language." },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: "#1A1A1A", background: "#FAFAF7", overflowX: "hidden" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: #C8A63040; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .marquee-track { display: flex; animation: marquee 25s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .glow { box-shadow: 0 0 60px rgba(200,166,48,0.15), 0 0 120px rgba(200,166,48,0.05); }
        .card-hover { transition: all 0.35s cubic-bezier(0.16,1,0.3,1); }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
         /* Mobile responsive for hero section - text above image */
@media (max-width: 768px) {
  /* Hero section - stack vertically */
  section:first-of-type > div:first-child {
    grid-template-columns: 1fr !important;
    gap: 32px !important;
  }
@media (max-width: 768px) {
  .fade-up > div:last-child {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 10px !important;
  }
  
  .fade-up > div:last-child > div {
    flex-shrink: 0 !important;
  }
}
/* Mobile - badges in single row with horizontal scroll */
@media (max-width: 768px) {
  .badges-container {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    justify-content: flex-start !important;
    gap: 12px !important;
    padding-bottom: 8px !important;
    -webkit-overflow-scrolling: touch !important;
  }
  
  .badges-container > div {
    flex-shrink: 0 !important;
  }
  
  /* Hide scrollbar for cleaner look */
  .badges-container::-webkit-scrollbar {
    display: none !important;
  }
  .badges-container {
    scrollbar-width: none !important;
  }
}
/* Make badges scroll horizontally on mobile */
@media (max-width: 768px) {
  section:nth-child(2) .fade-up > div {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    gap: 12px !important;
    justify-content: flex-start !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }
  
  section:nth-child(2) .fade-up > div::-webkit-scrollbar {
    display: none !important;
  }
  
  section:nth-child(2) .fade-up > div > div {
    flex-shrink: 0 !important;
  }
}
/* Hide Product, Company, Legal sections on mobile */
@media (max-width: 768px) {
  .footer-grid > div:not(:first-child) {
    display: none !important;
  }
}
/* Fix uneven height for Mission & Vision cards on mobile */
@media (max-width: 768px) {
  /* Mission & Vision container - stack vertically */
  #about > div > div:nth-child(3) {
    display: flex !important;
    flex-direction: column !important;
    gap: 20px !important;
  }
  
  /* Make both cards same height on mobile */
  #about > div > div:nth-child(3) > div {
    height: auto !important;
    min-height: 220px !important;
    padding: 32px 24px !important;
  }
  
  /* Ensure text fits properly */
  #about > div > div:nth-child(3) p {
    font-size: 14px !important;
    line-height: 1.5 !important;
  }
  
  #about > div > div:nth-child(3) h3 {
    font-size: 20px !important;
    margin-bottom: 12px !important;
  }
}

/* For very small mobile devices */
@media (max-width: 480px) {
  #about > div > div:nth-child(3) > div {
    min-height: auto !important;
    padding: 24px 20px !important;
  }
}
  /* Mobile responsive for hero section - text above image */
@media (max-width: 768px) {
  /* Target the hero section grid */
  section:first-of-type .fade-up {
    display: flex !important;
    flex-direction: column !important;
    gap: 32px !important;
  }
  
  /* Text column - on top */
  section:first-of-type .fade-up > div:first-child {
    order: 0 !important;
    text-align: center !important;
    width: 100% !important;
  }
  
  /* Image column - below text */
  section:first-of-type .fade-up > div:last-child {
    order: 1 !important;
    justify-content: center !important;
    width: 100% !important;
    display: flex !important;
  }
  
  /* Center the badge */
  section:first-of-type .fade-up > div:first-child > div:first-child {
    margin-left: auto !important;
    margin-right: auto !important;
  }
  
  /* Full width paragraph */
  section:first-of-type .fade-up p {
    max-width: 100% !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
  
  /* Center buttons */
  section:first-of-type .fade-up > div:first-child > div:last-child {
    justify-content: center !important;
  }
  
  /* Smaller image on mobile */
  section:first-of-type img {
    max-width: 280px !important;
  }
  
  /* Adjust hero padding on mobile */
  section:first-of-type {
    padding: 120px 20px 60px !important;
  }
}
/* Mobile Menu Styles */
.mobile-menu {
  display: block !important;
}

.mobile-menu.open {
  transform: translateX(0) !important;
}

@media (min-width: 769px) {
  .mobile-menu {
    display: none !important;
  }
}
/* Force badges into single horizontal line on mobile */
@media (max-width: 768px) {
  .badges-container {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    justify-content: flex-start !important;
    gap: 16px !important;
    padding: 0 20px 8px 20px !important;
    margin-top: 50px !important;
    margin-bottom: 56px !important;
    -webkit-overflow-scrolling: touch !important;
  }
  
  .badges-container > div {
    flex-shrink: 0 !important;
  }
  
  .badges-container span {
    white-space: nowrap !important;
  }
}
/* Force mobile stacking for hero section */
@media (max-width: 768px) {
  section:first-of-type .fade-up {
    display: flex !important;
    flex-direction: column !important;
    grid-template-columns: unset !important;
  }
}
  /* Left column (text) - on top */
  section:first-of-type > div:first-child > div:first-child {
    order: 0 !important;
    text-align: center !important;
  }
  
  /* Right column (image) - below text */
  section:first-of-type > div:first-child > div:last-child {
    order: 1 !important;
    justify-content: center !important;
  }
  
  /* Center the badge */
  section:first-of-type > div:first-child > div:first-child > div:first-child {
    margin-left: auto !important;
    margin-right: auto !important;
  }
  
  /* Full width paragraph */
  section:first-of-type p {
    max-width: 100% !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
  
  /* Center buttons */
  section:first-of-type > div:first-child > div:first-child > div:last-child {
    justify-content: center !important;
  }
  
  /* Smaller image on mobile */
  section:first-of-type img {
    max-width: 280px !important;
  }
  
  /* Adjust hero padding on mobile */
  section:first-of-type {
    padding: 120px 20px 60px !important;
  }
}
/* Force badges into single horizontal line on mobile */
@media (max-width: 768px) {
  .badges-container {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    justify-content: flex-start !important;
    gap: 16px !important;
    padding: 0 20px 8px 20px !important;
    margin-bottom: 56px !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: thin !important;
  }
  
  /* Make each badge item not wrap */
  .badges-container > div {
    flex-shrink: 0 !important;
    white-space: nowrap !important;
  }
  
  /* Optional: style the scrollbar */
  .badges-container::-webkit-scrollbar {
    height: 4px !important;
  }
  
  .badges-container::-webkit-scrollbar-track {
    background: #f1f1f1 !important;
    border-radius: 10px !important;
  }
  
  .badges-container::-webkit-scrollbar-thumb {
    background: #C8A630 !important;
    border-radius: 10px !important;
  }
}
/* Mobile responsive for About Us section */
@media (max-width: 768px) {
  /* Make the split layout stack vertically */
  .about-split {
    display: flex !important;
    flex-direction: column !important;
    gap: 40px !important;
  }
  
  /* Text column (golden ticks) - on top */
  .about-split > div:first-child {
    order: 0 !important;
    width: 100% !important;
  }
  
  /* Image column - below text */
  .about-split > div:last-child {
    order: 1 !important;
    justify-content: center !important;
    width: 100% !important;
  }
  
  /* Center the golden tick items on mobile */
  .about-split > div:first-child > div {
    text-align: center !important;
  }
  
  /* Center the tick icon and text */
  .about-split > div:first-child > div > div:first-child {
    justify-content: center !important;
  }
  
  /* Remove left margin from paragraph on mobile */
  .about-split p {
    margin-left: 0 !important;
    text-align: center !important;
  }
  
  /* Image size adjustment */
  .about-split img {
    max-width: 280px !important;
    margin: 0 auto !important;
  }
}
/* Desktop default - wrap badges */
.badges-container {
  flex-wrap: wrap;
}

/* Mobile - single line with scroll */
@media (max-width: 768px) {
  .badges-container {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    justify-content: flex-start !important;
    gap: 16px !important;
    padding-bottom: 8px !important;
  }
  
  .badges-container > div {
    flex-shrink: 0 !important;
  }
  
  .badges-container span {
    white-space: nowrap !important;
  }
  
  /* Optional: style scrollbar */
  .badges-container::-webkit-scrollbar {
    height: 4px;
  }
  
  .badges-container::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 10px;
  }
  
  .badges-container::-webkit-scrollbar-thumb {
    background: #C8A630;
    border-radius: 10px;
  }
}
/* Mobile responsive for About Us section */
@media (max-width: 768px) {
  /* Make the split layout stack vertically */
  #about .fade-up[style*="grid-template-columns"] {
    display: flex !important;
    flex-direction: column !important;
    gap: 40px !important;
  }
  
  /* Text column (golden ticks) - on top */
  #about .fade-up[style*="grid-template-columns"] > div:first-child {
    order: 0 !important;
    width: 100% !important;
  }
  
  /* Image column - below text */
  #about .fade-up[style*="grid-template-columns"] > div:last-child {
    order: 1 !important;
    justify-content: center !important;
    width: 100% !important;
  }
  
  /* Center the golden tick items on mobile */
  #about .fade-up[style*="grid-template-columns"] > div:first-child > div {
    text-align: center !important;
  }
  
  /* Center the tick icon and text */
  #about .fade-up[style*="grid-template-columns"] > div:first-child > div > div:first-child {
    justify-content: center !important;
  }
  
  /* Remove left margin from paragraph on mobile */
  #about .fade-up[style*="grid-template-columns"] p {
    margin-left: 0 !important;
    text-align: center !important;
  }
  
  /* Mission & Vision cards - stack vertically */
#about > div > div:nth-child(3) {
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
  margin-left: -11px !important;
  width: calc(100% + 40px) !important;
  padding-right: 20px !important;
}

#about > div > div:nth-child(3) > div {
  width: 100% !important;
  margin-left: 0 !important;
  box-sizing: border-box !important;
}
  
  /* Values grid - single column */
  .values-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
  
  /* Team grid - 2 columns on tablet, 1 on small mobile */
  .team-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 16px !important;
  }
  
  /* Adjust card padding on mobile */
  #about .card-hover {
    padding: 24px 20px !important;
    width: 300px !important;
  }
  
  /* Reduce icon sizes on mobile */
  #about .card-hover div[style*="font-size: 40px"] {
    font-size: 32px !important;
  }
  
  /* Adjust team avatar size on mobile */
  .team-grid .card-hover > div:first-child {
    width: 60px !important;
    height: 60px !important;
    font-size: 24px !important;
  }
  
  /* Section padding */
  #about {
    padding: 60px 20px !important;
  }
  
  /* Heading sizes */
  #about h2 {
    font-size: 28px !important;
  }
  
  #about h3 {
    font-size: 24px !important;
  }
}

/* For very small mobile devices */
@media (max-width: 480px) {
  .team-grid {
    grid-template-columns: 1fr !important;
  }
  
  #about .card-hover {
    padding: 20px 16px !important;
    width: 300px;
  }
}
        .btn-primary {
          background: linear-gradient(135deg, #C8A630 0%, #A68B20 50%, #8B7420 100%);
          color: #fff; border: none; padding: 14px 32px; border-radius: 14px;
          font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s;
          display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
        .btn-outline {
          background: transparent; color: #1A1A1A; border: 2px solid #E0DDD6;
          padding: 12px 28px; border-radius: 14px; font-weight: 600; font-size: 15px;
          cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-flex;
          align-items: center; gap: 6px;
        }
        .btn-outline:hover { border-color: #1A1A1A; background: #1A1A1A; color: #fff; }
        .gradient-text {
          background: linear-gradient(135deg, #C8A630 0%, #A68B20 50%, #8B7420 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-glow {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          filter: blur(120px); opacity: 0.12; pointer-events: none;
        }
        .fade-up { opacity: 0; transform: translateY(30px); transition: all 0.7s cubic-bezier(0.16,1,0.3,1); }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .step-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 20px 30px -12px rgba(0,0,0,0.1); border-color: #E8D8A8; }
        .faq-item { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .faq-item:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -12px rgba(0,0,0,0.12); border-color: #E0D8C8; }
        
        /* ========== COMPLETELY MOBILE RESPONSIVE STYLES ========== */
        /* Hide mobile menu button on desktop */
        .mobile-menu-btn { display: none; }
        .mobile-menu { display: none; }
        
        /* Tablet and mobile styles */
        @media (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
          .team-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
          .values-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
          .testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
          footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        
        @media (max-width: 768px) {
          /* Navigation */
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          
          /* Grid layouts - all to single column */
          .features-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .team-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .values-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .regions-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
          
          /* Hero section */
          .hero-glow { width: 250px !important; height: 250px !important; filter: blur(60px) !important; }
          
          /* Buttons */
          .btn-primary, .btn-outline { padding: 10px 20px !important; font-size: 13px !important; }
          
          /* Footer grid */
          footer > div > div:first-child { grid-template-columns: 1fr !important; gap: 32px !important; text-align: center !important; }
          footer > div > div:first-child > div:first-child { text-align: center !important; margin: 0 auto !important; }
          footer > div > div:first-child > div:first-child p { margin: 0 auto 16px !important; }
          
          /* Footer bottom row */
          footer > div > div:last-child { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          
          /* Stats section */
          .stats-grid > div { padding: 16px !important; }
          .stats-grid > div div:first-child { font-size: 28px !important; }
          
          /* How it works section layout */
          #solutions > div { grid-template-columns: 1fr !important; gap: 32px !important; }
          #solutions img { max-width: 280px !important; margin: 0 auto !important; display: block !important; }
          
          /* FAQ section */
          .faq-item button { padding: 16px 20px !important; }
          .faq-item button span:first-child { font-size: 15px !important; }
          
          /* Cards spacing */
          .card-hover { padding: 20px !important; }
          
          /* Section padding */
          section { padding: 60px 20px !important; }
          #product { padding: 60px 20px !important; }
          #about { padding: 60px 20px !important; }
          #solutions { padding: 60px 20px !important; }
          
          /* Hero section padding */
          section:first-of-type { padding: 120px 20px 60px !important; }
          
          /* Social proof logos */
          section:nth-child(2) > div:first-child { flex-wrap: wrap !important; gap: 30px !important; }
          section:nth-child(2) img { height: 40px !important; }
          
          /* Badges row */
          
          
          /* Mission/Vision cards */
          #about > div > div:nth-child(3) { grid-template-columns: 1fr !important; gap: 20px !important;}
          
          /* CTA buttons */
          .fade-up > div:last-child { flex-direction: row !important; align-items: center !important; gap: 12px !important; }
          
          /* Trust badge row */
          #product > div:first-child > div:first-child { margin-bottom: 16px !important; }
          
          /* Footer links */
          footer a { font-size: 13px !important; margin-bottom: 8px !important; }
          footer h4 { margin-bottom: 12px !important; }
        }
        
        /* Small mobile devices (up to 480px) */
        @media (max-width: 480px) {
          .stats-grid { gap: 12px !important; }
          .stats-grid > div div:first-child { font-size: 24px !important; }
          .stats-grid > div div:last-child { font-size: 11px !important; }
          
          h1 { font-size: 32px !important; letter-spacing: -1px !important; }
          h2 { font-size: 28px !important; }
          h3 { font-size: 22px !important; }
          
          .btn-primary, .btn-outline { padding: 10px 18px !important; font-size: 12px !important; }
          
          section { padding: 40px 16px !important; }
          
          .card-hover { padding: 16px !important; }
          .card-hover h3 { font-size: 18px !important; }
          .card-hover p { font-size: 13px !important; }
          
          .step-card { padding: 20px 16px !important; }
          .step-card h4 { font-size: 16px !important; }
          
          .team-grid .card-hover { padding: 20px 16px !important; }
          .team-grid .card-hover > div:first-child { width: 60px !important; height: 60px !important; font-size: 24px !important; margin-bottom: 12px !important; }
          
          .testimonials-grid .card-hover { padding: 20px !important; }
          .testimonials-grid .card-hover p { font-size: 13px !important; }
        }
        
        /* Keep desktop styles untouched for larger screens */
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
/* FINAL: Force single-line badges on mobile */
@media (max-width: 768px) {
  .badges-container {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    white-space: nowrap !important;
    justify-content: flex-start !important;
    gap: 16px !important;
    padding: 0 20px 8px 20px !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .badges-container > div {
    flex-shrink: 0 !important;
  }

  .badges-container span {
    white-space: nowrap !important;
  }

  /* Hide scrollbar */
  .badges-container::-webkit-scrollbar {
    display: none !important;
  }
  .badges-container {
    scrollbar-width: none !important;
  }
}
/* Force badges into single horizontal line on mobile - NO WRAPPING */
@media (max-width: 768px) {
  .badges-container {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    white-space: nowrap !important;
    justify-content: flex-start !important;
    gap: 16px !important;
    padding: 0 20px 12px 20px !important;
    margin-bottom: 56px !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: thin !important;
  }
  
  /* Prevent any badge from wrapping or shrinking */
  .badges-container > div {
    flex-shrink: 0 !important;
    flex-grow: 0 !important;
    white-space: nowrap !important;
  }
  
  .badges-container span {
    white-space: nowrap !important;
  }
  
  /* Style scrollbar (optional but looks professional) */
  .badges-container::-webkit-scrollbar {
    height: 4px !important;
  }
  
  .badges-container::-webkit-scrollbar-track {
    background: #E8E6E1 !important;
    border-radius: 10px !important;
  }
  
  .badges-container::-webkit-scrollbar-thumb {
    background: #C8A630 !important;
    border-radius: 10px !important;
  }
}
      `}
</style>

      {/* Navbar - exactly as original with mobile menu button */}
      <nav
        id="navbar"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? "rgba(250,250,247,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid #E8E6E1" : "none",
          transition: "all 0.3s", padding: scrolled ? "12px 0" : "20px 0"
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-1.5px", color: "#1A1A1A" }}>felosak</span>
          </div>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#product" style={{ textDecoration: "none", color: "#6B6560", fontSize: 14, fontWeight: 500 }}>Product</a>
            <a href="#solutions" style={{ textDecoration: "none", color: "#6B6560", fontSize: 14, fontWeight: 500 }}>Solutions</a>
            <a href="#pricing" style={{ textDecoration: "none", color: "#6B6560", fontSize: 14, fontWeight: 500 }}>Pricing</a>
            <a href="#about" style={{ textDecoration: "none", color: "#6B6560", fontSize: 14, fontWeight: 500 }}>About</a>
            <button onClick={onGoToLogin} style={{ background: "none", border: "2px solid #E0DDD6", padding: "8px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1A1A1A" }}>Sign In</button>
            <button onClick={onGoToLogin} className="btn-primary" style={{ padding: "10px 24px", fontSize: 13 }}>Get Started Free</button>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="mobile-menu-btn" style={{ background: "none", border: "none", fontSize: 28, cursor: "pointer", color: "#1A1A1A" }}>☰</button>
        </div>
      </nav>

      {/* Mobile Menu - slide-in panel */}
      {/* Mobile Menu - slide-in panel */}
<div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`} style={{ 
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
  background: "white", zIndex: 200, padding: "80px 24px 24px", 
  transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)", 
  transition: "transform 0.3s ease", overflowY: "auto" 
}}>
        <button onClick={() => setMobileMenuOpen(false)} style={{ 
          position: "absolute", top: 20, right: 20, background: "none", 
          border: "none", fontSize: 32, cursor: "pointer", color: "#1A1A1A" 
        }}>×</button>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <a href="#product" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 18, fontWeight: 600, textDecoration: "none", color: "#1A1A1A", padding: "8px 0" }}>Product</a>
          <a href="#solutions" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 18, fontWeight: 600, textDecoration: "none", color: "#1A1A1A", padding: "8px 0" }}>Solutions</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 18, fontWeight: 600, textDecoration: "none", color: "#1A1A1A", padding: "8px 0" }}>Pricing</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 18, fontWeight: 600, textDecoration: "none", color: "#1A1A1A", padding: "8px 0" }}>About</a>
          <hr style={{ margin: "8px 0", borderColor: "#E8E6E1" }} />
          <button onClick={() => { onGoToLogin(); setMobileMenuOpen(false); }} style={{ 
            marginTop: 20, background: "none", border: "2px solid #E0DDD6", 
            padding: "12px", borderRadius: 12, fontSize: 16, fontWeight: 600, 
            cursor: "pointer", color: "#1A1A1A" 
          }}>Sign In</button>
          <button onClick={() => { onGoToLogin(); setMobileMenuOpen(false); }} 
            className="btn-primary" style={{ padding: "12px", fontSize: 16, justifyContent: "center" }}
          >Get Started Free</button>
        </div>
      </div>

            {/* Hero Section - Split Layout */}
      <section style={{ position: "relative", padding: "160px 24px 100px", maxWidth: 1200, margin: "0 auto", overflow: "hidden" }}>
        <div className="hero-glow" style={{ top: -200, left: "10%", background: "#C8A630" }} />
        <div className="hero-glow" style={{ top: -100, right: "5%", background: "#2680EB" }} />

        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          {/* Left Column - Text Content */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F0EDE8", borderRadius: 100, padding: "8px 20px", marginBottom: 28 }}>
              <span style={{ fontSize: 12 }}>🇪🇬</span>
              <span style={{ fontSize: 12 }}>🇦🇪</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6B6560" }}>Now live in Egypt & UAE</span>
            </div>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-2px", marginBottom: 24, color: "#1A1A1A" }}>
              Your money, <span className="gradient-text">finally understood</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.5vw, 18px)", lineHeight: 1.6, color: "#6B6560", marginBottom: 32, maxWidth: "90%" }}>
              AI-powered cash tracking, e-invoicing, and tax compliance for every business in Egypt and the UAE. Arabic-native. Offline-first. Beautifully simple.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button onClick={onGoToLogin} className="btn-primary">Get Started — It's Free</button>
              <a href="#product" className="btn-outline">See How It Works →</a>
            </div>
          </div>

          {/* Right Column - Image */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <img 
              src="https://i.ibb.co/CpwJc1Gr/1.jpg" 
              alt="Felosak Dashboard Preview" 
              style={{ maxWidth: "100%", height: "auto", borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
<section style={{ padding: "40px 0", overflow: "hidden", marginTop: -100 }}>
  <p style={{ textAlign: "center", fontSize: 13, fontWeight: 500, color: "#9C9590", marginBottom: 24, letterSpacing: 1, textTransform: "uppercase" }}>
    Trusted by over <span style={{ color: "#C8A630" }}>10,000</span> businesses
  </p>
  
  <div className="fade-up">
    <div className="badges-row" style={{ display: "flex", marginTop: 50, justifyContent: "center", gap: 20, marginBottom: 56 }}>
      {["ETA Compliant", "FTA Ready", "Offline-First", "Arabic-Native", "SOC-2 Security"].map(badge => (
        <div key={badge} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#22A06B" fillOpacity="0.12" />
            <path d="M6 10.5L8.5 13L14 7.5" stroke="#22A06B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#6B6560", whiteSpace: "nowrap" }}>{badge}</span>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Stats Section */}
      <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          <div className="fade-up" style={{ textAlign: "center", padding: 32 }}><div style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 900 }}>50K+</div><div style={{ fontSize: 14, color: "#9C9590" }}>Active Businesses</div></div>
          <div className="fade-up" style={{ textAlign: "center", padding: 32 }}><div style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 900 }}>2M+</div><div style={{ fontSize: 14, color: "#9C9590" }}>Transactions Tracked</div></div>
          <div className="fade-up" style={{ textAlign: "center", padding: 32 }}><div style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 900 }}>99.9%</div><div style={{ fontSize: 14, color: "#9C9590" }}>Uptime</div></div>
          <div className="fade-up" style={{ textAlign: "center", padding: 32 }}><div style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 900 }}>4.8★</div><div style={{ fontSize: 14, color: "#9C9590" }}>App Store Rating</div></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="product" style={{ padding: "80px 24px", maxWidth: 1400, margin: "0 auto", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", borderRadius: 32 }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-block", background: "#C8A63012", borderRadius: 100, padding: "6px 18px", fontSize: 13, fontWeight: 700, color: "#C8A630", letterSpacing: 0.3, marginBottom: 24 }}>Trusted by over 10,000 businesses across Egypt & UAE</div>
          <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: "-2px", marginBottom: 20, color: "#1A1A1A" }}>Smart Finances For Growing Businesses</h2>
          <p style={{ fontSize: 18, color: "#2C2C2C", maxWidth: 680, margin: "0 auto", lineHeight: 1.4 }}>All-in-one finance platform for cash tracking, e-invoicing, and full tax compliance across Egypt and UAE</p>
        </div>

        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 24, padding: "28px 24px", border: "1px solid #E8E6E1", boxShadow: "0 8px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, background: `${f.color}10`, marginBottom: 24 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: "#111" }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "#5A5550" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 56 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#C8A630", letterSpacing: 0.3, marginBottom: 20 }}>15 day free trial. No credit card required</p>
          <button onClick={onGoToLogin} className="btn-primary">Get Started Free →</button>
        </div>
      </section>

      {/* About Us Section - Split Layout with Golden Ticks */}
      <section id="about" style={{ padding: "100px 24px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Section Title */}
          <div className="fade-up" style={{ textAlign: "left", marginBottom: 56 }}>
  <div style={{ display: "inline-block", background: "#C8A63012", borderRadius: 100, padding: "6px 18px", fontSize: 13, fontWeight: 700, color: "#C8A630", letterSpacing: 0.3, marginBottom: 20 }}>About Us</div>
  <h2 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px", color: "#1A1A1A", marginBottom: 16 }}>
    Start Managing Finances The <span className="gradient-text">SMART Way</span>
  </h2>
  <p style={{ fontSize: 18, color: "#6B6560", maxWidth: "100%", lineHeight: 1.6, marginBottom: 40 }}>
    Felosak is a next-generation financial intelligence platform built specifically for businesses across Egypt 🇪🇬 and UAE 🇦🇪.
  </p>
</div>

          {/* Split Layout: Left Content + Right Image */}
          <div className="fade-up about-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", marginBottom: 80 }}>
            {/* Left Column - Golden Tick Points */}
            <div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="14" fill="#C8A630" fillOpacity="0.15" />
                    <path d="M8 14L12 18L20 10" stroke="#C8A630" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 18, fontWeight: 600, color: "#1A1A1A" }}>Simplify Finance</span>
                </div>
                <p style={{ fontSize: 15, color: "#6B6560", lineHeight: 1.6, marginLeft: 40 }}>Automated bookkeeping, smart categorization, and real-time insights that make complex financial management effortless.</p>
              </div>

              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="14" fill="#C8A630" fillOpacity="0.15" />
                    <path d="M8 14L12 18L20 10" stroke="#C8A630" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 18, fontWeight: 600, color: "#1A1A1A" }}>Eliminate Complexity</span>
                </div>
                <p style={{ fontSize: 15, color: "#6B6560", lineHeight: 1.6, marginLeft: 40 }}>Say goodbye to spreadsheets and manual entry. Our intuitive platform handles VAT, e-invoicing, and compliance automatically.</p>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="14" fill="#C8A630" fillOpacity="0.15" />
                    <path d="M8 14L12 18L20 10" stroke="#C8A630" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 18, fontWeight: 600, color: "#1A1A1A" }}>Gain Total Clarity</span>
                </div>
                <p style={{ fontSize: 15, color: "#6B6560", lineHeight: 1.6, marginLeft: 40 }}>Real-time dashboards, AI-powered insights, and complete visibility into your cash flow, receivables, and financial health.</p>
              </div>
            </div>

            {/* Right Column - Image */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <img 
                src="https://i.ibb.co/fGP2fVcT/2.jpg" 
                alt="Felosak Dashboard" 
                style={{ maxWidth: "100%", height: "auto", borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          </div>

          {/* Keep the rest of the About Us content (Mission, Vision, Values, Team) exactly as before */}
          {/* Mission & Vision - Desktop unchanged */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 80 }}>
            <div className="card-hover" style={{ background: "#FAFAF7", borderRadius: 24, padding: "40px 32px", height:"280px",border: "1px solid #E8E6E1", textAlign: "center" }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: "#1A1A1A" }}>Our Mission</h3>
              <p style={{ fontSize: 15, color: "#6B6560", lineHeight: 1.6 }}>To democratize financial intelligence for every business in the MENA region, making complex compliance and cash management effortless.</p>
            </div>
            <div className="card-hover" style={{ background: "#FAFAF7", borderRadius: 24, padding: "40px 32px", border: "1px solid #E8E6E1", textAlign: "center" }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: "#1A1A1A" }}>Our Vision</h3>
              <p style={{ fontSize: 15, color: "#6B6560", lineHeight: 1.6 }}>To become the most trusted financial operating system for MENA businesses, powering millions of entrepreneurs across the region.</p>
            </div>
          </div>

          {/* Values Section - Keep as is */}
          <div className="fade-up" style={{ marginBottom: 80 }}>
            <h3 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 48, color: "#1A1A1A" }}>What Drives Us</h3>
            <div className="values-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {values.map((v, i) => (
                <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", border: "1px solid #E8E6E1", textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{v.icon}</div>
                  <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: "#C8A630" }}>{v.title}</h4>
                  <p style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.5 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section - Keep as is */}
          <div className="fade-up">
            <h3 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 16, color: "#1A1A1A" }}>Meet the Team</h3>
            <p style={{ textAlign: "center", fontSize: 16, color: "#6B6560", marginBottom: 48 }}>Passionate builders committed to your financial success</p>
            <div className="team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {teamMembers.map((m, i) => (
                <div key={i} className="card-hover" style={{ background: "#FAFAF7", borderRadius: 20, padding: "32px 24px", border: "1px solid #E8E6E1", textAlign: "center" }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #C8A630, #E8C840)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#1A1510", margin: "0 auto 20px" }}>{m.avatar}</div>
                  <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: "#1A1A1A" }}>{m.name}</h4>
                  <p style={{ fontSize: 13, color: "#C8A630", fontWeight: 600, marginBottom: 12 }}>{m.role}</p>
                  <p style={{ fontSize: 13, color: "#6B6560", lineHeight: 1.5 }}>{m.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Region Section */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-block", background: "#22A06B12", borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#22A06B" }}>Region-Specific Compliance</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-1.5px" }}>Built for MENA tax law,<br />not adapted from Western tools</h2>
          </div>
          <div className="regions-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="card-hover" style={{ background: "#FAFAF7", borderRadius: 24, padding: "36px 32px", border: "1px solid #E8E6E1" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🇪🇬</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Egypt</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["VAT 14% auto-calculation", "ETA e-invoicing (real-time XML/JSON)", "GS1 product codes & UUID + QR", "22.5% corporate tax estimation", "Fawry, Vodafone Cash, InstaPay"].map(item => (
                  <div key={item} style={{ display: "flex", gap: 10 }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#22A06B" fillOpacity="0.12"/><path d="M6 10.5L8.5 13L14 7.5" stroke="#22A06B" strokeWidth="2"/></svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-hover" style={{ background: "#FAFAF7", borderRadius: 24, padding: "36px 32px", border: "1px solid #E8E6E1" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🇦🇪</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>UAE</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["VAT 5% with zero-rate & exempt handling", "FTA tax invoices — Peppol CTC ready", "CT: 0% up to AED 375K, then 9%", "Free Zone qualifying income tracking", "Apple Pay, Tabby, Tamara, PayTabs"].map(item => (
                  <div key={item} style={{ display: "flex", gap: 10 }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#22A06B" fillOpacity="0.12"/><path d="M6 10.5L8.5 13L14 7.5" stroke="#22A06B" strokeWidth="2"/></svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="solutions" style={{ padding: "100px 24px", maxWidth: 1400, margin: "0 auto", background: "#FFFFFF", borderRadius: 48 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div className="fade-up" style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ display: "inline-block", background: "#C8A63012", borderRadius: 100, padding: "6px 18px", fontSize: 13, fontWeight: 700, color: "#C8A630", letterSpacing: 0.3 }}>How It Works</div>
              <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-1.5px", marginTop: 20, color: "#1A1A1A" }}>Up and running <span style={{ color: "#C8A630" }}>in 2 minutes</span></h2>
            </div>
            <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {steps.map((s, i) => (
                <div key={i} className="step-card" style={{ background: "#fff", borderRadius: 24, padding: "32px 24px", border: "1px solid #F0E5C8", textAlign: "center", position: "relative", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: 44, marginBottom: 16 }}>{s.icon}</div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: "#F5EDD6", position: "absolute", top: 16, right: 20, lineHeight: 1 }}>{s.num}</div>
                  <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: "#1A1A1A" }}>{s.title}</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6B6560" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", alignSelf: "center" }}>
            <img src="https://i.ibb.co/tTH1hP5q/Whats-App-Image-2026-04-13-at-1-33-50-PM.jpg" alt="Felosak Dashboard Preview" style={{ maxWidth: 380, width: "100%", height: "auto", borderRadius: 28 }} />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-block", background: "#F59E0B12", borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#F59E0B" }}>Customer Stories</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900 }}>Loved across MENA</h2>
          </div>
          <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card-hover" style={{ background: "#FAFAF7", borderRadius: 20, padding: 32, border: "1px solid #E8E6E1" }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>{"⭐".repeat(t.stars)}</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "#4A4540", marginBottom: 24, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #C8A630, #E8C840)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#1A1510" }}>{t.avatar}</div>
                  <div><div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div><div style={{ fontSize: 12, color: "#9C9590" }}>{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="pricing" style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto", background: "#FCFAF7", borderRadius: 48 }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", background: "#C8A63012", borderRadius: 100, padding: "6px 18px", fontSize: 13, fontWeight: 700, color: "#C8A630", letterSpacing: 0.3, marginBottom: 20 }}>FAQ</div>
          <h2 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px", color: "#1A1A1A" }}>Questions? <span style={{ color: "#C8A630" }}>Answers.</span></h2>
          <p style={{ fontSize: 16, color: "#6B6560", marginTop: 16 }}>Everything you need to know about Felosak</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item fade-up" style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8E6E1", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <button onClick={() => toggleFaq(i)} style={{ width: "100%", padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", borderRadius: 20 }}>
                <span style={{ fontWeight: 800, fontSize: 17, color: "#1A1A1A" }}>{faq.q}</span>
                <span className="faq-icon" style={{ fontSize: 24, fontWeight: 300, color: "#C8A630", transition: "transform 0.2s ease" }}>+</span>
              </button>
              <div className="faq-answer" style={{ display: "none", padding: "0 28px 24px 28px", fontSize: 15, lineHeight: 1.6, color: "#5A5550", borderTop: "1px solid #F0EDE8" }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48, paddingTop: 24 }}>
          <p style={{ fontSize: 14, color: "#6B6560" }}>Still have questions?</p>
          <a href="#" style={{ display: "inline-block", marginTop: 12, color: "#C8A630", fontWeight: 700, textDecoration: "none", borderBottom: "2px solid #C8A63040" }}>Contact our team →</a>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <div className="fade-up" style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, marginBottom: 20 }}>Ready to understand<br />your money?</h2>
          <p style={{ fontSize: 17, color: "#6B6560", marginBottom: 36 }}>Join thousands of businesses across Egypt and UAE using Felosak to track, analyze, and grow their finances.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            <button onClick={onGoToLogin} className="btn-primary" style={{ fontSize: 16, padding: "16px 36px" }}>Get Started — Free</button>
            <a href="#" className="btn-outline" style={{ fontSize: 16, padding: "14px 32px" }}>Contact Sales</a>
          </div>
        </div>
      </section>

      <footer style={{ padding: "60px 24px 32px", background: "#1A1A1A", color: "#9C9590" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 12 }}>felosak</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>AI-powered finance intelligence for every MENA business. Arabic-native. Offline-first.</p>
              <div style={{ display: "flex", gap: 8, margin: "16px 0" }}><span>🇪🇬</span><span>🇦🇪</span></div>
              <div style={{ fontSize: 13 }}><a href="mailto:support@felosak.com" style={{ color: "#C8A630", textDecoration: "none" }}>support@felosak.com</a></div>
            </div>
            <div><h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Product</h4><a href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none", marginBottom: 10 }}>Cash Book</a><a href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none", marginBottom: 10 }}>E-Invoicing</a><a href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none", marginBottom: 10 }}>AI Insights</a><a href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none" }}>Tax Engine</a></div>
            <div><h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Company</h4><a href="#about" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none", marginBottom: 10 }}>About</a><a href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none", marginBottom: 10 }}>Careers</a><a href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none", marginBottom: 10 }}>Blog</a><a href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none" }}>Contact</a></div>
            <div><h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Legal</h4><a href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none", marginBottom: 10 }}>Privacy Policy</a><a href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none", marginBottom: 10 }}>Terms of Service</a><a href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none", marginBottom: 10 }}>Cookie Policy</a><a href="#" style={{ display: "block", fontSize: 14, color: "#6B6560", textDecoration: "none" }}>Security</a></div>
          </div>
          <div style={{ borderTop: "1px solid #333", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <p style={{ fontSize: 12 }}>© 2026 Felosak. Built by Aura Tech Labs. All rights reserved.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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