import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { api } from "./api";

const TK = {
  bg:"#F6F5F0",card:"#FFFFFF",muted:"#FAF9F7",border:"#E8E6E1",borderL:"#F0EDE8",
  text:"#1A1A1A",textS:"#6B6560",textM:"#9C9590",
  accent:"#C8A630",accentBg:"#FEF9E7",accentD:"#A68B20",
  ok:"#22A06B",okBg:"#E6F9F0",
  bad:"#E34935",badBg:"#FDEDEB",
  warn:"#E5890A",warnBg:"#FFF5E6",
  info:"#2680EB",infoBg:"#E6F0FD",
  sh:"0 1px 3px rgba(0,0,0,0.06)",shM:"0 4px 12px rgba(0,0,0,0.08)",
};
const CC=["#C8A630","#22A06B","#2680EB","#E34935","#8B5CF6","#E5890A"];
const BOOK_COLORS=["#C8A630","#2680EB","#22A06B","#E34935","#8B5CF6","#E5890A","#14B8A6","#F97316","#EC4899","#6366F1"];

type RegionKey = "EG" | "AE";
interface CalEvent { e: string; d: string; r: boolean }
interface V26Item { t: string; d: string }
interface RegionInfo {
  id: string; n: string; ar: string; fl: string; cur: string;
  vr: number; vl: string; auth: string; ct: number; ctT: number;
  eM: boolean; fmt: string; sig: string; arch: number; pc: string; rt: boolean;
  pays: string[]; cal: CalEvent[]; v26: V26Item[] | null;
}

const RG: Record<RegionKey, RegionInfo> = {
  EG:{id:"EG",n:"Egypt",ar:"مصر",fl:"🇪🇬",cur:"EGP",vr:0.14,vl:"VAT 14%",auth:"ETA",ct:0.225,ctT:0,eM:true,fmt:"XML/JSON",sig:"HSM/USB Token",arch:7,pc:"GS1 GPC",rt:true,
    pays:["Fawry","Vodafone Cash","InstaPay","Paymob","Meeza"],
    cal:[{e:"Monthly VAT Return",d:"2 months after period",r:true},{e:"Annual Corporate Tax",d:"April 30",r:true},{e:"E-Invoice Wave 9-10",d:"2026",r:false},{e:"Withholding Tax",d:"Quarterly",r:true}],
    v26:null},
  AE:{id:"AE",n:"UAE",ar:"الإمارات",fl:"🇦🇪",cur:"AED",vr:0.05,vl:"VAT 5%",auth:"FTA",ct:0.09,ctT:375000,eM:false,fmt:"Peppol CTC",sig:"Digital Cert",arch:5,pc:"TBD",rt:false,
    pays:["Apple Pay","Google Pay","Tabby","Tamara","PayTabs"],
    cal:[{e:"VAT Return",d:"28 days after period",r:true},{e:"Corporate Tax",d:"9 months after FY",r:true},{e:"Legacy Credit Expiry",d:"Dec 31, 2026",r:false},{e:"E-Invoice Pilot",d:"July 2026",r:false},{e:"E-Invoice Mandatory",d:"2027",r:false}],
    v26:[{t:"Reverse Charge Simplified",d:"No self-invoices. Retain supplier docs."},{t:"5-Year Refund Deadline",d:"Unclaimed VAT expires after 5 years."},{t:"Anti-Evasion",d:"FTA can deny input VAT linked to evasion."},{t:"Supplier Due Diligence",d:"Verify suppliers before claiming input VAT."}]},
};

const PAY_MODES: Record<RegionKey, {g: string; opts: {v: string; l: string}[]}[]> = {
  EG:[
    {g:"Digital Wallets",opts:[{v:"fawry",l:"Fawry"},{v:"vodafone_cash",l:"Vodafone Cash"},{v:"instapay",l:"InstaPay"},{v:"paymob",l:"Paymob"},{v:"meeza",l:"Meeza"},{v:"orange_cash",l:"Orange Cash"},{v:"etisalat_cash",l:"Etisalat Cash"},{v:"bm_wallet",l:"BM Wallet"}]},
    {g:"Banks",opts:[{v:"cib",l:"CIB"},{v:"nbe",l:"National Bank of Egypt (NBE)"},{v:"banque_misr",l:"Banque Misr"},{v:"qnb",l:"QNB Al Ahli"},{v:"hsbc_eg",l:"HSBC Egypt"},{v:"aaib",l:"Arab African Intl Bank"},{v:"alex_bank",l:"Bank of Alexandria"},{v:"credit_agricole",l:"Crédit Agricole Egypt"},{v:"abu_dhabi_islamic",l:"Abu Dhabi Islamic Bank EG"},{v:"arab_bank",l:"Arab Bank"},{v:"ahli_united",l:"Ahli United Bank"},{v:"faisal_islamic",l:"Faisal Islamic Bank"},{v:"suez_canal_bank",l:"Suez Canal Bank"},{v:"egyptian_gulf",l:"Egyptian Gulf Bank"},{v:"export_dev",l:"Export Development Bank"}]},
    {g:"Other",opts:[{v:"cash",l:"💵 Cash"},{v:"check",l:"Check / Cheque"},{v:"pos",l:"POS Terminal"},{v:"bank_transfer",l:"Bank Transfer (Wire)"}]},
  ],
  AE:[
    {g:"Digital Wallets",opts:[{v:"apple_pay",l:"Apple Pay"},{v:"google_pay",l:"Google Pay"},{v:"samsung_pay",l:"Samsung Pay"},{v:"tabby",l:"Tabby"},{v:"tamara",l:"Tamara"},{v:"paytabs",l:"PayTabs"},{v:"noon_pay",l:"Noon Payments"},{v:"payit",l:"Payit (FAB)"}]},
    {g:"Banks",opts:[{v:"enbd",l:"Emirates NBD"},{v:"adcb",l:"ADCB"},{v:"fab",l:"First Abu Dhabi Bank (FAB)"},{v:"mashreq",l:"Mashreq Bank"},{v:"dib",l:"Dubai Islamic Bank"},{v:"rakbank",l:"RAKBank"},{v:"cbd",l:"Commercial Bank of Dubai"},{v:"ajman_bank",l:"Ajman Bank"},{v:"nbd",l:"National Bank of Dubai"},{v:"adib",l:"Abu Dhabi Islamic Bank"}]},
    {g:"Other",opts:[{v:"cash",l:"💵 Cash"},{v:"check",l:"Check / Cheque"},{v:"pos",l:"POS Terminal"},{v:"bank_transfer",l:"Bank Transfer (Wire)"}]},
  ],
};

const flatPayModes=(reg: RegionKey)=>PAY_MODES[reg].flatMap(g=>g.opts);
const payLabel=(reg: RegionKey, v: string)=>flatPayModes(reg).find(o=>o.v===v)?.l||v;

const LL: Record<string, string> = {
  dashboard:"Dashboard",cash:"Cash Book",invoices:"Invoices",ai:"AI Insights",
  compliance:"Compliance",settings:"Settings",welcome:"Welcome back",
  balance:"Total Balance",income:"Income",expense:"Expenses",receivable:"Receivable",
  cashIn:"Cash In",cashOut:"Cash Out",add:"Add Entry",amount:"Amount",
  category:"Category",note:"Note",save:"Save",search:"Search",
  customers:"Customers",owed:"Total Owed",paid:"Total Paid",remind:"Remind",
  createInv:"Create Invoice",invNo:"Invoice No.",status:"Status",
  paidS:"Paid",unpaid:"Unpaid",draft:"Draft",
  items:"Items",subtotal:"Subtotal",vat:"VAT",total:"Total",
  netProfit:"Net Profit",recentTx:"Recent Transactions",topCats:"Top Categories",
  trend:"Monthly Trend",askAi:"Ask Feloosak anything...",
  vatSum:"VAT Summary",corpTax:"Corporate Tax",outVat:"Output VAT",inVat:"Input VAT",
  netVat:"Net VAT Payable",taxCal:"Tax Calendar",
  region:"Region",lang:"Language",logout:"Logout",
  varianceAi:"Variance AI",aiGen:"AI Generated",
  itemName:"Item Name",qty:"Qty",unitPrice:"Unit Price",discount:"Discount %",
  lineTotal:"Line Total",addLine:"Add Line Item",
  invDate:"Invoice Date",terms:"Payment Terms",billAddr:"Billing Address",
  notes:"Notes & Terms",preview:"Preview",print:"Print",saveDraft:"Save Draft",
  net30:"Net 30",net60:"Net 60",dueReceipt:"Due on Receipt",
  rent:"Rent",inventory:"Inventory",salaries:"Salaries",utilities:"Utilities",
  transport:"Transport",food:"Food",maintenance:"Maintenance",
  sales:"Sales",services:"Services",other:"Other",
  selectRegion:"Select Your Region",regionNote:"Each region follows different tax & compliance laws",
  salary:"Salary",freelance:"Freelance",gifts:"Gifts",groceries:"Groceries",dining:"Dining",
  entertainment:"Entertainment",health:"Health",education:"Education",bills:"Bills",
  shopping:"Shopping",savings:"Savings",
};

const CATS=["sales","services","rent","inventory","salaries","utilities","transport","food","maintenance","other"];
const PERSONAL_CATS=["salary","freelance","gifts","groceries","dining","transport","entertainment","health","education","bills","shopping","savings","other"];

interface TxItem { id: number; ty: string; am: number; cat: string; no: string; dt: string; payMode?: string; proof?: string|null }
interface BookMember { id: number; name: string; email: string; role: "admin"|"editor"|"viewer"; avatar: string }
interface CashBook {
  id: number; name: string; type: "business" | "personal";
  icon: string; color: string; tx: TxItem[]; createdAt: string;
  members: BookMember[];
}
interface CustItem { id: number; nm: string; ph: string; ow: number; pd: number; tr: number }
interface UserData { id: number; email: string; name: string; region: string; avatar: string }

const BOOK_ICONS=["🏪","🛒","💼","🏢","🏭","🚗","🏠","📱","💻","🎯","📦","🔧","👛","🏦","💳","🎓","✈️","🏥","🎭","📚"];
const MO=[{m:"Oct",i:62000,e:41000},{m:"Nov",i:78000,e:52000},{m:"Dec",i:95000,e:61000},{m:"Jan",i:71000,e:48000},{m:"Feb",i:84000,e:55000},{m:"Mar",i:91500,e:21450}];

function mapBookFromApi(b: any): CashBook {
  return {
    id: b.id, name: b.name, type: b.type, icon: b.icon, color: b.color,
    createdAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Mar 2026",
    tx: (b.tx || []).map((t: any) => ({
      id: t.id, ty: t.type, am: parseFloat(t.amount), cat: t.category,
      no: t.note || "", dt: t.date, payMode: t.payMode || "cash", proof: t.proof || null,
    })),
    members: (b.members || []).map((m: any) => ({
      id: m.id, name: m.name, email: m.email, role: m.role, avatar: m.avatar || m.name.charAt(0),
    })),
  };
}

function mapCustomerFromApi(c: any): CustItem {
  return { id: c.id, nm: c.name, ph: c.phone || "", ow: parseFloat(c.owed) || 0, pd: parseFloat(c.paid) || 0, tr: c.trust || 50 };
}

const Card = ({children,className="",style={}}: {children: React.ReactNode; className?: string; style?: React.CSSProperties}) => (
  <div className={`rounded-2xl bg-white ${className}`} style={{border:`1px solid ${TK.border}`,boxShadow:TK.sh,...style}}>{children}</div>
);

const Badge = ({t,c=TK.ok}: {t: string; c?: string}) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{background:`${c}14`,color:c}}>✓ {t}</span>
);

const Modal = ({open,onClose,title,wide,children}: {open: boolean; onClose: () => void; title: string; wide?: boolean; children: React.ReactNode}) => {
  if(!open) return null;
  return <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[4vh]" onClick={onClose}>
    <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"/>
    <div className={`relative w-full ${wide?"max-w-2xl":"max-w-md"} rounded-2xl bg-white p-5 shadow-xl max-h-[88vh] overflow-y-auto`} onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold" style={{color:TK.text}}>{title}</h3>
        <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 text-lg">×</button>
      </div>
      {children}
    </div>
  </div>;
};

const Inp = ({label,value,onChange,type="text",placeholder,options,prefix,textarea,groupedOptions}: {label?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; options?: {v: string; l: string}[]; prefix?: string; textarea?: boolean; groupedOptions?: {g: string; opts: {v: string; l: string}[]}[]}) => (
  <div className="mb-3">
    {label&&<label className="block text-[10px] font-bold mb-1 uppercase tracking-wider" style={{color:TK.textM}}>{label}</label>}
    <div className="relative">
      {prefix&&<span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{color:TK.textM}}>{prefix}</span>}
      {groupedOptions?<select value={value} onChange={e=>onChange(e.target.value)} className="w-full p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}>
        <option value="">— Select —</option>
        {groupedOptions.map(g=><optgroup key={g.g} label={g.g}>{g.opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</optgroup>)}
      </select>:
      options?<select value={value} onChange={e=>onChange(e.target.value)} className="w-full p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}>
        {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>:
      textarea?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 resize-none" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}/>:
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={`w-full p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 ${prefix?"pl-12":""}`} style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}/>}
    </div>
  </div>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-3 border-current border-t-transparent rounded-full animate-spin" style={{color:TK.accent}}/>
  </div>
);

const fmt = (n: number) => n.toLocaleString();

const exportCSV=(book: CashBook, cur: string, reg: RegionKey)=>{
  const hdr=["Date","Type","Amount ("+cur+")","Category","Note","Payment Mode","Proof"];
  const rows=book.tx.map(t=>[t.dt,t.ty==="in"?"Cash In":"Cash Out",t.am.toString(),t.cat,t.no||"",payLabel(reg,t.payMode||"cash"),t.proof||""]);
  const tI=book.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);
  const tO=book.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);
  rows.push([]);rows.push(["","Total In",tI.toString()]);rows.push(["","Total Out",tO.toString()]);rows.push(["","Balance",(tI-tO).toString()]);
  const csv=[hdr,...rows].map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=`${book.name.replace(/\s+/g,"_")}_cashbook.csv`;a.click();URL.revokeObjectURL(url);
};

const exportPDF=(book: CashBook, cur: string, reg: RegionKey)=>{
  const tI=book.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);
  const tO=book.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);
  const w=window.open("","_blank");if(!w)return;
  w.document.write(`<!DOCTYPE html><html><head><title>${book.name} — Cash Book Report</title><style>
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;padding:40px;color:#1A1A1A;max-width:900px;margin:0 auto}
    h1{font-size:22px;margin-bottom:4px}h2{font-size:14px;color:#6B6560;font-weight:500;margin-bottom:20px}
    .summary{display:flex;gap:16px;margin-bottom:24px}.sum-card{flex:1;padding:14px;border-radius:12px;text-align:center}
    .sum-card p{font-size:10px;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:4px}
    .sum-card h3{font-size:18px;font-weight:800}
    table{width:100%;border-collapse:collapse;font-size:12px}th{background:#F6F5F0;padding:10px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#6B6560;font-weight:700}
    td{padding:10px;border-bottom:1px solid #E8E6E1}.type-in{color:#22A06B;font-weight:700}.type-out{color:#E34935;font-weight:700}
    .footer{margin-top:24px;font-size:10px;color:#9C9590;text-align:center}
    @media print{body{padding:20px}}</style></head><body>
    <h1>${book.icon} ${book.name}</h1>
    <h2>${book.type==="business"?"Business":"Personal"} Cash Book • Generated ${new Date().toLocaleDateString()} • ${cur}</h2>
    <div class="summary">
      <div class="sum-card" style="background:#E6F9F0"><p style="color:#22A06B">Cash In</p><h3>${cur} ${fmt(tI)}</h3></div>
      <div class="sum-card" style="background:#FDEDEB"><p style="color:#E34935">Cash Out</p><h3>${cur} ${fmt(tO)}</h3></div>
      <div class="sum-card" style="background:#FEF9E7"><p style="color:#C8A630">Balance</p><h3>${cur} ${fmt(tI-tO)}</h3></div>
    </div>
    <table><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Category</th><th>Note</th><th>Payment Mode</th><th>Proof</th></tr></thead><tbody>
    ${book.tx.map(t=>`<tr><td>${t.dt}</td><td class="type-${t.ty}">${t.ty==="in"?"↓ Cash In":"↑ Cash Out"}</td><td class="type-${t.ty}">${t.ty==="in"?"+":"-"}${cur} ${fmt(t.am)}</td><td>${t.cat}</td><td>${t.no||"—"}</td><td>${payLabel(reg,t.payMode||"cash")}</td><td>${t.proof?"📎 "+t.proof:"—"}</td></tr>`).join("")}
    </tbody></table>
    <div class="footer">Feloosak فلوسك — AI Finance Super App • ${RG[reg].fl} ${RG[reg].n} • ${RG[reg].auth}</div>
    <script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
  w.document.close();
};

const Login = ({onLogin}: {onLogin: (user: UserData) => void}) => {
  const [mode,setMode]=useState<"login"|"register">("login");
  const [em,setEm]=useState("");
  const [pw,setPw]=useState("");
  const [nm,setNm]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [ld,setLd]=useState(false);
  const [err,setErr]=useState("");

  const go=async()=>{
    setLd(true);setErr("");
    try {
      if(mode==="register"){
        if(!nm.trim()){setErr("Name is required");setLd(false);return;}
        const data = await api.auth.register(em,pw,nm,"EG");
        onLogin(data.user);
      } else {
        const data = await api.auth.login(em,pw);
        onLogin(data.user);
      }
    } catch(e: any) {
      setErr(e.message || "Login failed");
    }
    setLd(false);
  };

  return <div className="min-h-screen flex" style={{background:TK.bg}}>
    <div className="hidden lg:flex lg:w-[44%] flex-col justify-between p-10 relative overflow-hidden" style={{background:"linear-gradient(145deg,#1A1510,#2C2315,#3D2E18)"}}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#C8A630,#E8C840)"}}><span className="text-xl font-black" style={{color:"#1A1510"}}>ف</span></div>
        <div><span className="text-lg font-black text-white">Feloosak</span><span className="block text-[11px]" style={{color:"#C8A630"}}>فلوسك</span></div>
      </div>
      <div>
        <h2 className="text-3xl font-black leading-tight text-white mb-3">The financial<br/>brain for every<br/>MENA business</h2>
        <p className="text-sm leading-relaxed" style={{color:"#A89878"}}>AI-powered finance intelligence for Egypt & UAE. Cash management, e-invoicing, VAT automation.</p>
        <div className="flex flex-wrap gap-2 mt-6">
          {["ETA Compliant","FTA Ready","Offline-First","Arabic-Native"].map(t=><span key={t} className="px-3 py-1.5 rounded-full text-[9px] font-bold" style={{background:"#C8A63015",color:"#C8A630",border:"1px solid #C8A63025"}}>{t}</span>)}
        </div>
      </div>
      <p className="text-[10px]" style={{color:"#6B5B40"}}>© 2026 Aura Tech Labs</p>
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full" style={{background:"#C8A63008"}}/>
    </div>
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#C8A630,#E8C840)"}}><span className="text-base font-black" style={{color:"#1A1510"}}>ف</span></div>
          <span className="font-bold" style={{color:TK.text}}>Feloosak</span>
        </div>
        <h1 className="text-xl font-black mb-0.5" style={{color:TK.text}}>{mode==="login"?"Sign in":"Create account"}</h1>
        <p className="text-xs mb-6" style={{color:TK.textM}}>{mode==="login"?"Enter your credentials to continue":"Join Feloosak — free forever"}</p>
        {err&&<div className="p-2.5 rounded-xl mb-3 text-xs font-semibold" style={{background:TK.badBg,color:TK.bad}}>{err}</div>}
        {mode==="register"&&<Inp label="Full Name" value={nm} onChange={setNm} placeholder="Your name"/>}
        <Inp label="Email" value={em} onChange={setEm} type="email" placeholder="you@company.com"/>
        <div className="mb-3">
          <label className="block text-[10px] font-bold mb-1 uppercase tracking-wider" style={{color:TK.textM}}>Password</label>
          <div className="relative">
            <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder="Min 6 characters" className="w-full p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}/>
            <button onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{color:TK.textM}}>{showPw?"Hide":"Show"}</button>
          </div>
        </div>
        {mode==="login"&&<div className="flex justify-between items-center mb-5">
          <label className="flex items-center gap-1.5 text-[11px]" style={{color:TK.textS}}><input type="checkbox" defaultChecked className="rounded"/>Remember me</label>
          <button className="text-[11px] font-semibold" style={{color:TK.accent}}>Forgot password?</button>
        </div>}
        <button onClick={go} disabled={ld} className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
          style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510",boxShadow:"0 2px 8px #C8A63040"}}>
          {ld?<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>:<>{mode==="login"?"🔒 Sign In":"✨ Create Account"}</>}
        </button>
        <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px" style={{background:TK.border}}/><span className="text-[10px]" style={{color:TK.textM}}>or</span><div className="flex-1 h-px" style={{background:TK.border}}/></div>
        <div className="grid grid-cols-2 gap-2">
          {["G  Google","🍎 Apple"].map(p=><button key={p} className="py-2 rounded-xl text-xs font-semibold hover:bg-gray-50" style={{border:`1px solid ${TK.border}`,color:TK.text}}>{p}</button>)}
        </div>
        <p className="text-center text-[11px] mt-5" style={{color:TK.textM}}>
          {mode==="login"?"No account? ":"Already have one? "}
          <button className="font-bold" style={{color:TK.accent}} onClick={()=>{setMode(mode==="login"?"register":"login");setErr("");}}>{mode==="login"?"Sign up":"Sign in"}</button>
        </p>
      </div>
    </div>
  </div>;
};

const RegSel = ({onSel}: {onSel: (r: RegionKey) => void}) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{background:TK.bg}}>
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{background:"linear-gradient(135deg,#C8A630,#E8C840)"}}><span className="text-xl font-black" style={{color:"#1A1510"}}>ف</span></div>
    <h2 className="text-lg font-bold mb-1" style={{color:TK.text}}>{LL.selectRegion}</h2>
    <p className="text-xs mb-6 text-center max-w-xs" style={{color:TK.textM}}>{LL.regionNote}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
      {(Object.values(RG) as RegionInfo[]).map(r=>(
        <Card key={r.id} className="p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]">
          <button onClick={()=>onSel(r.id as RegionKey)} className="w-full text-left">
            <span className="text-3xl block mb-2">{r.fl}</span>
            <p className="text-base font-bold" style={{color:TK.text}}>{r.n}</p>
            <p className="text-sm font-medium" style={{color:TK.accent}}>{r.ar}</p>
            <div className="mt-3 space-y-1">
              {[["VAT",`${(r.vr*100)}%`],["E-Invoice",r.auth],["Currency",r.cur],["Corp Tax",r.id==="AE"?`0%→9% (AED 375K)`:`${(r.ct*100)}%`]].map(([k,v])=>(
                <div key={k} className="flex justify-between text-[11px]"><span style={{color:TK.textM}}>{k}</span><span className="font-bold" style={{color:TK.text}}>{v}</span></div>
              ))}
            </div>
            <div className="mt-3 text-xs font-semibold flex items-center gap-1" style={{color:TK.accent}}>Select →</div>
          </button>
        </Card>
      ))}
    </div>
  </div>
);

const Dash = ({R,books,cu}: {R: RegionInfo; books: CashBook[]; cu: CustItem[]}) => {
  const c=R.cur;
  const allTx = books.flatMap(b=>b.tx);
  const tI=allTx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);
  const tO=allTx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);
  const bal=tI-tO;
  const owd=cu.reduce((s,x)=>s+x.ow,0);
  const catD=useMemo(()=>{const m: Record<string,number>={};allTx.filter(t=>t.ty==="out").forEach(t=>{m[t.cat]=(m[t.cat]||0)+t.am;});return Object.entries(m).map(([n,v])=>({name:LL[n]||n,value:v})).sort((a,b)=>b.value-a.value).slice(0,5);},[allTx]);

  return <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-xl font-extrabold" style={{color:TK.text}}>{LL.welcome} {R.fl}</h1><p className="text-xs" style={{color:TK.textM}}>March 16, 2026 • {R.n} • {R.vl}</p></div>
      <Badge t={`${R.auth} ${R.eM?"Active":"Pilot"}`} c={R.eM?TK.ok:TK.warn}/>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[{i:"💰",l:LL.balance,v:`${c} ${fmt(bal)}`,ch:"+17%",cl:TK.accent},{i:"📈",l:LL.income,v:`${c} ${fmt(tI)}`,ch:"+8.9%",cl:TK.ok},{i:"📉",l:LL.expense,v:`${c} ${fmt(tO)}`,ch:"-3.2%",cl:TK.bad},{i:"💳",l:LL.receivable,v:`${c} ${fmt(owd)}`,ch:`${cu.filter(x=>x.ow>0).length}`,cl:TK.warn}].map((s,i)=>(
        <Card key={i} className="p-4"><div className="flex items-start justify-between mb-2"><span className="text-lg">{s.i}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:TK.okBg,color:TK.ok}}>{s.ch}</span></div>
          <p className="text-[10px] font-medium" style={{color:TK.textM}}>{s.l}</p><p className="text-lg font-extrabold" style={{color:TK.text}}>{s.v}</p></Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <Card className="lg:col-span-2 p-4">
        <div className="flex items-center justify-between mb-1"><div><p className="text-[9px] uppercase font-bold tracking-widest" style={{color:TK.textM}}>AUTO-GENERATED</p><h3 className="text-sm font-bold" style={{color:TK.text}}>{LL.trend}</h3></div><Badge t="AI-assisted" c={TK.accent}/></div>
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={MO.map(d=>({m:d.m,i:d.i,e:d.e}))}>
            <defs><linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TK.ok} stopOpacity={0.15}/><stop offset="100%" stopColor={TK.ok} stopOpacity={0}/></linearGradient><linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TK.bad} stopOpacity={0.15}/><stop offset="100%" stopColor={TK.bad} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={TK.borderL}/><XAxis dataKey="m" tick={{fill:TK.textM,fontSize:10}} axisLine={false}/><YAxis tick={{fill:TK.textM,fontSize:10}} axisLine={false} tickFormatter={(v: number)=>`${(v/1000).toFixed(0)}K`}/>
            <Tooltip contentStyle={{background:"#fff",border:`1px solid ${TK.border}`,borderRadius:12,fontSize:11,boxShadow:TK.shM}}/>
            <Area type="monotone" dataKey="i" stroke={TK.ok} fill="url(#gI)" strokeWidth={2} name="Income"/><Area type="monotone" dataKey="e" stroke={TK.bad} fill="url(#gE)" strokeWidth={2} name="Expense"/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-4">
        <h3 className="text-sm font-bold mb-3" style={{color:TK.text}}>{LL.topCats}</h3>
        <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={catD} cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={3} dataKey="value">{catD.map((_,i)=><Cell key={i} fill={CC[i%CC.length]}/>)}</Pie><Tooltip contentStyle={{background:"#fff",border:`1px solid ${TK.border}`,borderRadius:10,fontSize:10}}/></PieChart></ResponsiveContainer>
        <div className="space-y-1.5 mt-2">{catD.slice(0,4).map((d,i)=><div key={i} className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{background:CC[i]}}/><span style={{color:TK.textS}}>{d.name}</span></span><span className="font-bold" style={{color:TK.text}}>{c} {fmt(d.value)}</span></div>)}</div>
      </Card>
    </div>
    <Card className="p-4" style={{background:TK.accentBg,borderColor:`${TK.accent}25`}}>
      <div className="flex items-start gap-3"><span className="text-base mt-0.5">⚡</span><div>
        <p className="text-[10px] font-bold" style={{color:TK.accent}}>{LL.aiGen} <span style={{color:TK.textM}}>just now</span></p>
        <p className="text-xs mt-1 leading-relaxed" style={{color:TK.text}}>Net profit <strong>{c} {fmt(bal)}</strong> (+17% MoM). You have <strong>{books.length} cash books</strong> ({books.filter(b=>b.type==="business").length} business, {books.filter(b=>b.type==="personal").length} personal). Est. VAT: <strong style={{color:TK.bad}}>{c} {fmt(Math.round(bal*R.vr))}</strong>. {R.id==="EG"?"Khaled Mahmoud 16 days overdue (EGP 22,000). Send ETA reminder.":"Profit below AED 375K threshold — 0% corporate tax."}</p>
      </div></div>
    </Card>
    <Card className="p-4"><h3 className="text-sm font-bold mb-3" style={{color:TK.text}}>{LL.recentTx}</h3>
      <div className="space-y-1.5">{allTx.slice(0,6).map(t=>{const isI=t.ty==="in";const bk=books.find(b=>b.tx.some(x=>x.id===t.id));return <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all" style={{border:`1px solid ${TK.borderL}`}}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{background:isI?TK.okBg:TK.badBg}}>{isI?"↓":"↑"}</div>
        <div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate" style={{color:TK.text}}>{t.no}</p><p className="text-[10px]" style={{color:TK.textM}}>{bk?`${bk.icon} ${bk.name} • `:""}{LL[t.cat]||t.cat} • {t.dt}{t.payMode?` • ${payLabel(R.id as RegionKey,t.payMode)}`:""}</p></div>
        <p className="text-xs font-bold" style={{color:isI?TK.ok:TK.bad}}>{isI?"+":"-"}{R.cur} {fmt(t.am)}</p>
      </div>})}</div>
    </Card>
  </div>;
};

const CashBookPg = ({R,books,reload,cu}: {R: RegionInfo; books: CashBook[]; reload: () => void; cu: CustItem[]}) => {
  const c=R.cur; const reg=R.id as RegionKey;
  const [bookType,setBookType]=useState<"business"|"personal">("business");
  const [activeBook,setActiveBook]=useState<number|null>(null);
  const [tab,setTab]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [showNewBook,setShowNewBook]=useState(false);
  const [showMembers,setShowMembers]=useState(false);
  const [showProofView,setShowProofView]=useState<string|null>(null);
  const [ty,setTy]=useState("in");
  const [am,setAm]=useState("");const [ca,setCa]=useState("sales");const [no,setNo]=useState("");
  const [payMode,setPayMode]=useState("cash");
  const [proofFile,setProofFile]=useState<string>("");
  const [newBookName,setNewBookName]=useState("");
  const [newBookIcon,setNewBookIcon]=useState("🏪");
  const [newMemberName,setNewMemberName]=useState("");
  const [newMemberEmail,setNewMemberEmail]=useState("");
  const [newMemberRole,setNewMemberRole]=useState<"editor"|"viewer">("viewer");
  const [saving,setSaving]=useState(false);
  const proofInputRef=useRef<HTMLInputElement>(null);

  const filteredBooks = books.filter(b=>b.type===bookType);
  const currentBook = activeBook!==null ? books.find(b=>b.id===activeBook) : null;
  const currentCats = bookType==="personal" ? PERSONAL_CATS : CATS;

  const allTxInType = filteredBooks.flatMap(b=>b.tx);
  const totalIn = allTxInType.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);
  const totalOut = allTxInType.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);

  const addTx=async()=>{
    if(!am||isNaN(Number(am))||!currentBook)return;
    setSaving(true);
    try {
      await api.transactions.create({
        bookId: currentBook.id, type: ty, amount: parseFloat(am),
        category: ca, note: no, date: "Mar 16", payMode, proof: proofFile || null,
      });
      reload();
      setShowAdd(false);setAm("");setNo("");setPayMode("cash");setProofFile("");
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const removeTx=async(txId: number)=>{
    try { await api.transactions.delete(txId); reload(); } catch(e) { console.error(e); }
  };

  const createBook=async()=>{
    if(!newBookName.trim())return;
    setSaving(true);
    try {
      await api.books.create({
        name: newBookName.trim(), type: bookType, icon: newBookIcon,
        color: BOOK_COLORS[books.length%BOOK_COLORS.length],
      });
      reload();
      setShowNewBook(false);setNewBookName("");setNewBookIcon("🏪");
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const deleteBook=async(bookId: number)=>{
    try { await api.books.delete(bookId); if(activeBook===bookId)setActiveBook(null); reload(); } catch(e) { console.error(e); }
  };

  const addMember=async()=>{
    if(!newMemberName.trim()||!newMemberEmail.trim()||!currentBook)return;
    try {
      await api.members.create({ bookId: currentBook.id, name: newMemberName.trim(), email: newMemberEmail.trim(), role: newMemberRole });
      reload();
      setNewMemberName("");setNewMemberEmail("");setNewMemberRole("viewer");
    } catch(e) { console.error(e); }
  };

  const removeMember=async(memberId: number)=>{
    try { await api.members.delete(memberId); reload(); } catch(e) { console.error(e); }
  };

  const updateMemberRole=async(memberId: number, role: "admin"|"editor"|"viewer")=>{
    try { await api.members.update(memberId, { role }); reload(); } catch(e) { console.error(e); }
  };

  const handleProofCapture=(e: React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(file)setProofFile(file.name);
  };

  if(currentBook){
    const bTx = currentBook.tx;
    const bIn = bTx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);
    const bOut = bTx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);
    const fl = tab==="in"?bTx.filter(t=>t.ty==="in"):tab==="out"?bTx.filter(t=>t.ty==="out"):tab==="cust"?[]:bTx;
    const roleColors: Record<string,string> = {admin:TK.accent,editor:TK.info,viewer:TK.textM};

    return <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={()=>setActiveBook(null)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 text-sm" style={{border:`1px solid ${TK.border}`}}>←</button>
        <div className="flex-1">
          <div className="flex items-center gap-2"><span className="text-lg">{currentBook.icon}</span><h1 className="text-lg font-bold" style={{color:TK.text}}>{currentBook.name}</h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{background:currentBook.type==="business"?TK.infoBg:TK.accentBg,color:currentBook.type==="business"?TK.info:TK.accent}}>{currentBook.type}</span>
          </div>
          <p className="text-[10px]" style={{color:TK.textM}}>Created {currentBook.createdAt} • {bTx.length} transactions • {currentBook.members.length} members</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={()=>exportPDF(currentBook,c,reg)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold hover:shadow-sm transition-all" style={{background:TK.badBg,color:TK.bad,border:`1px solid ${TK.bad}15`}} title="Export PDF">📄 PDF</button>
          <button onClick={()=>exportCSV(currentBook,c,reg)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold hover:shadow-sm transition-all" style={{background:TK.okBg,color:TK.ok,border:`1px solid ${TK.ok}15`}} title="Export Excel/CSV">📊 Excel</button>
          <button onClick={()=>setShowMembers(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold hover:shadow-sm transition-all" style={{background:TK.infoBg,color:TK.info,border:`1px solid ${TK.info}15`}}>👥 {currentBook.members.length}</button>
          <button onClick={()=>setShowAdd(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>+ {LL.add}</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[[LL.cashIn,bIn,TK.ok,TK.okBg],[LL.cashOut,bOut,TK.bad,TK.badBg],[LL.balance,bIn-bOut,TK.accent,TK.accentBg]].map(([l,v,cl,bg],i)=>(
          <div key={i} className="p-3 rounded-xl text-center" style={{background:bg as string,border:`1px solid ${cl}15`}}><p className="text-[9px] font-bold uppercase" style={{color:cl as string}}>{l as string}</p><p className="text-sm font-extrabold mt-0.5" style={{color:TK.text}}>{c} {fmt(v as number)}</p></div>
        ))}
      </div>
      <div className="flex gap-1 p-1 rounded-xl" style={{background:TK.muted}}>
        {[["all","All"],["in",LL.cashIn],["out",LL.cashOut],["cust",LL.customers]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all" style={{background:tab===v?"#fff":"transparent",color:tab===v?TK.text:TK.textM,boxShadow:tab===v?TK.sh:"none"}}>{l}</button>
        ))}
      </div>
      {tab==="cust"?<div className="space-y-2">{cu.map(x=>{const tc=x.tr>=90?TK.ok:x.tr>=70?TK.warn:TK.bad;return <Card key={x.id} className="p-3.5"><div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{background:TK.accentBg,color:TK.accent}}>{x.nm[0]}</div>
        <div className="flex-1"><p className="text-xs font-semibold" style={{color:TK.text}}>{x.nm}</p><p className="text-[10px]" style={{color:TK.textM}}>{x.ph}</p></div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{background:`${tc}12`,color:tc}}>★ {x.tr}%</span>
        <div className="text-right">{x.ow>0?<p className="text-xs font-bold" style={{color:TK.bad}}>{c} {fmt(x.ow)}</p>:<p className="text-xs font-bold" style={{color:TK.ok}}>Clear ✓</p>}</div>
      </div></Card>})}</div>
      :<div>{fl.length===0?<div className="text-center py-10"><p className="text-2xl mb-2">📭</p><p className="text-sm font-semibold" style={{color:TK.textM}}>No transactions yet</p><p className="text-[11px] mt-1" style={{color:TK.textM}}>Add your first entry to get started</p></div>
      :<div className="space-y-1.5">{fl.map(t=>{const isI=t.ty==="in";return <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl group hover:bg-gray-50" style={{border:`1px solid ${TK.borderL}`}}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{background:isI?TK.okBg:TK.badBg}}>{isI?"↓":"↑"}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{color:TK.text}}>{t.no||LL[t.cat]||t.cat}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px]" style={{color:TK.textM}}>{LL[t.cat]||t.cat} • {t.dt}</span>
            {t.payMode&&<span className="px-1.5 py-0.5 rounded text-[8px] font-semibold" style={{background:TK.infoBg,color:TK.info}}>{payLabel(reg,t.payMode)}</span>}
            {t.proof&&<button onClick={()=>setShowProofView(t.proof!)} className="px-1.5 py-0.5 rounded text-[8px] font-semibold cursor-pointer hover:opacity-80" style={{background:TK.warnBg,color:TK.warn}}>📎 {t.proof}</button>}
          </div>
        </div>
        <p className="text-xs font-bold" style={{color:isI?TK.ok:TK.bad}}>{isI?"+":"-"}{c} {fmt(t.am)}</p>
        <button onClick={()=>removeTx(t.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition-opacity">✕</button>
      </div>})}</div>}</div>}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title={`${LL.add} — ${currentBook.icon} ${currentBook.name}`}>
        <div className="flex gap-2 mb-3">{(["in","out"] as const).map(t=><button key={t} onClick={()=>setTy(t)} className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all" style={{background:ty===t?(t==="in"?TK.ok:TK.bad):TK.muted,color:ty===t?"#fff":TK.textM}}>{t==="in"?`↓ ${LL.cashIn}`:`↑ ${LL.cashOut}`}</button>)}</div>
        <Inp label={LL.amount} value={am} onChange={setAm} type="number" placeholder="0.00" prefix={c}/>
        <Inp label={LL.category} value={ca} onChange={setCa} options={currentCats.map(x=>({v:x,l:LL[x]||x.charAt(0).toUpperCase()+x.slice(1)}))}/>
        <Inp label="Payment Mode" value={payMode} onChange={setPayMode} groupedOptions={PAY_MODES[reg]}/>
        <Inp label={LL.note} value={no} onChange={setNo} placeholder="Add a note..."/>
        <div className="mb-3">
          <label className="block text-[10px] font-bold mb-1 uppercase tracking-wider" style={{color:TK.textM}}>Payment Proof</label>
          <div className="flex gap-2">
            <input ref={proofInputRef} type="file" accept="image/*,.pdf" onChange={handleProofCapture} className="hidden"/>
            <button onClick={()=>proofInputRef.current?.click()} className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:shadow-sm transition-all" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.textS}}>📁 Upload File</button>
            <button onClick={()=>{const inp=document.createElement("input");inp.type="file";inp.accept="image/*";inp.capture="environment";inp.onchange=(e:any)=>{const f=e.target.files?.[0];if(f)setProofFile(f.name);};inp.click();}} className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:shadow-sm transition-all" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.textS}}>📸 Capture</button>
          </div>
          {proofFile&&<div className="mt-2 flex items-center gap-2 p-2 rounded-lg" style={{background:TK.okBg,border:`1px solid ${TK.ok}15`}}>
            <span className="text-xs">📎</span><span className="text-[11px] font-semibold flex-1 truncate" style={{color:TK.ok}}>{proofFile}</span>
            <button onClick={()=>setProofFile("")} className="text-red-400 text-xs hover:text-red-600">✕</button>
          </div>}
        </div>
        <button onClick={addTx} disabled={saving} className="w-full py-2.5 rounded-xl text-sm font-bold mt-1" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>{saving?"Saving...":LL.save}</button>
      </Modal>

      <Modal open={showMembers} onClose={()=>setShowMembers(false)} title={`👥 Members — ${currentBook.icon} ${currentBook.name}`} wide>
        <div className="p-2.5 rounded-xl mb-4 text-[11px]" style={{background:TK.accentBg,border:`1px solid ${TK.accent}20`,color:TK.textS}}>
          Only <strong style={{color:TK.accent}}>Admins</strong> can add/remove members and change roles. <strong>Editors</strong> can add & edit entries. <strong>Viewers</strong> can only view.
        </div>
        <div className="space-y-2 mb-4">
          {currentBook.members.map(m=>(
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:TK.muted,border:`1px solid ${TK.borderL}`}}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold" style={{background:`${roleColors[m.role]}15`,color:roleColors[m.role]}}>{m.avatar}</div>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{color:TK.text}}>{m.name}</p>
                <p className="text-[10px]" style={{color:TK.textM}}>{m.email}</p>
              </div>
              {m.role==="admin"&&currentBook.members.indexOf(m)===0?
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{background:`${TK.accent}15`,color:TK.accent}}>Owner</span>
              :<>
                <select value={m.role} onChange={e=>updateMemberRole(m.id,e.target.value as "admin"|"editor"|"viewer")} className="text-[10px] font-semibold px-2 py-1 rounded-lg outline-none" style={{background:"white",border:`1px solid ${TK.border}`,color:roleColors[m.role]}}>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button onClick={()=>removeMember(m.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </>}
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl" style={{background:TK.muted,border:`1px solid ${TK.borderL}`}}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{color:TK.textM}}>Add New Member</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Inp label="Name" value={newMemberName} onChange={setNewMemberName} placeholder="Full name"/>
            <Inp label="Email" value={newMemberEmail} onChange={setNewMemberEmail} type="email" placeholder="email@company.com"/>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1"><Inp label="Role" value={newMemberRole} onChange={v=>setNewMemberRole(v as "editor"|"viewer")} options={[{v:"editor",l:"Editor — Can add & edit"},{v:"viewer",l:"Viewer — Read only"}]}/></div>
            <button onClick={addMember} className="px-4 py-2.5 rounded-xl text-xs font-bold mb-3" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>Add</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!showProofView} onClose={()=>setShowProofView(null)} title="Payment Proof">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl" style={{background:TK.muted}}>📎</div>
          <p className="text-sm font-semibold" style={{color:TK.text}}>{showProofView}</p>
          <p className="text-[11px] mt-1" style={{color:TK.textM}}>Payment proof attached to this transaction</p>
          <div className="flex gap-2 justify-center mt-4">
            <button className="px-4 py-2 rounded-xl text-xs font-semibold" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.textS}}>👁 View Full</button>
            <button className="px-4 py-2 rounded-xl text-xs font-semibold" style={{background:TK.infoBg,color:TK.info}}>⬇ Download</button>
          </div>
        </div>
      </Modal>
    </div>;
  }

  return <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div><h1 className="text-lg font-bold" style={{color:TK.text}}>{LL.cash}</h1><p className="text-[10px]" style={{color:TK.textM}}>{books.length} books • {books.filter(b=>b.type==="business").length} business, {books.filter(b=>b.type==="personal").length} personal</p></div>
      <button onClick={()=>setShowNewBook(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>+ New Book</button>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[["Total In",totalIn,TK.ok,TK.okBg],["Total Out",totalOut,TK.bad,TK.badBg],["Net Balance",totalIn-totalOut,TK.accent,TK.accentBg]].map(([l,v,cl,bg],i)=>(
        <div key={i} className="p-3 rounded-xl text-center" style={{background:bg as string,border:`1px solid ${cl}15`}}><p className="text-[9px] font-bold uppercase" style={{color:cl as string}}>{l as string}</p><p className="text-sm font-extrabold mt-0.5" style={{color:TK.text}}>{c} {fmt(v as number)}</p></div>
      ))}
    </div>
    <div className="flex gap-1 p-1 rounded-xl" style={{background:TK.muted}}>
      {([["business","🏢 Business"],["personal","👤 Personal"]] as const).map(([v,l])=>(
        <button key={v} onClick={()=>setBookType(v)} className="flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all" style={{background:bookType===v?"#fff":"transparent",color:bookType===v?TK.text:TK.textM,boxShadow:bookType===v?TK.sh:"none"}}>{l}</button>
      ))}
    </div>
    {filteredBooks.length===0?
      <div className="text-center py-10"><p className="text-3xl mb-2">{bookType==="business"?"🏢":"👤"}</p><p className="text-sm font-semibold" style={{color:TK.textM}}>No {bookType} books yet</p><p className="text-[11px] mt-1" style={{color:TK.textM}}>Create your first {bookType} cash book to start tracking</p>
        <button onClick={()=>setShowNewBook(true)} className="mt-3 px-4 py-2 rounded-xl text-xs font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>+ Create Book</button>
      </div>
    :<div className="space-y-2">{filteredBooks.map(book=>{
      const bIn=book.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);
      const bOut=book.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);
      const bal=bIn-bOut;
      return <Card key={book.id} className="p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]" style={{borderLeft:`4px solid ${book.color}`}}>
        <div className="flex items-center gap-3" onClick={()=>setActiveBook(book.id)}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{background:`${book.color}15`}}>{book.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2"><p className="text-sm font-bold" style={{color:TK.text}}>{book.name}</p>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase" style={{background:book.type==="business"?TK.infoBg:TK.accentBg,color:book.type==="business"?TK.info:TK.accent}}>{book.type}</span>
            </div>
            <p className="text-[10px] mt-0.5" style={{color:TK.textM}}>{book.tx.length} transactions • {book.members.length} members • Since {book.createdAt}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-extrabold" style={{color:bal>=0?TK.ok:TK.bad}}>{c} {fmt(bal)}</p>
            <div className="flex gap-2 mt-0.5">
              <span className="text-[9px]" style={{color:TK.ok}}>↓{c} {fmt(bIn)}</span>
              <span className="text-[9px]" style={{color:TK.bad}}>↑{c} {fmt(bOut)}</span>
            </div>
          </div>
          <button onClick={e=>{e.stopPropagation();deleteBook(book.id);}} className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all text-xs">✕</button>
        </div>
      </Card>;
    })}</div>}

    <Modal open={showNewBook} onClose={()=>setShowNewBook(false)} title={`New ${bookType==="business"?"Business":"Personal"} Book`}>
      <Inp label="Book Name" value={newBookName} onChange={setNewBookName} placeholder={bookType==="business"?"e.g. Coffee Shop, Import Business...":"e.g. Personal Wallet, Vacation Fund..."}/>
      <div className="mb-3">
        <label className="block text-[10px] font-bold mb-2 uppercase tracking-wider" style={{color:TK.textM}}>Choose Icon</label>
        <div className="flex flex-wrap gap-1.5">
          {BOOK_ICONS.map(ic=>(
            <button key={ic} onClick={()=>setNewBookIcon(ic)} className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all" style={{background:newBookIcon===ic?TK.accentBg:"transparent",border:`1px solid ${newBookIcon===ic?TK.accent:TK.border}`,transform:newBookIcon===ic?"scale(1.1)":"scale(1)"}}>{ic}</button>
          ))}
        </div>
      </div>
      <div className="p-3 rounded-xl mb-3 text-[11px]" style={{background:TK.muted,color:TK.textS}}>
        {bookType==="business"
          ?"Business books track sales, inventory, rent, salaries, and other commercial transactions. VAT and compliance rules apply."
          :"Personal books track salary, groceries, bills, entertainment, and other personal expenses. Great for budgeting."}
      </div>
      <button onClick={createBook} disabled={saving} className="w-full py-2.5 rounded-xl text-sm font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>{saving?"Creating...":"Create Book"}</button>
    </Modal>
  </div>;
};

interface InvLine { n: string; q: number; p: number; d: number }

const InvPg = ({R,cu,invoices,reload}: {R: RegionInfo; cu: CustItem[]; invoices: any[]; reload: () => void}) => {
  const c=R.cur;
  const [showC,setShowC]=useState(false);
  const [iCu,setICu]=useState("");const [iTm,setITm]=useState("net30");const [iAd,setIAd]=useState("");const [iNo,setINo]=useState("");
  const [its,setIts]=useState<InvLine[]>([{n:"",q:1,p:0,d:0}]);
  const [saving,setSaving]=useState(false);
  const addIt=()=>setIts(p=>[...p,{n:"",q:1,p:0,d:0}]);
  const upIt=(i: number,f: string,v: string)=>setIts(p=>p.map((x,j)=>j===i?{...x,[f]:f==="n"?v:parseFloat(v)||0}:x));
  const rmIt=(i: number)=>setIts(p=>p.filter((_,j)=>j!==i));
  const lines=its.map(x=>({...x,disc:x.q*x.p*(x.d/100),lt:x.q*x.p*(1-x.d/100)}));
  const sub=lines.reduce((s,x)=>s+x.lt,0);const vat=Math.round(sub*R.vr);const tot=sub+vat;

  const sinv = invoices.map(inv => ({
    id: inv.id,
    nm: inv.invoiceNo,
    cu: inv.customerId ? cu.find(c => c.id === inv.customerId)?.nm || "Unknown" : "Unknown",
    t: parseFloat(inv.total) || 0,
    s: inv.status,
  }));
  const sc: Record<string,string>={paid:TK.ok,unpaid:TK.warn,draft:TK.textM};

  const createInvoice=async()=>{
    setSaving(true);
    try {
      const no = `FEL-${String(invoices.length+1).padStart(3,"0")}`;
      await api.invoices.create({
        invoiceNo: no, invoiceDate: "2026-03-16", status: "draft",
        subtotal: sub, vatAmount: vat, total: tot, terms: iTm,
        billingAddress: iAd, notes: iNo, items: its,
        customerId: cu.find(x => x.nm === iCu)?.id || null,
      });
      reload();
      setShowC(false);setIts([{n:"",q:1,p:0,d:0}]);setICu("");setIAd("");setINo("");
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  return <div className="space-y-3">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div><h1 className="text-lg font-bold" style={{color:TK.text}}>{LL.invoices}</h1><p className="text-[10px]" style={{color:TK.textM}}>{R.fl} {R.auth} • {R.vl} • {R.fmt}</p></div>
      <div className="flex items-center gap-2"><Badge t={`${R.auth} ${R.eM?"Active":"Pilot"}`} c={R.eM?TK.ok:TK.warn}/>
        <button onClick={()=>setShowC(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>+ {LL.createInv}</button>
      </div>
    </div>
    <div className="p-3 rounded-xl text-[11px] font-semibold" style={{background:R.id==="EG"?TK.badBg:TK.infoBg,color:R.id==="EG"?TK.bad:TK.info,border:`1px solid ${R.id==="EG"?`${TK.bad}15`:`${TK.info}15`}`}}>
      🏛️ {R.id==="EG"?"ETA: Real-time XML/JSON • UUID+QR • GS1 codes • Digital sig • 7yr archival":"FTA: Tax invoices with TRN • Peppol CTC pilot July 2026 • Mandatory 2027 • 5yr archival"}
    </div>
    <div className="grid grid-cols-4 gap-2">{[["VAT",`${(R.vr*100)}%`,TK.accent],["Count",`${sinv.length}`,TK.text],["Unpaid",`${sinv.filter(x=>x.s==="unpaid").length}`,TK.warn],["Archive",`${R.arch}yr`,TK.info]].map(([l,v,cl],i)=><Card key={i} className="p-2.5 text-center"><p className="text-[8px] uppercase font-bold" style={{color:TK.textM}}>{l as string}</p><p className="text-lg font-black" style={{color:cl as string}}>{v as string}</p></Card>)}</div>
    {sinv.length===0?<div className="text-center py-10"><p className="text-3xl mb-2">📄</p><p className="text-sm font-semibold" style={{color:TK.textM}}>No invoices yet</p><p className="text-[11px] mt-1" style={{color:TK.textM}}>Create your first invoice to get started</p></div>
    :<div className="space-y-1.5">{sinv.map((inv,i)=><Card key={i} className="p-3.5 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:TK.accentBg}}>📄</div>
      <div className="flex-1"><p className="text-xs font-semibold" style={{color:TK.text}}>{inv.nm}</p><p className="text-[10px]" style={{color:TK.textM}}>{inv.cu}</p></div>
      <div className="text-right"><p className="text-xs font-bold" style={{color:TK.text}}>{c} {fmt(inv.t)}</p><span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase mt-0.5" style={{background:`${sc[inv.s]||TK.textM}12`,color:sc[inv.s]||TK.textM}}>{inv.s}</span></div>
    </Card>)}</div>}

    <Modal open={showC} onClose={()=>setShowC(false)} title={`${LL.createInv} — ${R.fl} ${R.auth}`} wide>
      <div className="p-2.5 rounded-xl mb-3 text-[10px]" style={{background:TK.accentBg,border:`1px solid ${TK.accent}20`,color:TK.textS}}>
        <strong style={{color:TK.accent}}>{R.n}:</strong> VAT {(R.vr*100)}% • {R.fmt} • {R.sig} {R.id==="EG"&&"• GS1 codes • Real-time ETA • UUID+QR"}{R.id==="AE"&&"• TRN required • Peppol CTC"}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Inp label="Customer" value={iCu} onChange={setICu} options={[{v:"",l:"— Select —"},...cu.map(x=>({v:x.nm,l:x.nm}))]}/>
        <Inp label={LL.invDate} value="2026-03-16" onChange={()=>{}} type="date"/>
        <Inp label={LL.terms} value={iTm} onChange={setITm} options={[{v:"net30",l:LL.net30},{v:"net60",l:LL.net60},{v:"due",l:LL.dueReceipt}]}/>
        <Inp label={LL.billAddr} value={iAd} onChange={setIAd} placeholder="123 Street, City"/>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{color:TK.textM}}>{LL.items} {R.id==="EG"&&"(GS1 code required)"}</p>
      <div className="rounded-xl overflow-hidden mb-2" style={{border:`1px solid ${TK.border}`}}>
        <div className="grid grid-cols-12 gap-0 p-2 text-[9px] uppercase font-bold tracking-wider" style={{background:TK.muted,color:TK.textM}}>
          <span className="col-span-4">{LL.itemName}</span><span className="col-span-1 text-center">{LL.qty}</span><span className="col-span-2 text-center">Price</span><span className="col-span-2 text-center">Disc %</span><span className="col-span-2 text-center">{LL.lineTotal}</span><span className="col-span-1"/>
        </div>
        {its.map((it,i)=><div key={i} className="grid grid-cols-12 gap-1 p-2 items-center" style={{borderTop:`1px solid ${TK.borderL}`}}>
          <input value={it.n} onChange={e=>upIt(i,"n",e.target.value)} placeholder="Product..." className="col-span-4 p-1.5 rounded-lg text-[11px] outline-none" style={{background:TK.muted,border:`1px solid ${TK.borderL}`,color:TK.text}}/>
          <input type="number" value={it.q||""} onChange={e=>upIt(i,"q",e.target.value)} className="col-span-1 p-1.5 rounded-lg text-[11px] text-center outline-none" style={{background:TK.muted,border:`1px solid ${TK.borderL}`,color:TK.text}}/>
          <input type="number" value={it.p||""} onChange={e=>upIt(i,"p",e.target.value)} className="col-span-2 p-1.5 rounded-lg text-[11px] text-center outline-none" style={{background:TK.muted,border:`1px solid ${TK.borderL}`,color:TK.text}}/>
          <input type="number" value={it.d||""} onChange={e=>upIt(i,"d",e.target.value)} placeholder="0" className="col-span-2 p-1.5 rounded-lg text-[11px] text-center outline-none" style={{background:TK.muted,border:`1px solid ${TK.borderL}`,color:TK.text}}/>
          <p className="col-span-2 text-[11px] font-bold text-center" style={{color:TK.text}}>{c} {fmt(lines[i]?.lt||0)}</p>
          <button onClick={()=>rmIt(i)} className="col-span-1 text-center text-red-400 hover:text-red-600 text-xs">✕</button>
        </div>)}
      </div>
      <button onClick={addIt} className="text-[11px] font-semibold flex items-center gap-1 mb-3" style={{color:TK.accent}}>+ {LL.addLine}</button>
      <div className="p-3 rounded-xl mb-3 space-y-1.5" style={{background:TK.muted}}>
        <div className="flex justify-between text-[11px]"><span style={{color:TK.textM}}>{LL.subtotal}</span><span className="font-semibold" style={{color:TK.text}}>{c} {fmt(sub)}</span></div>
        <div className="flex justify-between text-[11px]"><span style={{color:TK.textM}}>{LL.vat} ({(R.vr*100)}%)</span><span className="font-semibold" style={{color:TK.text}}>{c} {fmt(vat)}</span></div>
        {lines.some(x=>x.d>0)&&<div className="flex justify-between text-[11px]"><span style={{color:TK.textM}}>Discount</span><span className="font-semibold" style={{color:TK.bad}}>-{c} {fmt(lines.reduce((s,x)=>s+x.disc,0))}</span></div>}
        <div className="flex justify-between text-sm font-bold pt-1.5" style={{borderTop:`1px solid ${TK.border}`}}><span style={{color:TK.accent}}>{LL.total}</span><span style={{color:TK.accent}}>{c} {fmt(tot)}</span></div>
      </div>
      <Inp label={LL.notes} value={iNo} onChange={setINo} placeholder="Payment terms, bank details..."/>
      <div className="grid grid-cols-4 gap-2 mt-3">
        {[["👁 Preview",TK.muted,TK.textS],["🖨 Print",TK.muted,TK.textS],["💾 Draft",TK.muted,TK.textS]].map(([l,bg,cl],i)=><button key={i} className="py-2 rounded-xl text-[11px] font-semibold" style={{background:bg as string,color:cl as string,border:`1px solid ${TK.border}`}}>{l as string}</button>)}
        <button onClick={createInvoice} disabled={saving} className="py-2 rounded-xl text-[11px] font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>{saving?"...":"📨 "+( R.id==="EG"?"Submit ETA":"Send")}</button>
      </div>
    </Modal>
  </div>;
};

interface ChatMsg { r: string; t: string }

const AiPg = ({R,books,cu}: {R: RegionInfo; books: CashBook[]; cu: CustItem[]}) => {
  const c=R.cur;
  const allTx=books.flatMap(b=>b.tx);
  const tI=allTx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);
  const tO=allTx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);
  const bal=tI-tO;
  const bizBooks=books.filter(b=>b.type==="business");
  const perBooks=books.filter(b=>b.type==="personal");
  const overdueCustomers=cu.filter(x=>x.ow>0);
  const topExpenseCat=useMemo(()=>{const m: Record<string,number>={};allTx.filter(t=>t.ty==="out").forEach(t=>{m[t.cat]=(m[t.cat]||0)+t.am;});return Object.entries(m).sort((a,b)=>b[1]-a[1]);}, [allTx]);

  const [msgs,setMsgs]=useState<ChatMsg[]>([{r:"ai",t:`Hi! I'm Feloosak AI, your finance assistant for ${R.n} ${R.fl}. I can help with:\n\n• **Cash flow analysis** across your ${books.length} books\n• **VAT & tax** calculations (${R.vl})\n• **${R.auth} compliance** & e-invoicing\n• **Customer tracking** & overdue alerts\n• **Budget insights** & expense analysis\n• **Cash book management** tips\n\nAsk me anything! 💰`}]);
  const [inp,setInp]=useState("");const [typ,setTyp]=useState(false);const ref=useRef<HTMLDivElement>(null);
  const [quickQ]=useState(["What's my cash flow?","VAT breakdown","Overdue customers","Top expenses","Compare my books","Tax liability","Budget advice","Invoice tips"]);

  const send=(text?: string)=>{
    const q=(text||inp).trim();if(!q)return;setMsgs(p=>[...p,{r:"u",t:q}]);setInp("");setTyp(true);
    setTimeout(()=>{const lo=q.toLowerCase();let r: string;
      if(lo.includes("cash flow")||lo.includes("flow")||lo.includes("overview")||lo.includes("summary")){
        const bestBook=books.length>0?books.reduce((a,b)=>{const bi=b.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0)-b.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);const ai=a.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0)-a.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);return bi>ai?b:a;}):null;
        r=`📊 **Cash Flow Summary**\n\nTotal across **${books.length} books**: **${c} ${fmt(bal)}** net\n• Income: **${c} ${fmt(tI)}**\n• Expenses: **${c} ${fmt(tO)}**\n• Cash flow ratio: **${(tI/Math.max(tO,1)*100).toFixed(0)}%**\n\n${bestBook?`🏆 Best performing: **${bestBook.icon} ${bestBook.name}**\n\n`:""} ${bal>0?"✅ Positive cash flow — healthy position.":"⚠️ Negative cash flow — review expenses urgently."}`;
      }
      else if(lo.includes("vat")||lo.includes("ضريبة")){
        const oV=Math.round(tI*R.vr);const iV=Math.round(tO*R.vr);const nV=oV-iV;
        r=`🧾 **VAT Breakdown (${R.vl})**\n\n• Output VAT (on sales): **${c} ${fmt(oV)}**\n• Input VAT (on purchases): **${c} ${fmt(iV)}**\n• **Net VAT Payable: ${c} ${fmt(nV)}**\n\n${R.id==="EG"?"📅 Filing: Monthly via ETA portal, due 2 months after period end.\n\n💡 **Tip**: Keep all purchase invoices — you can claim input VAT to reduce your liability.":"📅 Filing: Quarterly/monthly via FTA portal, due 28 days after period.\n\n⚠️ **2026 Updates**: 5-year refund deadline now applies. Verify supplier TRN before claiming input VAT."}`;
      }
      else if(lo.includes("tax")||lo.includes("corporate")||lo.includes("income tax")){
        const ct=R.id==="EG"?Math.round(Math.max(0,bal)*R.ct):Math.round(Math.max(0,bal-R.ctT)*R.ct);
        r=`🏛️ **Tax Liability (${R.n})**\n\n• Taxable profit: **${c} ${fmt(Math.max(0,bal))}**\n${R.id==="AE"?`• Threshold: ${c} 375,000 (0% below)\n• Rate: 9% above threshold\n`:`• Rate: 22.5% flat\n`}• **Estimated tax: ${c} ${fmt(ct)}**\n\n${R.id==="EG"?"📅 Annual filing by April 30. Quarterly advance payments may apply for large businesses.\n\n💡 Deductible expenses: salaries, rent, depreciation, bad debts (documented).":"📅 Filing: 9 months after financial year end.\n\n💡 Small business relief available if revenue < AED 3M."}`;
      }
      else if(lo.includes("overdue")||lo.includes("customer")||lo.includes("owe")||lo.includes("receivable")||lo.includes("عميل")){
        const totalOwed=overdueCustomers.reduce((s,x)=>s+x.ow,0);
        r=`👥 **Customer Receivables**\n\n${overdueCustomers.length>0?`⚠️ **${overdueCustomers.length} customers** owe **${c} ${fmt(totalOwed)}**:\n\n${overdueCustomers.map(x=>`• **${x.nm}**: ${c} ${fmt(x.ow)} (Trust: ${x.tr}%${x.tr<80?" ⚠️ LOW":""})`).join("\n")}\n\n💡 **Recommendations**:\n${overdueCustomers.filter(x=>x.tr<80).map(x=>`• ${x.nm}: Consider payment plan or advance deposits`).join("\n")}\n• Send automated reminders via ${R.auth}`:`✅ All customers are clear!\n\n${cu.length} active customers with avg trust: **${cu.length>0?Math.round(cu.reduce((s,x)=>s+x.tr,0)/cu.length):0}%**`}`;
      }
      else if(lo.includes("expense")||lo.includes("spending")||lo.includes("cost")||lo.includes("مصاريف")){
        r=`📉 **Expense Analysis**\n\nTotal expenses: **${c} ${fmt(tO)}**\n\nTop categories:\n${topExpenseCat.slice(0,5).map(([cat,val],i)=>`${i+1}. **${LL[cat]||cat}**: ${c} ${fmt(val)} (${(val/tO*100).toFixed(1)}%)`).join("\n")}\n\n💡 **Insights**:\n${topExpenseCat[0]?`• Largest: **${LL[topExpenseCat[0][0]]||topExpenseCat[0][0]}** at ${(topExpenseCat[0][1]/tO*100).toFixed(0)}%`:""}\n• Review recurring costs quarterly`;
      }
      else if(lo.includes("compare")||lo.includes("book")||lo.includes("entity")){
        r=`📚 **Cash Book Comparison**\n\n**Business** (${bizBooks.length}):\n${bizBooks.map(b=>{const bi=b.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);const bo=b.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);return `• ${b.icon} **${b.name}**: Net ${c} ${fmt(bi-bo)} (${b.tx.length} tx)`;}).join("\n")}\n\n**Personal** (${perBooks.length}):\n${perBooks.map(b=>{const bi=b.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);const bo=b.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);return `• ${b.icon} **${b.name}**: Net ${c} ${fmt(bi-bo)} (${b.tx.length} tx)`;}).join("\n")}`;
      }
      else if(lo.includes("budget")||lo.includes("save")||lo.includes("saving")){
        const savingsRate=bal>0?((bal/tI)*100).toFixed(1):"0";
        r=`💰 **Budget & Savings**\n\n• Savings rate: **${savingsRate}%**\n• ${parseFloat(savingsRate)>20?"✅ Excellent!":parseFloat(savingsRate)>10?"⚠️ Fair. Aim for 20%.":"❌ Low. Review spending."}\n\n**Tips for ${R.n}:**\n• Reserve **${(R.vr*100)}%** for VAT\n• Emergency fund: 3-6 months costs\n• ${R.id==="EG"?"T-Bills ~22% yield":"UAE Sukuk 4-5% yield"}`;
      }
      else if(lo.includes("invoice")||lo.includes("فاتورة")){
        r=`📄 **Invoicing (${R.n})**\n\n**${R.auth} Requirements:**\n• Format: ${R.fmt}\n• Signature: ${R.sig}\n• Archive: ${R.arch} years\n${R.id==="EG"?"• GS1 codes, UUID+QR, real-time ETA":"• TRN required, Peppol CTC pilot July 2026"}\n\n**Tips:**\n• Send within 24h of delivery\n• Follow up at 7, 14, 21 days`;
      }
      else {
        r=`Try asking about:\n• **"Cash flow"** — overview\n• **"VAT breakdown"** — ${R.vl}\n• **"Tax liability"** — corporate tax\n• **"Overdue customers"** — receivables\n• **"Top expenses"** — analysis\n• **"Compare books"** — book comparison\n• **"Budget advice"** — savings tips\n• **"Invoice tips"** — ${R.auth} guide`;
      }
      setMsgs(p=>[...p,{r:"ai",t:r}]);setTyp(false);
    },1200);
  };
  useEffect(()=>{ref.current&&(ref.current.scrollTop=ref.current.scrollHeight);},[msgs,typ]);

  const vari=[{c:"Revenue",cur:tI,pri:Math.round(tI*0.88),ch:"+13.6%",cl:TK.ok},{c:"Salaries",cur:7500,pri:6800,ch:"+10.3%",cl:TK.bad},{c:"Inventory",cur:3200,pri:4100,ch:"-22.0%",cl:TK.ok},{c:"Rent",cur:5000,pri:5000,ch:"0%",cl:TK.textM}];

  return <div className="space-y-4">
    <h1 className="text-lg font-bold" style={{color:TK.text}}>{LL.ai} — {R.fl} {R.n}</h1>
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-1"><span className="text-sm">⚡</span><p className="text-[9px] uppercase font-bold tracking-widest" style={{color:TK.textM}}>AI ANALYSIS</p></div>
      <h3 className="text-sm font-bold mb-3" style={{color:TK.text}}>{LL.varianceAi}</h3>
      <div className="rounded-xl overflow-hidden mb-3" style={{border:`1px solid ${TK.border}`}}>
        <div className="grid grid-cols-4 p-2.5 text-[9px] uppercase font-bold" style={{background:TK.muted,color:TK.textM}}><span>Category</span><span className="text-right">Current</span><span className="text-right">Prior</span><span className="text-right">Change</span></div>
        {vari.map((v,i)=><div key={i} className="grid grid-cols-4 p-2.5" style={{borderTop:`1px solid ${TK.borderL}`,borderLeft:v.ch.startsWith("+")&&v.c!=="Revenue"?`3px solid ${TK.bad}`:"3px solid transparent"}}>
          <span className="text-[11px] font-semibold" style={{color:TK.text}}>{v.c}</span>
          <span className="text-[11px] text-right font-semibold" style={{color:TK.text}}>{c} {fmt(v.cur)}</span>
          <span className="text-[11px] text-right" style={{color:TK.textM}}>{c} {fmt(v.pri)}</span>
          <span className="text-[11px] text-right font-bold" style={{color:v.cl}}>{v.ch}</span>
        </div>)}
      </div>
      <div className="p-3 rounded-xl" style={{background:TK.accentBg,border:`1px solid ${TK.accent}20`}}>
        <div className="flex items-start gap-2"><span>⚡</span><div><p className="text-[9px] font-bold" style={{color:TK.accent}}>{LL.aiGen}</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{color:TK.textS}}>Salaries up <strong style={{color:TK.bad}}>+10.3%</strong>. Inventory down 22% — supplier renegotiation successful. Across <strong>{books.length} books</strong>, net position: <strong style={{color:bal>=0?TK.ok:TK.bad}}>{c} {fmt(bal)}</strong>.</p></div></div>
      </div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><span className="text-sm">💬</span><h3 className="text-sm font-bold" style={{color:TK.text}}>Ask Anything</h3></div>
        <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:TK.okBg,color:TK.ok}}>AI Online</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {quickQ.map(q=><button key={q} onClick={()=>send(q)} className="px-2.5 py-1 rounded-full text-[10px] font-medium hover:shadow-sm transition-all" style={{background:TK.muted,color:TK.textS,border:`1px solid ${TK.borderL}`}}>{q}</button>)}
      </div>
      <div ref={ref} className="space-y-2 mb-3 max-h-[300px] overflow-y-auto">
        {msgs.map((m,i)=><div key={i} className={`flex ${m.r==="u"?"justify-end":"justify-start"}`}>
          <div className="max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line" style={{background:m.r==="u"?TK.accent:TK.muted,color:m.r==="u"?"#1A1510":TK.text,borderBottomRightRadius:m.r==="u"?4:16,borderBottomLeftRadius:m.r==="ai"?4:16}}>
            {m.t.split("**").map((p,j)=>j%2===1?<strong key={j}>{p}</strong>:p)}</div>
        </div>)}
        {typ&&<div className="flex justify-start"><div className="p-3 rounded-2xl" style={{background:TK.muted}}><div className="flex gap-1 items-center"><div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{background:TK.accent,animationDelay:`${i*0.15}s`}}/>)}</div><span className="text-[10px] ml-2" style={{color:TK.textM}}>Analyzing...</span></div></div></div>}
      </div>
      <div className="flex gap-2">
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={LL.askAi} className="flex-1 p-2.5 rounded-xl text-xs outline-none" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}/>
        <button onClick={()=>send()} className="px-4 rounded-xl text-sm font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>→</button>
      </div>
    </Card>
  </div>;
};

const CompPg = ({R,books}: {R: RegionInfo; books: CashBook[]}) => {
  const allTx=books.flatMap(b=>b.tx);
  const c=R.cur;const tI=allTx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);const tO=allTx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);const pr=tI-tO;
  const oV=Math.round(tI*R.vr);const iV=Math.round(tO*R.vr);const nV=oV-iV;
  const ct=R.id==="EG"?Math.round(Math.max(0,pr)*R.ct):Math.round(Math.max(0,pr-R.ctT)*R.ct);

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><div><h1 className="text-lg font-bold" style={{color:TK.text}}>{R.fl} Compliance — {R.n}</h1><p className="text-[10px]" style={{color:TK.textM}}>{R.auth} • {R.vl}</p></div><Badge t={R.eM?"Active":"Pilot"} c={R.eM?TK.ok:TK.warn}/></div>
    <Card className="p-4"><h3 className="text-sm font-bold mb-1" style={{color:TK.text}}>{LL.vatSum} — {R.vl}</h3>
      <div className="grid grid-cols-3 gap-2 mt-3">{[[LL.outVat,oV,TK.ok,TK.okBg],[LL.inVat,iV,TK.bad,TK.badBg],[LL.netVat,nV,TK.accent,TK.accentBg]].map(([l,v,cl,bg],i)=>
        <div key={i} className="p-3 rounded-xl text-center" style={{background:bg as string}}><p className="text-[9px] font-bold" style={{color:cl as string}}>{l as string}</p><p className="text-base font-black mt-0.5" style={{color:TK.text}}>{c} {fmt(v as number)}</p></div>
      )}</div></Card>
    <Card className="p-4"><h3 className="text-sm font-bold mb-1" style={{color:TK.text}}>{LL.corpTax} — {R.id==="EG"?"22.5% flat":"0%→9% (AED 375K)"}</h3>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="p-3 rounded-xl" style={{background:TK.muted}}><p className="text-[9px] font-bold" style={{color:TK.textM}}>Taxable Profit</p><p className="text-base font-black" style={{color:TK.text}}>{c} {fmt(Math.max(0,pr))}</p>{R.id==="AE"&&pr<=R.ctT&&<p className="text-[9px] mt-0.5" style={{color:TK.ok}}>Below threshold ✓</p>}</div>
        <div className="p-3 rounded-xl" style={{background:TK.accentBg}}><p className="text-[9px] font-bold" style={{color:TK.accent}}>Est. Tax</p><p className="text-base font-black" style={{color:TK.accent}}>{c} {fmt(ct)}</p></div>
      </div></Card>
    {R.id==="AE"&&R.v26&&<Card className="p-4" style={{background:TK.warnBg,borderColor:`${TK.warn}20`}}>
      <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{color:TK.warn}}>⚠️ UAE 2026 VAT Amendments</h3>
      <div className="space-y-1.5">{R.v26.map((a,i)=><div key={i} className="p-2.5 rounded-xl bg-white"><p className="text-[11px] font-bold" style={{color:TK.text}}>{a.t}</p><p className="text-[10px] mt-0.5" style={{color:TK.textM}}>{a.d}</p></div>)}</div>
    </Card>}
    <Card className="p-4"><h3 className="text-sm font-bold mb-3 flex items-center gap-1.5" style={{color:TK.text}}>📅 {LL.taxCal}</h3>
      <div className="space-y-1.5">{R.cal.map((ev,i)=><div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{background:TK.muted}}>
        <span className="text-xs">{ev.r?"🔄":"⏰"}</span>
        <div className="flex-1"><p className="text-[11px] font-semibold" style={{color:TK.text}}>{ev.e}</p><p className="text-[10px]" style={{color:TK.textM}}>Deadline: {ev.d}</p></div>
        <Badge t={ev.r?"Recurring":"One-time"} c={ev.r?TK.info:TK.warn}/>
      </div>)}</div></Card>
  </div>;
};

const SetPg = ({R,user,setReg,onLogout}: {R: RegionInfo; user: UserData; setReg: (r: RegionKey) => void; onLogout: () => void}) => {
  const handleRegion=async(r: RegionKey)=>{
    try { await api.auth.updateProfile({ region: r }); setReg(r); } catch(e) { console.error(e); }
  };
  return <div className="space-y-4">
    <h1 className="text-lg font-bold" style={{color:TK.text}}>{LL.settings}</h1>
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-xl" style={{background:TK.accentBg}}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{background:`${TK.accent}20`,color:TK.accent}}>{user.avatar || user.name.charAt(0)}</div>
        <div><p className="text-sm font-bold" style={{color:TK.text}}>{user.name}</p><p className="text-[10px]" style={{color:TK.textM}}>{user.email}</p></div>
      </div>
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${TK.accent}12`}}>📍</div><div><p className="text-xs font-semibold" style={{color:TK.text}}>{LL.region}</p><p className="text-[10px]" style={{color:TK.textM}}>{R.fl} {R.n} • {R.auth} • {R.vl}</p></div></div>
        <div className="flex rounded-xl overflow-hidden" style={{border:`1px solid ${TK.border}`}}>{(["EG","AE"] as RegionKey[]).map(r=><button key={r} onClick={()=>handleRegion(r)} className="px-3 py-1.5 text-[11px] font-bold" style={{background:R.id===r?TK.accent:"transparent",color:R.id===r?"#fff":TK.textM}}>{RG[r].fl} {r}</button>)}</div>
      </div>
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${TK.ok}12`}}>🛡</div><div><p className="text-xs font-semibold" style={{color:TK.text}}>{R.auth}</p><p className="text-[10px]" style={{color:TK.textM}}>{R.fmt} • {R.eM?"Mandatory":"Pilot"}</p></div></div>
        <Badge t={R.eM?"Active":"Pilot"} c={R.eM?TK.ok:TK.warn}/></div>
    </Card>
    <Card className="p-4"><h3 className="text-xs font-bold mb-3" style={{color:TK.text}}>🇪🇬 vs 🇦🇪 Comparison</h3>
      <div className="space-y-1">{[["VAT","14%","5%"],["Corp Tax","22.5% flat","0%→9%"],["E-Invoice","ETA Mandatory","FTA Pilot 2026"],["Archival","7 years","5 years"],["Social Ins","11%+18.75%","5%+12.5% (nationals)"]].map(([l,eg,ae],i)=>
        <div key={i} className="grid grid-cols-3 text-[10px] p-1.5 rounded" style={{background:i%2===0?TK.muted:"transparent"}}>
          <span className="font-bold" style={{color:TK.text}}>{l}</span><span style={{color:R.id==="EG"?TK.accent:TK.textM}}>{eg}</span><span style={{color:R.id==="AE"?TK.accent:TK.textM}}>{ae}</span>
        </div>)}</div></Card>
    <button onClick={onLogout} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold" style={{color:TK.bad,border:`1px solid ${TK.bad}20`}}>🚪 {LL.logout}</button>
  </div>;
};

export default function App(){
  const [user,setUser]=useState<UserData|null>(null);
  const [authChecked,setAuthChecked]=useState(false);
  const [reg,setReg]=useState<RegionKey | null>(null);
  const [pg,setPg]=useState("dash");
  const [sb,setSb]=useState(true);
  const [books,setBooks]=useState<CashBook[]>([]);
  const [customers,setCustomers]=useState<CustItem[]>([]);
  const [invoices,setInvoices]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    api.auth.me().then(data=>{
      setUser(data.user);
      setReg((data.user.region || "EG") as RegionKey);
    }).catch(()=>{}).finally(()=>setAuthChecked(true));
  },[]);

  const loadData=useCallback(async()=>{
    if(!user) return;
    setLoading(true);
    try {
      const [booksData, custData, invData] = await Promise.all([
        api.books.list(),
        api.customers.list(),
        api.invoices.list(),
      ]);
      setBooks(booksData.map(mapBookFromApi));
      setCustomers(custData.map(mapCustomerFromApi));
      setInvoices(invData);
    } catch(e) { console.error(e); }
    setLoading(false);
  },[user]);

  useEffect(()=>{if(user) loadData();},[user, loadData]);

  const handleLogin=async(u: UserData)=>{
    setUser(u);
    setReg((u.region || "EG") as RegionKey);
    await api.seed().catch(()=>{});
  };

  const handleLogout=async()=>{
    await api.auth.logout().catch(()=>{});
    setUser(null); setReg(null); setBooks([]); setCustomers([]); setInvoices([]);
  };

  if(!authChecked) return <div className="min-h-screen flex items-center justify-center" style={{background:TK.bg}}><Spinner/></div>;
  if(!user) return <Login onLogin={handleLogin}/>;
  if(!reg) return <RegSel onSel={async(r)=>{setReg(r);try{await api.auth.updateProfile({region:r});}catch(e){}}}/>;
  const R=RG[reg];

  const nav=[{id:"dash",i:"📊",l:LL.dashboard},{id:"cash",i:"📒",l:LL.cash},{id:"inv",i:"📄",l:LL.invoices},{id:"ai",i:"⚡",l:LL.ai},{id:"comp",i:"⚖️",l:LL.compliance},{id:"set",i:"⚙️",l:LL.settings}];

  const page=()=>{
    if(loading && books.length===0) return <Spinner/>;
    switch(pg){
      case "dash":return <Dash R={R} books={books} cu={customers}/>;
      case "cash":return <CashBookPg R={R} books={books} reload={loadData} cu={customers}/>;
      case "inv":return <InvPg R={R} cu={customers} invoices={invoices} reload={loadData}/>;
      case "ai":return <AiPg R={R} books={books} cu={customers}/>;
      case "comp":return <CompPg R={R} books={books}/>;
      case "set":return <SetPg R={R} user={user} setReg={setReg} onLogout={handleLogout}/>;
      default:return null;
    }
  };

  return <div className="flex h-screen overflow-hidden" style={{background:TK.bg,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
    <aside className={`${sb?"w-52":"w-14"} transition-all duration-300 flex flex-col bg-white border-r shrink-0`} style={{borderColor:TK.border}}>
      <div className={`p-3 flex items-center ${sb?"gap-2.5":"justify-center"}`}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black" style={{background:"linear-gradient(135deg,#C8A630,#E8C840)",color:"#1A1510"}}>ف</div>
        {sb&&<div><p className="text-xs font-bold" style={{color:TK.accent}}>Feloosak</p><p className="text-[8px]" style={{color:TK.textM}}>{R.fl} {R.n} • {R.cur}</p></div>}
      </div>
      <nav className="flex-1 px-1.5 space-y-0.5 mt-1">{nav.map(n=>{const a=pg===n.id;return <button key={n.id} onClick={()=>setPg(n.id)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] transition-all ${sb?"":"justify-center"}`} style={{background:a?TK.accentBg:"transparent",color:a?TK.accentD:TK.textS,fontWeight:a?700:500}}>
        <span className="text-sm">{n.i}</span>{sb&&<span>{n.l}</span>}
      </button>;})}</nav>
      <div className="p-2"><button onClick={()=>setSb(!sb)} className="w-full p-1.5 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 text-sm">{sb?"◂":"▸"}</button></div>
    </aside>
    <main className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-5 py-2.5 bg-white border-b shrink-0" style={{borderColor:TK.border}}>
        <div className="flex items-center gap-3">
          <div className="relative"><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span><input placeholder={LL.search} className="pl-8 pr-3 py-1.5 rounded-xl text-xs w-48 outline-none" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}/></div>
          <span className="px-2.5 py-1 rounded-full text-[9px] font-bold" style={{background:R.id==="EG"?TK.badBg:TK.okBg,color:R.id==="EG"?"#C8102E":"#00732F"}}>{R.fl} {R.auth} • {R.vl}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative cursor-pointer">🔔<span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full" style={{background:TK.bad}}/></span>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{background:TK.accentBg,color:TK.accent}}>{user.avatar||user.name.charAt(0)}</div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-5">{page()}</div>
    </main>
  </div>;
}
