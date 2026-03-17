import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { api } from "./api";
import logoImg from "@assets/1773704760591_1773708627320.png";
import FelosakWebsite from "./Website";

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
interface EInvField { l: string; d: string }
interface SMETier { max: number; rate: string }
interface RegionInfo {
  id: string; n: string; ar: string; fl: string; cur: string;
  vr: number; vl: string; auth: string; ct: number; ctT: number;
  eM: boolean; fmt: string; sig: string; arch: number; pc: string; rt: boolean;
  pays: string[]; cal: CalEvent[]; v26: V26Item[] | null;
  tin?: string; profVat?: number; vatThreshold?: number; wht?: string;
  eInvModel?: string; eInvFields?: EInvField[];
  smeTiers?: SMETier[]; smeThreshold?: number;
  uinLen?: number; socialIns?: string;
  implSteps?: string[];
}

const RG: Record<RegionKey, RegionInfo> = {
  EG:{id:"EG",n:"Egypt",ar:"مصر",fl:"🇪🇬",cur:"EGP",vr:0.14,vl:"VAT 14%",auth:"ETA",ct:0.225,ctT:0,eM:true,fmt:"XML/JSON",sig:"E-Signature/E-Seal",arch:5,pc:"GS1 GPC",rt:true,
    tin:"9-digit TIN",profVat:0.10,vatThreshold:500000,wht:"1%–3% on services",
    eInvModel:"Clearance (real-time ETA validation)",
    eInvFields:[
      {l:"UUID",d:"Unique Universal Identifier per invoice"},
      {l:"Seller & Buyer TIN",d:"Validated 9-digit Tax ID for both parties (B2B)"},
      {l:"Buyer Info",d:"Name, Address, Phone number"},
      {l:"Item Codes",d:"GS1 or GPC coding standards for each line item"},
      {l:"UIN",d:"39-character Unique Identification Number (since Nov 2024)"},
      {l:"QR Code",d:"Machine-readable code for verification"},
      {l:"E-Signature",d:"Digital signature via licensed provider (Egypt Trust, Misr Technology)"},
    ],
    smeTiers:[{max:250000,rate:"0.4%"},{max:500000,rate:"0.5%"},{max:1000000,rate:"0.75%"},{max:2000000,rate:"1.0%"},{max:3000000,rate:"1.25%"},{max:10000000,rate:"1.5%"},{max:20000000,rate:"1.5%"}],
    smeThreshold:20000000,uinLen:39,socialIns:"11% employee + 18.75% employer",
    implSteps:[
      "Obtain Digital Signature/Seal from licensed provider (Egypt Trust, Misr Technology)",
      "Register on ETA Portal & set up company profile",
      "Integrate billing system (API) with ETA SDK for real-time UUID generation",
      "Map all products/services to GS1/GPC codes",
      "Enable automated VAT (14%) & WHT (1%–3%) calculation on invoices",
      "Implement B2B buyer TIN + UIN (39-char) validation",
    ],
    pays:["Fawry","Vodafone Cash","InstaPay","Paymob","Meeza"],
    cal:[
      {e:"Monthly VAT Return",d:"Within 30 days after tax period end",r:true},
      {e:"Annual Corporate Tax Return",d:"April 30",r:true},
      {e:"Withholding Tax Filing",d:"Quarterly",r:true},
      {e:"Payroll Tax Reconciliation",d:"Annual",r:true},
      {e:"E-Receipt (B2C) POS Integration",d:"Mandatory for all sectors",r:false},
    ],
    v26:[
      {t:"Law 5 & 6 of 2025 — SME Incentives",d:"Turnover ≤ EGP 20M: simplified fixed-rate tax (0.4%–1.5% of revenue) instead of 22.5% CIT. Stamp duty exemptions & reduced compliance."},
      {t:"UIN Validation (Nov 2024)",d:"39-character Unique Identification Number required alongside TIN for all B2B transactions to prevent VAT fraud."},
      {t:"E-Receipts (B2C) Expansion",d:"Mandatory POS integration with ETA for B2C transactions across all sectors."},
      {t:"Non-Resident Digital Services",d:"Foreign vendors providing digital/remote services exceeding EGP 500,000 annually must register for VAT with the ETA."},
      {t:"5-Year Record Retention",d:"All accounting records, invoices & receipts must be retained for 5 years. Offshore storage permitted if accessible to ETA."},
      {t:"Professional Services VAT 10%",d:"Reduced VAT rate of 10% applies to professional and consultancy services instead of standard 14%."},
    ]},
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
  trend:"Monthly Trend",askAi:"Ask felosak anything...",
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
interface CustItem { id: number; nm: string; ph: string; em: string; addr: string; tin: string; ow: number; pd: number; tr: number }
interface UserData { id: number; email: string; name: string; region: string; avatar: string; bankName?: string; bankAccount?: string; bankIban?: string; bankSwift?: string; paymentLink?: string; businessName?: string; businessPhone?: string; businessAddress?: string; taxId?: string }

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
  return { id: c.id, nm: c.name, ph: c.phone || "", em: c.email || "", addr: c.address || "", tin: c.tin || "", ow: parseFloat(c.owed) || 0, pd: parseFloat(c.paid) || 0, tr: c.trust || 50 };
}

function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function addDays(dateStr: string, days: number) { const d = new Date(dateStr); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function getDueDate(dateStr: string, terms: string) { if (terms === "due") return dateStr; if (terms === "net60") return addDays(dateStr, 60); return addDays(dateStr, 30); }
function isOverdue(dueDate: string) { if (!dueDate) return false; return new Date(dueDate) < new Date(todayStr()); }
function numToWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if (n < 0) return "Minus " + numToWords(-n);
  const intPart = Math.floor(n); const decPart = Math.round((n - intPart) * 100);
  let result = "";
  if (intPart >= 1000000) { result += numToWords(Math.floor(intPart / 1000000)) + " Million "; const rem = intPart % 1000000; if (rem > 0) result += numToWords(rem); }
  else if (intPart >= 1000) { result += numToWords(Math.floor(intPart / 1000)) + " Thousand "; const rem = intPart % 1000; if (rem > 0) result += numToWords(rem); }
  else if (intPart >= 100) { result += ones[Math.floor(intPart / 100)] + " Hundred "; const rem = intPart % 100; if (rem > 0) result += numToWords(rem); }
  else if (intPart >= 20) { result += tens[Math.floor(intPart / 10)]; const rem = intPart % 10; if (rem > 0) result += "-" + ones[rem]; }
  else if (intPart > 0) result += ones[intPart];
  result = result.trim();
  if (decPart > 0) result += ` and ${decPart}/100`;
  return result || "Zero";
}

const Card = ({children,className="",style={},onClick}: {children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void}) => (
  <div className={`rounded-2xl bg-white ${className}`} style={{border:`1px solid ${TK.border}`,boxShadow:TK.sh,...style}} onClick={onClick}>{children}</div>
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
    <div class="footer">felosak — AI Finance Super App • ${RG[reg].fl} ${RG[reg].n} • ${RG[reg].auth} • www.felosak.com</div>
    <script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
  w.document.close();
};

const Login = ({onLogin, onBack}: {onLogin: (user: UserData) => void; onBack?: () => void}) => {
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
        <img src={logoImg} alt="felosak" className="h-8" style={{filter:"brightness(0) invert(1)"}}/>
        {onBack&&<button onClick={onBack} className="text-[10px] font-semibold px-3 py-1 rounded-full" style={{background:"#C8A63020",color:"#C8A630"}}>← Website</button>}
      </div>
      <div>
        <h2 className="text-3xl font-black leading-tight text-white mb-3">The financial<br/>brain for every<br/>MENA business</h2>
        <p className="text-sm leading-relaxed" style={{color:"#A89878"}}>AI-powered finance intelligence for Egypt & UAE. Cash management, e-invoicing, VAT automation.</p>
        <div className="flex flex-wrap gap-2 mt-6">
          {["ETA Compliant","FTA Ready","Offline-First","Arabic-Native"].map(t=><span key={t} className="px-3 py-1.5 rounded-full text-[9px] font-bold" style={{background:"#C8A63015",color:"#C8A630",border:"1px solid #C8A63025"}}>{t}</span>)}
        </div>
      </div>
      <p className="text-[10px]" style={{color:"#6B5B40"}}>© 2026 felosak · www.felosak.com</p>
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full" style={{background:"#C8A63008"}}/>
    </div>
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="lg:hidden flex items-center justify-between mb-6">
          <img src={logoImg} alt="felosak" className="h-6"/>
          {onBack&&<button onClick={onBack} className="text-[11px] font-semibold" style={{color:TK.textM}}>← Back</button>}
        </div>
        <h1 className="text-xl font-black mb-0.5" style={{color:TK.text}}>{mode==="login"?"Sign in":"Create account"}</h1>
        <p className="text-xs mb-6" style={{color:TK.textM}}>{mode==="login"?"Enter your credentials to continue":"Join felosak — free forever"}</p>
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
    <img src={logoImg} alt="felosak" className="h-10 mb-4"/>
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
              {[["VAT",`${Math.round(r.vr*100)}%`],["E-Invoice",r.auth],["Currency",r.cur],["Corp Tax",r.id==="AE"?`0%→9% (AED 375K)`:`${Math.round(r.ct*100)}%`]].map(([k,v])=>(
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

const Dash = ({R,books,cu,onNav}: {R: RegionInfo; books: CashBook[]; cu: CustItem[]; onNav: (pg: string) => void}) => {
  const c=R.cur;
  const allTx = books.flatMap(b=>b.tx);
  const tI=allTx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);
  const tO=allTx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);
  const bal=tI-tO;
  const owd=cu.reduce((s,x)=>s+x.ow,0);
  const catD=useMemo(()=>{const m: Record<string,number>={};allTx.filter(t=>t.ty==="out").forEach(t=>{m[t.cat]=(m[t.cat]||0)+t.am;});return Object.entries(m).map(([n,v])=>({name:LL[n]||n,value:v})).sort((a,b)=>b.value-a.value).slice(0,5);},[allTx]);
  const monthlyData=useMemo(()=>{
    const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const m: Record<string,{i:number,e:number}>={};months.forEach(mo=>m[mo]={i:0,e:0});
    allTx.forEach(t=>{const mo=t.dt.split(" ")[0];if(m[mo]){if(t.ty==="in")m[mo].i+=t.am;else m[mo].e+=t.am;}});
    return months.filter(mo=>m[mo].i>0||m[mo].e>0).map(mo=>({m:mo,i:m[mo].i,e:m[mo].e}));
  },[allTx]);
  const chartData = monthlyData.length > 0 ? monthlyData : MO;
  const profitPct = tO > 0 ? ((bal / tO) * 100).toFixed(1) : "0";

  return <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-xl font-extrabold" style={{color:TK.text}}>{LL.welcome} {R.fl}</h1><p className="text-xs" style={{color:TK.textM}}>{todayStr()} • {R.n} • {R.vl}</p></div>
      <Badge t={`${R.auth} ${R.eM?"Active":"Pilot"}`} c={R.eM?TK.ok:TK.warn}/>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[{i:"💰",l:LL.balance,v:`${c} ${fmt(bal)}`,ch:`${bal>=0?"+":""}${profitPct}%`,cl:TK.accent},{i:"📈",l:LL.income,v:`${c} ${fmt(tI)}`,ch:`${books.length} books`,cl:TK.ok},{i:"📉",l:LL.expense,v:`${c} ${fmt(tO)}`,ch:`${allTx.filter(t=>t.ty==="out").length} tx`,cl:TK.bad},{i:"💳",l:LL.receivable,v:`${c} ${fmt(owd)}`,ch:`${cu.filter(x=>x.ow>0).length} customers`,cl:TK.warn}].map((s,i)=>(
        <Card key={i} className="p-4"><div className="flex items-start justify-between mb-2"><span className="text-lg">{s.i}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:TK.okBg,color:TK.ok}}>{s.ch}</span></div>
          <p className="text-[10px] font-medium" style={{color:TK.textM}}>{s.l}</p><p className="text-lg font-extrabold" style={{color:TK.text}}>{s.v}</p></Card>
      ))}
    </div>
    <div className="flex gap-2">
      {[["+ Transaction","cash",TK.accent],["+ Invoice","inv",TK.ok],["+ Customer","cash",TK.info]].map(([l,pg,cl])=>
        <button key={l as string} onClick={()=>onNav(pg as string)} className="flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:shadow-md" style={{background:`${cl}12`,color:cl as string,border:`1px solid ${cl}20`}}>{l as string}</button>
      )}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <Card className="lg:col-span-2 p-4">
        <div className="flex items-center justify-between mb-1"><div><p className="text-[9px] uppercase font-bold tracking-widest" style={{color:TK.textM}}>{monthlyData.length>0?"FROM YOUR DATA":"SAMPLE DATA"}</p><h3 className="text-sm font-bold" style={{color:TK.text}}>{LL.trend}</h3></div><Badge t={monthlyData.length>0?"Live":"Demo"} c={monthlyData.length>0?TK.ok:TK.accent}/></div>
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={chartData}>
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
        <p className="text-xs mt-1 leading-relaxed" style={{color:TK.text}}>Net profit <strong>{c} {fmt(bal)}</strong> ({profitPct}% margin). You have <strong>{books.length} cash books</strong> ({books.filter(b=>b.type==="business").length} business, {books.filter(b=>b.type==="personal").length} personal). Est. VAT: <strong style={{color:TK.bad}}>{c} {fmt(Math.round(bal*R.vr))}</strong>. {cu.filter(x=>x.ow>0).length>0?`${cu.filter(x=>x.ow>0).length} customers owe ${c} ${fmt(owd)}. Follow up on overdue.`:"All customers are clear."}</p>
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

const CashBookPg = ({R,books,reload,cu,invoices}: {R: RegionInfo; books: CashBook[]; reload: () => void; cu: CustItem[]; invoices?: any[]}) => {
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
  const [txDate,setTxDate]=useState(todayStr());
  const [searchTx,setSearchTx]=useState("");
  const [showCustModal,setShowCustModal]=useState(false);
  const [editCust,setEditCust]=useState<CustItem|null>(null);
  const [custNm,setCustNm]=useState("");const [custPh,setCustPh]=useState("");
  const [custEm,setCustEm]=useState("");const [custAddr,setCustAddr]=useState("");
  const [custTin,setCustTin]=useState("");const [custOw,setCustOw]=useState("");
  const [custTr,setCustTr]=useState("80");
  const [custSaving,setCustSaving]=useState(false);
  const [confirmDelCust,setConfirmDelCust]=useState<number|null>(null);
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
      const d=new Date(txDate);const dateStr=d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
      await api.transactions.create({
        bookId: currentBook.id, type: ty, amount: parseFloat(am),
        category: ca, note: no, date: dateStr, payMode, proof: proofFile || null,
      });
      reload();
      setShowAdd(false);setAm("");setNo("");setPayMode("cash");setProofFile("");setTxDate(todayStr());
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const removeTx=async(txId: number)=>{
    try { await api.transactions.delete(txId); reload(); } catch(e) { console.error(e); }
  };
  const openCustAdd=()=>{setEditCust(null);setCustNm("");setCustPh("");setCustEm("");setCustAddr("");setCustTin("");setCustOw("0");setCustTr("80");setShowCustModal(true);};
  const openCustEdit=(x:CustItem)=>{setEditCust(x);setCustNm(x.nm);setCustPh(x.ph);setCustEm(x.em);setCustAddr(x.addr);setCustTin(x.tin);setCustOw(String(x.ow));setCustTr(String(x.tr));setShowCustModal(true);};
  const saveCust=async()=>{
    if(!custNm.trim())return;
    setCustSaving(true);
    try {
      const data={name:custNm.trim(),phone:custPh,email:custEm,address:custAddr,tin:custTin,owed:parseFloat(custOw)||0,trust:parseInt(custTr)||80};
      if(editCust) await api.customers.update(editCust.id,data);
      else await api.customers.create(data);
      reload();setShowCustModal(false);
    } catch(e) { console.error(e); }
    setCustSaving(false);
  };
  const delCust=async(id:number)=>{
    try { await api.customers.delete(id); reload(); setConfirmDelCust(null); } catch(e) { console.error(e); }
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
    const filteredByTab = tab==="in"?bTx.filter(t=>t.ty==="in"):tab==="out"?bTx.filter(t=>t.ty==="out"):tab==="cust"?[]:bTx;
    const fl = searchTx ? filteredByTab.filter(t=>(t.no||"").toLowerCase().includes(searchTx.toLowerCase())||(LL[t.cat]||t.cat).toLowerCase().includes(searchTx.toLowerCase())) : filteredByTab;
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
      {tab!=="cust"&&<div className="relative">
        <input value={searchTx} onChange={e=>setSearchTx(e.target.value)} placeholder="Search transactions..." className="w-full p-2.5 pl-8 rounded-xl text-xs outline-none" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}/>
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px]" style={{color:TK.textM}}>🔍</span>
        {searchTx&&<button onClick={()=>setSearchTx("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{color:TK.textM}}>✕</button>}
      </div>}
      {tab==="cust"?<div className="space-y-2">
        <button onClick={openCustAdd} className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{background:TK.accentBg,border:`1px dashed ${TK.accent}40`,color:TK.accent}}>+ Add Customer</button>
        {cu.map(x=>{const tc=x.tr>=90?TK.ok:x.tr>=70?TK.warn:TK.bad;const invCount=(invoices||[]).filter((iv:any)=>iv.customerId===x.id||iv.customer_id===x.id).length;return <Card key={x.id} className="p-3.5"><div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{background:TK.accentBg,color:TK.accent}}>{x.nm[0]}</div>
        <div className="flex-1">
          <p className="text-xs font-semibold" style={{color:TK.text}}>{x.nm}</p>
          <p className="text-[10px]" style={{color:TK.textM}}>{x.ph}{x.em?` · ${x.em}`:""}</p>
          {x.addr&&<p className="text-[9px]" style={{color:TK.textM}}>{x.addr}</p>}
          {x.tin&&<p className="text-[9px]" style={{color:TK.info}}>TIN: {x.tin}</p>}
          {invCount>0&&<p className="text-[9px]" style={{color:TK.accent}}>{invCount} invoice{invCount>1?"s":""}</p>}
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{background:`${tc}12`,color:tc}}>★ {x.tr}%</span>
        <div className="text-right">
          {x.ow>0?<p className="text-xs font-bold" style={{color:TK.bad}}>{c} {fmt(x.ow)}</p>:<p className="text-xs font-bold" style={{color:TK.ok}}>Clear ✓</p>}
          <div className="flex gap-1 mt-1 justify-end">
            <button onClick={()=>openCustEdit(x)} className="px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{background:TK.infoBg,color:TK.info}}>Edit</button>
            {confirmDelCust===x.id?<><button onClick={()=>delCust(x.id)} className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{background:TK.badBg,color:TK.bad}}>Confirm</button><button onClick={()=>setConfirmDelCust(null)} className="px-1.5 py-0.5 rounded text-[9px]" style={{color:TK.textM}}>Cancel</button></>
            :<button onClick={()=>setConfirmDelCust(x.id)} className="px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{background:TK.badBg,color:TK.bad}}>Del</button>}
          </div>
        </div>
      </div></Card>})}
      </div>
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
        <Inp label="Date" value={txDate} onChange={setTxDate} type="date"/>
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

      <Modal open={showCustModal} onClose={()=>setShowCustModal(false)} title={editCust?"Edit Customer":"Add Customer"}>
        <Inp label="Name *" value={custNm} onChange={setCustNm} placeholder="Customer name"/>
        <Inp label="Phone" value={custPh} onChange={setCustPh} placeholder="+20 xxx xxx xxxx"/>
        <Inp label="Email" value={custEm} onChange={setCustEm} type="email" placeholder="customer@email.com"/>
        <Inp label="Address" value={custAddr} onChange={setCustAddr} placeholder="Business address"/>
        <Inp label="Tax ID (TIN)" value={custTin} onChange={setCustTin} placeholder="Tax identification number"/>
        <div className="grid grid-cols-2 gap-2">
          <Inp label="Amount Owed" value={custOw} onChange={setCustOw} type="number" prefix={c}/>
          <Inp label="Trust Score %" value={custTr} onChange={setCustTr} type="number" placeholder="0-100"/>
        </div>
        <button onClick={saveCust} disabled={custSaving} className="w-full py-2.5 rounded-xl text-sm font-bold mt-1" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>{custSaving?"Saving...":(editCust?"Update Customer":"Add Customer")}</button>
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

interface InvLine { n: string; q: number; p: number; d: number; dType: "pct"|"flat" }

const InvPg = ({R,cu,invoices,reload,user}: {R: RegionInfo; cu: CustItem[]; invoices: any[]; reload: () => void; user: UserData}) => {
  const c=R.cur;
  const [showC,setShowC]=useState(false);
  const [iCu,setICu]=useState("");const [iTm,setITm]=useState("net30");const [iAd,setIAd]=useState("");const [iNo,setINo]=useState("");
  const [iDate,setIDate]=useState(todayStr());
  const [its,setIts]=useState<InvLine[]>([{n:"",q:1,p:0,d:0,dType:"pct"}]);
  const [saving,setSaving]=useState(false);
  const [remInv,setRemInv]=useState<any|null>(null);
  const [copied,setCopied]=useState("");
  const [vatPct,setVatPct]=useState(Math.round(R.vr*100));
  const [editVat,setEditVat]=useState(false);
  const [whtOn,setWhtOn]=useState(false);
  const [whtPct,setWhtPct]=useState(1);
  const [sellerTin,setSellerTin]=useState("");
  const [buyerTin,setBuyerTin]=useState("");
  const [statusFilter,setStatusFilter]=useState("all");
  const [confirmDel,setConfirmDel]=useState<number|null>(null);
  const [editingInvId,setEditingInvId]=useState<number|null>(null);
  const [editingInvNo,setEditingInvNo]=useState("");
  const [sigData,setSigData]=useState("");
  const [sigMode,setSigMode]=useState<"draw"|"upload">("draw");
  const sigCanvasRef=useRef<HTMLCanvasElement>(null);
  const [isDrawing,setIsDrawing]=useState(false);
  const [showQuickCust,setShowQuickCust]=useState(false);
  const [qcName,setQcName]=useState("");
  const [qcPhone,setQcPhone]=useState("");
  const [qcEmail,setQcEmail]=useState("");
  const [qcAddr,setQcAddr]=useState("");
  const [qcTin,setQcTin]=useState("");
  const [qcSaving,setQcSaving]=useState(false);
  const [builderInvNo,setBuilderInvNo]=useState("");
  const addIt=()=>setIts(p=>[...p,{n:"",q:1,p:0,d:0,dType:"pct"}]);
  const upIt=(i: number,f: string,v: string)=>setIts(p=>p.map((x,j)=>j===i?{...x,[f]:f==="n"||f==="dType"?v:parseFloat(v)||0}:x));
  const rmIt=(i: number)=>setIts(p=>p.filter((_,j)=>j!==i));
  const lines=its.map(x=>{const gross=x.q*x.p;const disc=x.dType==="pct"?gross*(x.d/100):x.d;return {...x,disc,lt:gross-disc};});
  const sub=lines.reduce((s,x)=>s+x.lt,0);
  const discTotal=lines.reduce((s,x)=>s+x.disc,0);
  const vat=Math.round(sub*(vatPct/100));
  const wht=whtOn?Math.round(sub*(whtPct/100)):0;
  const tot=sub+vat-wht;
  const dueDate=getDueDate(iDate,iTm);

  const startSigDraw=(e:React.MouseEvent<HTMLCanvasElement>|React.TouchEvent<HTMLCanvasElement>)=>{
    const canvas=sigCanvasRef.current;if(!canvas)return;
    setIsDrawing(true);
    const ctx=canvas.getContext("2d");if(!ctx)return;
    const rect=canvas.getBoundingClientRect();
    const x="touches" in e?(e as React.TouchEvent).touches[0].clientX-rect.left:(e as React.MouseEvent).clientX-rect.left;
    const y="touches" in e?(e as React.TouchEvent).touches[0].clientY-rect.top:(e as React.MouseEvent).clientY-rect.top;
    ctx.beginPath();ctx.moveTo(x,y);
  };
  const moveSigDraw=(e:React.MouseEvent<HTMLCanvasElement>|React.TouchEvent<HTMLCanvasElement>)=>{
    if(!isDrawing)return;
    const canvas=sigCanvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    const rect=canvas.getBoundingClientRect();
    const x="touches" in e?(e as React.TouchEvent).touches[0].clientX-rect.left:(e as React.MouseEvent).clientX-rect.left;
    const y="touches" in e?(e as React.TouchEvent).touches[0].clientY-rect.top:(e as React.MouseEvent).clientY-rect.top;
    ctx.strokeStyle="#1A1510";ctx.lineWidth=2;ctx.lineCap="round";ctx.lineJoin="round";
    ctx.lineTo(x,y);ctx.stroke();
  };
  const endSigDraw=()=>{
    setIsDrawing(false);
    const canvas=sigCanvasRef.current;if(!canvas)return;
    setSigData(canvas.toDataURL("image/png"));
  };
  const clearSig=()=>{
    const canvas=sigCanvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    setSigData("");
  };
  const handleSigUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{setSigData(ev.target?.result as string);};
    reader.readAsDataURL(file);
  };

  const openEditInvoice=(inv:any)=>{
    const rawInv=invoices.find(x=>x.id===inv.id);if(!rawInv)return;
    setEditingInvId(rawInv.id);
    setEditingInvNo(rawInv.invoiceNo||"");
    setIDate(rawInv.invoiceDate||todayStr());
    setITm(rawInv.terms||"net30");
    setIAd(rawInv.billingAddress||"");
    setINo(rawInv.notes||"");
    setSellerTin(rawInv.sellerTin||"");
    setBuyerTin(rawInv.buyerTin||"");
    setVatPct(parseFloat(rawInv.vatRate)||Math.round(R.vr*100));
    const wr=parseFloat(rawInv.whtRate)||0;
    setWhtOn(wr>0);setWhtPct(wr||1);
    setSigData(rawInv.signature||"");
    const cust=rawInv.customerId?cu.find(x=>x.id===rawInv.customerId):null;
    setICu(cust?.nm||"");
    const items=Array.isArray(rawInv.items)?rawInv.items.map((it:any)=>({n:it.n||"",q:it.q||1,p:it.p||0,d:it.d||0,dType:(it.dType||"pct") as "pct"|"flat"})):([{n:"",q:1,p:0,d:0,dType:"pct" as const}]);
    setIts(items);
    setShowC(true);
  };

  const resetBuilder=()=>{
    setEditingInvId(null);setEditingInvNo("");setBuilderInvNo("");
    setIts([{n:"",q:1,p:0,d:0,dType:"pct"}]);setICu("");setIAd("");setINo("");setIDate(todayStr());setSellerTin("");setBuyerTin("");setWhtOn(false);setSigData("");
  };

  const quickAddCustomer=async()=>{
    if(!qcName.trim())return;
    setQcSaving(true);
    try {
      const res = await api.customers.create({name:qcName,phone:qcPhone,email:qcEmail,address:qcAddr,tin:qcTin,owed:"0",paid:"0",trust:50});
      reload();
      setICu(qcName);
      if(qcTin)setBuyerTin(qcTin);
      if(qcAddr)setIAd(qcAddr);
      setShowQuickCust(false);setQcName("");setQcPhone("");setQcEmail("");setQcAddr("");setQcTin("");
    } catch(e) { console.error(e); }
    setQcSaving(false);
  };

  const sinv = invoices.map(inv => {
    const dd = inv.dueDate || getDueDate(inv.invoiceDate||"", inv.terms||"net30");
    const effectiveStatus = inv.status === "unpaid" && isOverdue(dd) ? "overdue" : inv.status;
    return {
      id: inv.id, nm: inv.invoiceNo,
      cu: inv.customerId ? cu.find(c => c.id === inv.customerId)?.nm || "Unknown" : "Unknown",
      cuPhone: inv.customerId ? cu.find(c => c.id === inv.customerId)?.ph || "" : "",
      t: parseFloat(inv.total) || 0, s: effectiveStatus, rawStatus: inv.status,
      terms: inv.terms || "net30", date: inv.invoiceDate || "", dueDate: dd,
    };
  });
  const sc: Record<string,string>={paid:TK.ok,unpaid:TK.warn,draft:TK.textM,overdue:TK.bad,sent:TK.info};
  const filteredInv = statusFilter === "all" ? sinv : sinv.filter(x => x.s === statusFilter);
  const totalRevenue = sinv.reduce((s,x)=>s+x.t,0);
  const totalPaid = sinv.filter(x=>x.s==="paid").reduce((s,x)=>s+x.t,0);
  const totalOutstanding = sinv.filter(x=>x.s!=="paid"&&x.s!=="draft").reduce((s,x)=>s+x.t,0);

  const hasBankInfo = user.bankName || user.bankAccount || user.bankIban;
  const hasPayLink = !!user.paymentLink;
  const bizName = user.businessName || user.name;

  const buildReminderText = (inv: any, includeBank: boolean, includePayLink: boolean) => {
    const termsLabel: Record<string,string> = {net30:"Net 30 Days",net60:"Net 60 Days",due:"Due on Receipt"};
    let msg = `Payment Reminder\n\nDear ${inv.cu},\n\nThis is a friendly reminder regarding the following invoice:\n\nInvoice: ${inv.nm}\nAmount Due: ${c} ${fmt(inv.t)}\nDate: ${inv.date}\nDue: ${inv.dueDate}\nTerms: ${termsLabel[inv.terms]||inv.terms}\n`;
    if (includePayLink && user.paymentLink) msg += `\nPay Online:\n${user.paymentLink}\n`;
    if (includeBank && hasBankInfo) {
      msg += `\nBank Transfer Details:\n`;
      if (user.bankName) msg += `Bank: ${user.bankName}\n`;
      if (user.businessName) msg += `Account Name: ${user.businessName}\n`;
      if (user.bankAccount) msg += `Account No: ${user.bankAccount}\n`;
      if (user.bankIban) msg += `IBAN: ${user.bankIban}\n`;
      if (user.bankSwift) msg += `SWIFT: ${user.bankSwift}\n`;
    }
    msg += `\nPlease make the payment at your earliest convenience.\n\nThank you,\n${bizName}`;
    if (user.businessPhone) msg += `\nPhone: ${user.businessPhone}`;
    return msg;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(label); setTimeout(() => setCopied(""), 2000); });
  };

  const shareWhatsApp = (inv: any, includeBank: boolean, includePayLink: boolean) => {
    const text = buildReminderText(inv, includeBank, includePayLink);
    const phone = inv.cuPhone ? inv.cuPhone.replace(/[^0-9+]/g,"") : "";
    const url = phone ? `https://wa.me/${phone.replace("+","")}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareEmail = (inv: any, includeBank: boolean, includePayLink: boolean) => {
    const text = buildReminderText(inv, includeBank, includePayLink);
    const subject = encodeURIComponent(`Payment Reminder: ${inv.nm} - ${c} ${fmt(inv.t)}`);
    window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(text)}`, "_blank");
  };

  const updateInvStatus = async (id: number, status: string) => {
    try { await api.invoices.update(id, { status }); reload(); } catch(e) { console.error(e); }
  };

  const deleteInvoice = async (id: number) => {
    try { await api.invoices.delete(id); setConfirmDel(null); reload(); } catch(e) { console.error(e); }
  };

  const createInvoice=async(asDraft=false)=>{
    setSaving(true);
    try {
      const selectedCust = cu.find(x => x.nm === iCu);
      const existingInv = editingInvId ? invoices.find(x=>x.id===editingInvId) : null;
      const newStatus = asDraft ? "draft" : "unpaid";
      const payload: any = {
        invoiceDate: iDate, dueDate,
        status: editingInvId ? (asDraft ? "draft" : (existingInv?.status || "unpaid")) : newStatus,
        subtotal: sub, discountTotal: discTotal, vatAmount: vat, whtAmount: wht, total: tot,
        vatRate: vatPct, whtRate: whtOn ? whtPct : 0,
        terms: iTm, billingAddress: iAd, notes: iNo, items: its,
        customerId: selectedCust?.id || null,
        sellerTin, buyerTin: selectedCust?.tin || buyerTin, currency: c,
        signature: sigData,
      };
      if (editingInvId) {
        payload.invoiceNo = editingInvNo;
        await api.invoices.update(editingInvId, payload);
      } else {
        payload.invoiceNo = builderInvNo || `FEL-${String(invoices.length+1).padStart(3,"0")}`;
        await api.invoices.create(payload);
      }
      reload();
      setShowC(false);resetBuilder();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const previewInvoice = (opts?: { print?: boolean }) => {
    const selectedCust = cu.find(x => x.nm === iCu);
    const w = window.open("", "_blank");
    if (!w) return;
    const invNo = editingInvId ? editingInvNo : (builderInvNo || `FEL-${String(invoices.length+1).padStart(3,"0")}`);
    w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invNo}</title>
      <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1A1A1A}
      .header{display:flex;justify-content:space-between;margin-bottom:30px}.logo{font-size:24px;font-weight:800;color:#C8A630}
      table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#F6F5F0;text-align:left;padding:10px;font-size:12px;text-transform:uppercase;color:#9C9590}
      td{padding:10px;border-bottom:1px solid #E8E6E1;font-size:13px}.totals{text-align:right;margin-top:20px}
      .totals div{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}.totals .total{font-weight:800;font-size:16px;color:#C8A630;border-top:2px solid #C8A630;padding-top:8px;margin-top:8px}
      .words{background:#FEF9E7;padding:12px;border-radius:8px;font-size:11px;margin-top:16px;color:#6B6560}
      .footer{margin-top:40px;text-align:center;font-size:10px;color:#9C9590}
      @media print{body{margin:0}}</style></head><body>
      <div class="header"><div><div class="logo">felosak</div><p style="font-size:11px;color:#9C9590">${bizName}${user.businessPhone ? " · "+user.businessPhone : ""}</p>
      ${sellerTin ? `<p style="font-size:10px;color:#9C9590">TIN: ${sellerTin}</p>` : ""}</div>
      <div style="text-align:right"><h2 style="margin:0;color:#C8A630">INVOICE</h2>
      <p style="font-size:12px">#${invNo}</p>
      <p style="font-size:11px;color:#9C9590">Date: ${iDate}<br/>Due: ${dueDate}<br/>Terms: ${iTm==="net30"?"Net 30":iTm==="net60"?"Net 60":"Due on Receipt"}</p></div></div>
      <div style="margin-bottom:20px"><strong style="font-size:12px">Bill To:</strong>
      <p style="font-size:12px">${selectedCust?.nm||iCu||"—"}</p>
      ${selectedCust?.addr ? `<p style="font-size:11px;color:#6B6560">${selectedCust.addr}</p>` : ""}
      ${(selectedCust?.tin||buyerTin) ? `<p style="font-size:11px;color:#6B6560">TIN: ${selectedCust?.tin||buyerTin}</p>` : ""}
      ${iAd ? `<p style="font-size:11px;color:#6B6560">${iAd}</p>` : ""}</div>
      <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Disc</th><th style="text-align:right">Total</th></tr></thead><tbody>
      ${lines.map((l,i)=>`<tr><td>${i+1}</td><td>${l.n||"—"}</td><td>${l.q}</td><td>${c} ${fmt(l.q*l.p)}</td><td>${l.dType==="pct"?l.d+"%":c+" "+fmt(l.d)}</td><td style="text-align:right">${c} ${fmt(l.lt)}</td></tr>`).join("")}
      </tbody></table>
      <div class="totals" style="max-width:300px;margin-left:auto">
      <div><span>Subtotal</span><span>${c} ${fmt(sub)}</span></div>
      ${discTotal>0?`<div><span>Discount</span><span style="color:#E34935">-${c} ${fmt(discTotal)}</span></div>`:""}
      <div><span>VAT (${vatPct}%)</span><span>${c} ${fmt(vat)}</span></div>
      ${whtOn?`<div><span>WHT (${whtPct}%)</span><span style="color:#E34935">-${c} ${fmt(wht)}</span></div>`:""}
      <div class="total"><span>Total</span><span>${c} ${fmt(tot)}</span></div></div>
      <div class="words"><strong>Amount in words:</strong> ${numToWords(tot)} ${c}</div>
      ${iNo?`<div style="margin-top:16px;padding:12px;background:#FAF9F7;border-radius:8px;font-size:11px"><strong>Notes:</strong> ${iNo}</div>`:""}
      ${hasBankInfo?`<div style="margin-top:16px;padding:12px;background:#FAF9F7;border-radius:8px;font-size:11px"><strong>Payment Details:</strong><br/>${user.bankName?"Bank: "+user.bankName+"<br/>":""}${user.businessName?"Account: "+user.businessName+"<br/>":""}${user.bankAccount?"Account No: "+user.bankAccount+"<br/>":""}${user.bankIban?"IBAN: "+user.bankIban+"<br/>":""}${user.bankSwift?"SWIFT: "+user.bankSwift:""}</div>`:""}
      ${sigData?`<div style="margin-top:24px;border-top:1px solid #E8E6E1;padding-top:16px"><p style="font-size:10px;color:#9C9590;margin-bottom:8px">Authorized Signature</p><img src="${sigData}" alt="Signature" style="max-height:60px"/><p style="font-size:11px;margin-top:4px;font-weight:600">${bizName}</p></div>`:""}
      <div style="position:fixed;bottom:20px;right:20px;opacity:0.08;font-size:48px;font-weight:900;color:#C8A630;transform:rotate(-15deg);pointer-events:none">felosak</div>
      <div class="footer">© 2026 felosak · www.felosak.com · Powered by felosak</div>
      ${opts?.print ? `<script>setTimeout(()=>window.print(),500)<\/script>` : ""}
      </body></html>`);
    w.document.close();
  };

  return <div className="space-y-3">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div><h1 className="text-lg font-bold" style={{color:TK.text}}>{LL.invoices}</h1><p className="text-[10px]" style={{color:TK.textM}}>{R.fl} {R.auth} • {R.vl} • {R.fmt}</p></div>
      <div className="flex items-center gap-2"><Badge t={`${R.auth} ${R.eM?"Active":"Pilot"}`} c={R.eM?TK.ok:TK.warn}/>
        <button onClick={()=>{resetBuilder();setShowC(true);}} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>+ {LL.createInv}</button>
      </div>
    </div>
    <div className="p-3 rounded-xl text-[11px] font-semibold" style={{background:R.id==="EG"?TK.badBg:TK.infoBg,color:R.id==="EG"?TK.bad:TK.info,border:`1px solid ${R.id==="EG"?`${TK.bad}15`:`${TK.info}15`}`}}>
      🏛️ {R.id==="EG"?"ETA: Clearance model • XML/JSON • UUID+QR+UIN(39-char) • GS1/GPC codes • E-Signature • 5yr archival • B2C via POS":"FTA: Tax invoices with TRN • Peppol CTC pilot July 2026 • Mandatory 2027 • 5yr archival"}
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[[`${c} ${fmt(totalRevenue)}`,"Total Revenue",TK.accent,TK.accentBg],[`${c} ${fmt(totalPaid)}`,"Paid",TK.ok,TK.okBg],[`${c} ${fmt(totalOutstanding)}`,"Outstanding",TK.warn,TK.warnBg]].map(([v,l,cl,bg],i)=>
        <div key={i} className="p-3 rounded-xl text-center" style={{background:bg as string,border:`1px solid ${cl}15`}}><p className="text-[9px] font-bold uppercase" style={{color:cl as string}}>{l as string}</p><p className="text-sm font-extrabold mt-0.5" style={{color:TK.text}}>{v as string}</p></div>
      )}
    </div>
    <div className="grid grid-cols-5 gap-2">
      <Card className="p-2.5 text-center cursor-pointer hover:shadow-md transition-all" onClick={()=>setEditVat(!editVat)}>
        <p className="text-[8px] uppercase font-bold" style={{color:TK.textM}}>VAT</p>
        {editVat?<div className="flex items-center justify-center gap-0.5 mt-0.5"><input type="number" value={vatPct} onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v)&&v>=0&&v<=100)setVatPct(v);}} onClick={e=>e.stopPropagation()} className="w-12 text-center text-base font-black rounded-md outline-none py-0.5" style={{background:TK.muted,border:`1px solid ${TK.accent}`,color:TK.accent}} min={0} max={100} step={0.5}/><span className="text-sm font-black" style={{color:TK.accent}}>%</span></div>
        :<><p className="text-lg font-black" style={{color:TK.accent}}>{vatPct}%</p><p className="text-[7px] font-semibold" style={{color:TK.accent}}>Tap to edit</p></>}
      </Card>
      {[["Count",`${sinv.length}`,TK.text],["Unpaid",`${sinv.filter(x=>x.s==="unpaid").length}`,TK.warn],["Overdue",`${sinv.filter(x=>x.s==="overdue").length}`,TK.bad],["Archive",`${R.arch}yr`,TK.info]].map(([l,v,cl],i)=><Card key={i} className="p-2.5 text-center"><p className="text-[8px] uppercase font-bold" style={{color:TK.textM}}>{l as string}</p><p className="text-lg font-black" style={{color:cl as string}}>{v as string}</p></Card>)}
    </div>
    <div className="flex gap-1 p-1 rounded-xl" style={{background:TK.muted}}>
      {[["all","All"],["draft","Draft"],["unpaid","Unpaid"],["overdue","Overdue"],["sent","Sent"],["paid","Paid"]].map(([v,l])=>(
        <button key={v} onClick={()=>setStatusFilter(v)} className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all" style={{background:statusFilter===v?"#fff":"transparent",color:statusFilter===v?TK.text:TK.textM,boxShadow:statusFilter===v?TK.sh:"none"}}>{l}{v!=="all"?` (${sinv.filter(x=>x.s===v).length})`:""}</button>
      ))}
    </div>
    {filteredInv.length===0?<div className="text-center py-10"><p className="text-3xl mb-2">📄</p><p className="text-sm font-semibold" style={{color:TK.textM}}>{statusFilter==="all"?"No invoices yet":`No ${statusFilter} invoices`}</p><p className="text-[11px] mt-1" style={{color:TK.textM}}>{statusFilter==="all"?"Create your first invoice to get started":"Try a different filter"}</p></div>
    :<div className="space-y-1.5">{filteredInv.map((inv,i)=><Card key={i} className="p-3.5 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:inv.s==="overdue"?TK.badBg:TK.accentBg}}>{inv.s==="overdue"?"⚠️":"📄"}</div>
        <div className="flex-1">
          <p className="text-xs font-semibold" style={{color:TK.text}}>{inv.nm}</p>
          <p className="text-[10px]" style={{color:TK.textM}}>{inv.cu} · {inv.date}{inv.dueDate?` · Due: ${inv.dueDate}`:""}</p>
        </div>
        <div className="text-right"><p className="text-xs font-bold" style={{color:TK.text}}>{c} {fmt(inv.t)}</p><span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase mt-0.5" style={{background:`${sc[inv.s]||TK.textM}12`,color:sc[inv.s]||TK.textM}}>{inv.s}</span></div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 pt-2 flex-wrap" style={{borderTop:`1px solid ${TK.borderL}`}}>
        <button onClick={()=>openEditInvoice(inv)} className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:TK.accentBg,color:TK.accent,border:`1px solid ${TK.accent}20`}}>✏️ Edit</button>
        {inv.s==="draft"&&<button onClick={()=>updateInvStatus(inv.id,"unpaid")} className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:TK.infoBg,color:TK.info,border:`1px solid ${TK.info}20`}}>📨 Send</button>}
        {(inv.s==="unpaid"||inv.s==="overdue"||inv.s==="sent")&&<>
          <button onClick={()=>updateInvStatus(inv.id,"paid")} className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:TK.okBg,color:TK.ok,border:`1px solid ${TK.ok}20`}}>✓ Mark Paid</button>
          <button onClick={()=>setRemInv(inv)} className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:TK.accentBg,color:TK.accent,border:`1px solid ${TK.accent}20`}}>🔔 Remind</button>
          <button onClick={()=>shareWhatsApp(inv,true,true)} className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:"#25D36612",color:"#25D366",border:"1px solid #25D36620"}}>💬</button>
          <button onClick={()=>shareEmail(inv,true,true)} className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:TK.infoBg,color:TK.info,border:`1px solid ${TK.info}20`}}>📧</button>
        </>}
        <div className="flex-1"/>
        {confirmDel===inv.id?<div className="flex items-center gap-1">
          <span className="text-[9px]" style={{color:TK.bad}}>Delete?</span>
          <button onClick={()=>deleteInvoice(inv.id)} className="px-2 py-1 rounded text-[9px] font-bold" style={{background:TK.badBg,color:TK.bad}}>Yes</button>
          <button onClick={()=>setConfirmDel(null)} className="px-2 py-1 rounded text-[9px] font-bold" style={{background:TK.muted,color:TK.textM}}>No</button>
        </div>:<button onClick={()=>setConfirmDel(inv.id)} className="text-[10px] px-2 py-1 rounded-lg hover:bg-red-50" style={{color:TK.bad}}>🗑</button>}
      </div>
    </Card>)}</div>}

    <Modal open={!!remInv} onClose={()=>{setRemInv(null);setCopied("");}} title="🔔 Payment Reminder">
      {remInv&&<div className="space-y-3">
        <div className="p-3 rounded-xl" style={{background:TK.accentBg}}>
          <div className="flex justify-between items-center"><span className="text-xs font-bold" style={{color:TK.text}}>{remInv.nm}</span><span className="text-xs font-black" style={{color:TK.accent}}>{c} {fmt(remInv.t)}</span></div>
          <p className="text-[10px] mt-0.5" style={{color:TK.textM}}>Customer: {remInv.cu} · Status: {remInv.s}{remInv.dueDate?` · Due: ${remInv.dueDate}`:""}</p>
        </div>

        {!hasBankInfo&&!hasPayLink&&<div className="p-3 rounded-xl text-[11px]" style={{background:TK.warnBg,color:TK.warn,border:`1px solid ${TK.warn}20`}}>
          ⚠️ No payment details configured. Go to <strong>Settings → Payment Details</strong> to add your bank account or payment link so customers know how to pay.
        </div>}

        {hasBankInfo&&<div className="p-3 rounded-xl" style={{background:TK.muted,border:`1px solid ${TK.border}`}}>
          <div className="flex items-center justify-between mb-1.5"><p className="text-[10px] font-bold" style={{color:TK.text}}>🏦 Bank Transfer Details</p>
            <button onClick={()=>{let t="";if(user.bankName)t+=`Bank: ${user.bankName}\n`;if(user.businessName)t+=`Name: ${user.businessName}\n`;if(user.bankAccount)t+=`Account: ${user.bankAccount}\n`;if(user.bankIban)t+=`IBAN: ${user.bankIban}\n`;if(user.bankSwift)t+=`SWIFT: ${user.bankSwift}\n`;copyToClipboard(t,"bank");}} className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{background:copied==="bank"?TK.okBg:TK.accentBg,color:copied==="bank"?TK.ok:TK.accent}}>{copied==="bank"?"✓ Copied":"Copy"}</button>
          </div>
          <div className="space-y-0.5">
            {user.bankName&&<p className="text-[10px]" style={{color:TK.textS}}>Bank: <strong>{user.bankName}</strong></p>}
            {user.businessName&&<p className="text-[10px]" style={{color:TK.textS}}>Name: <strong>{user.businessName}</strong></p>}
            {user.bankAccount&&<p className="text-[10px]" style={{color:TK.textS}}>Account: <strong>{user.bankAccount}</strong></p>}
            {user.bankIban&&<p className="text-[10px]" style={{color:TK.textS}}>IBAN: <strong>{user.bankIban}</strong></p>}
            {user.bankSwift&&<p className="text-[10px]" style={{color:TK.textS}}>SWIFT: <strong>{user.bankSwift}</strong></p>}
          </div>
        </div>}

        {hasPayLink&&<div className="p-3 rounded-xl" style={{background:TK.okBg,border:`1px solid ${TK.ok}20`}}>
          <div className="flex items-center justify-between mb-1"><p className="text-[10px] font-bold" style={{color:TK.ok}}>🔗 Payment Link</p>
            <button onClick={()=>copyToClipboard(user.paymentLink!,"link")} className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{background:copied==="link"?"#fff":TK.okBg,color:TK.ok}}>{copied==="link"?"✓ Copied":"Copy Link"}</button>
          </div>
          <a href={user.paymentLink} target="_blank" rel="noreferrer" className="text-[10px] break-all underline" style={{color:TK.ok}}>{user.paymentLink}</a>
        </div>}

        <p className="text-[9px] font-bold uppercase tracking-wider" style={{color:TK.textM}}>Share Reminder Via</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={()=>shareWhatsApp(remInv,true,true)} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold" style={{background:"#25D36612",color:"#25D366",border:"1px solid #25D36625"}}>💬 WhatsApp{remInv.cuPhone?" (Direct)":""}</button>
          <button onClick={()=>shareEmail(remInv,true,true)} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold" style={{background:TK.infoBg,color:TK.info,border:`1px solid ${TK.info}25`}}>📧 Email</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {hasPayLink&&<button onClick={()=>copyToClipboard(user.paymentLink!,"paylink")} className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-semibold" style={{background:TK.okBg,color:TK.ok,border:`1px solid ${TK.ok}20`}}>{copied==="paylink"?"✓ Copied!":"🔗 Copy Payment Link"}</button>}
          <button onClick={()=>copyToClipboard(buildReminderText(remInv,true,true),"full")} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-semibold ${hasPayLink?"":"col-span-2"}`} style={{background:TK.muted,color:TK.textS,border:`1px solid ${TK.border}`}}>{copied==="full"?"✓ Copied!":"📋 Copy Full Message"}</button>
        </div>

        <div className="p-3 rounded-xl" style={{background:TK.muted,border:`1px solid ${TK.border}`}}>
          <p className="text-[9px] font-bold mb-1.5" style={{color:TK.textM}}>Message Preview</p>
          <pre className="text-[9px] leading-relaxed whitespace-pre-wrap" style={{color:TK.textS}}>{buildReminderText(remInv,!!hasBankInfo,hasPayLink)}</pre>
        </div>
      </div>}
    </Modal>

    <Modal open={showC} onClose={()=>{setShowC(false);resetBuilder();}} title={editingInvId?`Edit Invoice ${editingInvNo}`:`${LL.createInv} — ${R.fl} ${R.auth}`} wide>
      <div className="p-2.5 rounded-xl mb-3 text-[10px]" style={{background:TK.accentBg,border:`1px solid ${TK.accent}20`,color:TK.textS}}>
        <strong style={{color:TK.accent}}>{R.n}:</strong> VAT {vatPct}% • {R.fmt} • {R.sig} {R.id==="EG"&&"• GS1 codes • Real-time ETA • UUID+QR"}{R.id==="AE"&&"• TRN required • Peppol CTC"}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[10px] font-bold mb-1 uppercase tracking-wider" style={{color:TK.textM}}>Customer</label>
          <div className="flex gap-1">
            <select value={iCu} onChange={e=>{const v=e.target.value;if(v==="__new__"){setShowQuickCust(true);return;}setICu(v);const sel=cu.find(x=>x.nm===v);if(sel){setBuyerTin(sel.tin);if(sel.addr)setIAd(sel.addr);}}} className="flex-1 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}>
              <option value="">— Select —</option>
              {cu.map(x=><option key={x.id} value={x.nm}>{x.nm}{x.tin?" · TIN: "+x.tin:""}</option>)}
              <option value="__new__">➕ Add New Customer</option>
            </select>
          </div>
        </div>
        <Inp label={`Invoice # ${editingInvId?"":"(auto)"}`} value={editingInvId?editingInvNo:(builderInvNo||`FEL-${String(invoices.length+1).padStart(3,"0")}`)} onChange={v=>{if(editingInvId)setEditingInvNo(v);else setBuilderInvNo(v);}} placeholder="FEL-001"/>
        <Inp label={LL.invDate} value={iDate} onChange={v=>{setIDate(v);}} type="date"/>
        <Inp label={LL.terms} value={iTm} onChange={setITm} options={[{v:"net30",l:LL.net30},{v:"net60",l:LL.net60},{v:"due",l:LL.dueReceipt}]}/>
        <Inp label="Due Date" value={dueDate} onChange={()=>{}} type="date"/>
        <Inp label={LL.billAddr} value={iAd} onChange={setIAd} placeholder="123 Street, City"/>
      </div>
      {R.id==="EG"&&<div className="grid grid-cols-2 gap-3 mb-3">
        <Inp label="Seller TIN (9-digit)" value={sellerTin} onChange={setSellerTin} placeholder="123456789"/>
        <Inp label="Buyer TIN (9-digit)" value={buyerTin} onChange={setBuyerTin} placeholder="987654321"/>
      </div>}
      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{color:TK.textM}}>{LL.items} {R.id==="EG"&&"(GS1 code required)"}</p>
      <div className="rounded-xl overflow-hidden mb-2" style={{border:`1px solid ${TK.border}`}}>
        <div className="grid grid-cols-12 gap-0 p-2 text-[9px] uppercase font-bold tracking-wider" style={{background:TK.muted,color:TK.textM}}>
          <span className="col-span-3">{LL.itemName}</span><span className="col-span-1 text-center">{LL.qty}</span><span className="col-span-2 text-center">Price</span><span className="col-span-1 text-center">Type</span><span className="col-span-2 text-center">Disc</span><span className="col-span-2 text-center">{LL.lineTotal}</span><span className="col-span-1"/>
        </div>
        {its.map((it,i)=><div key={i} className="grid grid-cols-12 gap-1 p-2 items-center" style={{borderTop:`1px solid ${TK.borderL}`}}>
          <input value={it.n} onChange={e=>upIt(i,"n",e.target.value)} placeholder="Product..." className="col-span-3 p-1.5 rounded-lg text-[11px] outline-none" style={{background:TK.muted,border:`1px solid ${TK.borderL}`,color:TK.text}}/>
          <input type="number" value={it.q||""} onChange={e=>upIt(i,"q",e.target.value)} className="col-span-1 p-1.5 rounded-lg text-[11px] text-center outline-none" style={{background:TK.muted,border:`1px solid ${TK.borderL}`,color:TK.text}}/>
          <input type="number" value={it.p||""} onChange={e=>upIt(i,"p",e.target.value)} className="col-span-2 p-1.5 rounded-lg text-[11px] text-center outline-none" style={{background:TK.muted,border:`1px solid ${TK.borderL}`,color:TK.text}}/>
          <select value={it.dType} onChange={e=>upIt(i,"dType",e.target.value)} className="col-span-1 p-1 rounded-lg text-[9px] outline-none" style={{background:TK.muted,border:`1px solid ${TK.borderL}`,color:TK.textS}}>
            <option value="pct">%</option><option value="flat">{c}</option>
          </select>
          <input type="number" value={it.d||""} onChange={e=>upIt(i,"d",e.target.value)} placeholder="0" className="col-span-2 p-1.5 rounded-lg text-[11px] text-center outline-none" style={{background:TK.muted,border:`1px solid ${TK.borderL}`,color:TK.text}}/>
          <p className="col-span-2 text-[11px] font-bold text-center" style={{color:TK.text}}>{c} {fmt(lines[i]?.lt||0)}</p>
          <button onClick={()=>rmIt(i)} className="col-span-1 text-center text-red-400 hover:text-red-600 text-xs">✕</button>
        </div>)}
      </div>
      <button onClick={addIt} className="text-[11px] font-semibold flex items-center gap-1 mb-3" style={{color:TK.accent}}>+ {LL.addLine}</button>
      {R.id==="EG"&&<div className="flex items-center gap-3 mb-3 p-2.5 rounded-xl" style={{background:TK.warnBg,border:`1px solid ${TK.warn}15`}}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={whtOn} onChange={e=>setWhtOn(e.target.checked)} className="w-4 h-4 rounded accent-amber-500"/>
          <span className="text-[11px] font-semibold" style={{color:TK.warn}}>WHT (Withholding Tax)</span>
        </label>
        {whtOn&&<select value={whtPct} onChange={e=>setWhtPct(parseFloat(e.target.value))} className="text-[11px] px-2 py-1 rounded-lg outline-none" style={{background:"white",border:`1px solid ${TK.warn}`,color:TK.warn}}>
          <option value={1}>1% (Goods)</option><option value={3}>3% (Services)</option><option value={5}>5% (Contractors)</option>
        </select>}
      </div>}
      <div className="p-3 rounded-xl mb-3 space-y-1.5" style={{background:TK.muted}}>
        <div className="flex justify-between text-[11px]"><span style={{color:TK.textM}}>{LL.subtotal}</span><span className="font-semibold" style={{color:TK.text}}>{c} {fmt(sub+discTotal)}</span></div>
        {discTotal>0&&<div className="flex justify-between text-[11px]"><span style={{color:TK.textM}}>Discount</span><span className="font-semibold" style={{color:TK.bad}}>-{c} {fmt(discTotal)}</span></div>}
        <div className="flex justify-between items-center text-[11px]">
          <span className="flex items-center gap-1.5" style={{color:TK.textM}}>{LL.vat}
            {editVat?<span className="flex items-center gap-1"><input type="number" value={vatPct} onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v)&&v>=0&&v<=100)setVatPct(v);}} className="w-14 px-1.5 py-0.5 rounded-md text-[11px] text-center outline-none font-semibold" style={{background:"white",border:`1px solid ${TK.accent}`,color:TK.accent}} min={0} max={100} step={0.5}/><span className="text-[10px]" style={{color:TK.textM}}>%</span><button onClick={()=>setEditVat(false)} className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{color:TK.ok}}>✓</button></span>
            :<span className="flex items-center gap-1">({vatPct}%)<button onClick={()=>setEditVat(true)} className="text-[9px] font-semibold px-1.5 py-0.5 rounded hover:bg-white" style={{color:TK.accent}}>Edit</button></span>}
          </span>
          <span className="font-semibold" style={{color:TK.text}}>{c} {fmt(vat)}</span>
        </div>
        {whtOn&&<div className="flex justify-between text-[11px]"><span style={{color:TK.warn}}>WHT ({whtPct}%)</span><span className="font-semibold" style={{color:TK.bad}}>-{c} {fmt(wht)}</span></div>}
        <div className="flex justify-between text-sm font-bold pt-1.5" style={{borderTop:`1px solid ${TK.border}`}}><span style={{color:TK.accent}}>{LL.total}</span><span style={{color:TK.accent}}>{c} {fmt(tot)}</span></div>
        <p className="text-[9px] italic" style={{color:TK.textM}}>{numToWords(tot)} {c}</p>
      </div>
      <Inp label={LL.notes} value={iNo} onChange={setINo} placeholder="Payment terms, bank details..."/>
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{color:TK.textM}}>Signature</p>
        <div className="flex gap-2 mb-2">
          <button onClick={()=>setSigMode("draw")} className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:sigMode==="draw"?"#fff":TK.muted,color:sigMode==="draw"?TK.accent:TK.textM,border:`1px solid ${sigMode==="draw"?TK.accent:TK.border}`,boxShadow:sigMode==="draw"?TK.sh:"none"}}>✍️ Draw</button>
          <button onClick={()=>setSigMode("upload")} className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:sigMode==="upload"?"#fff":TK.muted,color:sigMode==="upload"?TK.accent:TK.textM,border:`1px solid ${sigMode==="upload"?TK.accent:TK.border}`,boxShadow:sigMode==="upload"?TK.sh:"none"}}>📁 Upload</button>
        </div>
        {sigMode==="draw"?<div>
          <canvas ref={sigCanvasRef} width={400} height={120} onMouseDown={startSigDraw} onMouseMove={moveSigDraw} onMouseUp={endSigDraw} onMouseLeave={endSigDraw} onTouchStart={startSigDraw} onTouchMove={moveSigDraw} onTouchEnd={endSigDraw} className="w-full rounded-xl cursor-crosshair touch-none" style={{background:"#fff",border:`2px dashed ${TK.border}`,height:120}}/>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[9px]" style={{color:TK.textM}}>Draw your signature above</p>
            <button onClick={clearSig} className="text-[9px] font-semibold px-2 py-0.5 rounded" style={{color:TK.bad}}>Clear</button>
          </div>
        </div>
        :<div>
          <label className="flex items-center justify-center gap-2 py-4 rounded-xl cursor-pointer" style={{background:TK.muted,border:`2px dashed ${TK.border}`}}>
            <input type="file" accept="image/*" onChange={handleSigUpload} className="hidden"/>
            <span className="text-sm">📷</span>
            <span className="text-[11px] font-semibold" style={{color:TK.textM}}>Upload signature image</span>
          </label>
        </div>}
        {sigData&&<div className="mt-2 flex items-center gap-2 p-2 rounded-lg" style={{background:TK.okBg,border:`1px solid ${TK.ok}15`}}>
          <img src={sigData} alt="Signature" className="h-12 rounded-lg" style={{border:`1px solid ${TK.border}`}}/>
          <span className="text-[10px] font-semibold flex-1" style={{color:TK.ok}}>Signature attached</span>
          <button onClick={()=>{setSigData("");clearSig();}} className="text-red-400 text-xs hover:text-red-600">✕ Remove</button>
        </div>}
      </div>
      <div className="grid grid-cols-5 gap-2 mt-3">
        <button onClick={previewInvoice} className="py-2 rounded-xl text-[11px] font-semibold" style={{background:TK.muted,color:TK.textS,border:`1px solid ${TK.border}`}}>👁 Preview</button>
        <button onClick={()=>previewInvoice({print:true})} className="py-2 rounded-xl text-[11px] font-semibold" style={{background:TK.muted,color:TK.textS,border:`1px solid ${TK.border}`}}>📄 PDF</button>
        <button onClick={()=>createInvoice(true)} disabled={saving} className="py-2 rounded-xl text-[11px] font-semibold" style={{background:TK.muted,color:TK.textS,border:`1px solid ${TK.border}`}}>{saving?"...":"💾 Draft"}</button>
        <button onClick={()=>{const invNo=editingInvId?editingInvNo:(builderInvNo||`FEL-${String(invoices.length+1).padStart(3,"0")}`);const selectedCust=cu.find(x=>x.nm===iCu);const msg=`Invoice ${invNo}\nAmount: ${c} ${fmt(tot)}\nFrom: ${bizName}\nTo: ${selectedCust?.nm||iCu||"—"}\nDate: ${iDate} · Due: ${dueDate}`;const phone=selectedCust?.ph?.replace(/[^0-9+]/g,"")||"";const url=phone?`https://wa.me/${phone.replace("+","")}?text=${encodeURIComponent(msg)}`:`https://wa.me/?text=${encodeURIComponent(msg)}`;window.open(url,"_blank");}} className="py-2 rounded-xl text-[11px] font-semibold" style={{background:"#25D36612",color:"#25D366",border:"1px solid #25D36620"}}>💬 Share</button>
        <button onClick={()=>createInvoice(false)} disabled={saving} className="py-2 rounded-xl text-[11px] font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>{saving?"...":"📨 "+(editingInvId?"Update":(R.id==="EG"?"Submit ETA":"Send"))}</button>
      </div>
    </Modal>

    <Modal open={showQuickCust} onClose={()=>setShowQuickCust(false)} title="➕ Quick Add Customer">
      <div className="space-y-2">
        <Inp label="Customer Name *" value={qcName} onChange={setQcName} placeholder="Company or person name"/>
        <div className="grid grid-cols-2 gap-2">
          <Inp label="Phone" value={qcPhone} onChange={setQcPhone} placeholder={R.id==="EG"?"+20 10 1234 5678":"+971 50 123 4567"}/>
          <Inp label="Email" value={qcEmail} onChange={setQcEmail} placeholder="customer@company.com" type="email"/>
        </div>
        <Inp label="Address" value={qcAddr} onChange={setQcAddr} placeholder="Business address"/>
        <Inp label={R.id==="EG"?"Tax ID (TIN)":"TRN"} value={qcTin} onChange={setQcTin} placeholder={R.id==="EG"?"123456789":"100123456700003"}/>
        <button onClick={quickAddCustomer} disabled={qcSaving||!qcName.trim()} className="w-full py-2.5 rounded-xl text-sm font-bold mt-2" style={{background:!qcName.trim()?"#ccc":"linear-gradient(135deg,#C8A630,#DABC42)",color:!qcName.trim()?"#999":"#1A1510"}}>{qcSaving?"Adding...":"Add & Select Customer"}</button>
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

  const healthScore = useMemo(()=>{
    let score=50;
    const cashRatio=tO>0?tI/tO:1;
    if(cashRatio>=1.5)score+=15;else if(cashRatio>=1.2)score+=10;else if(cashRatio>=1)score+=5;else score-=15;
    const savingsRate=tI>0?(bal/tI):0;
    if(savingsRate>=0.2)score+=10;else if(savingsRate>=0.1)score+=5;else if(savingsRate<0)score-=10;
    const overdueRatio=cu.length>0?overdueCustomers.length/cu.length:0;
    if(overdueRatio===0)score+=10;else if(overdueRatio<0.2)score+=5;else score-=5;
    if(books.length>=3)score+=5;
    if(allTx.length>=10)score+=5;
    const catCount=new Set(allTx.map(t=>t.cat)).size;
    if(catCount>=3)score+=5;
    return Math.min(100,Math.max(0,score));
  },[tI,tO,bal,cu,overdueCustomers,books,allTx]);
  const healthColor=healthScore>=80?TK.ok:healthScore>=60?TK.warn:TK.bad;
  const healthLabel=healthScore>=80?"Excellent":healthScore>=60?"Good":healthScore>=40?"Fair":"Needs Attention";

  const anomalies=useMemo(()=>{
    const alerts: {icon: string; title: string; desc: string; severity: string}[]=[];
    const catAmts: Record<string,number[]>={};
    allTx.filter(t=>t.ty==="out").forEach(t=>{if(!catAmts[t.cat])catAmts[t.cat]=[];catAmts[t.cat].push(t.am);});
    Object.entries(catAmts).forEach(([cat,amts])=>{
      if(amts.length<2)return;
      const avg=amts.reduce((s,a)=>s+a,0)/amts.length;
      const latest=amts[amts.length-1];
      if(latest>avg*2)alerts.push({icon:"⚠️",title:`Unusual ${LL[cat]||cat} spending`,desc:`Latest: ${c} ${fmt(latest)} (avg: ${c} ${fmt(Math.round(avg))}) — ${((latest/avg-1)*100).toFixed(0)}% above normal`,severity:"warn"});
    });
    if(overdueCustomers.length>0){
      const totalOwed=overdueCustomers.reduce((s,x)=>s+x.ow,0);
      alerts.push({icon:"🔴",title:`${overdueCustomers.length} customers owe ${c} ${fmt(totalOwed)}`,desc:`${overdueCustomers.map(x=>x.nm).join(", ")} — send reminders`,severity:"bad"});
    }
    if(tO>tI)alerts.push({icon:"📉",title:"Negative cash flow",desc:`Spending exceeds income by ${c} ${fmt(tO-tI)}. Review expenses.`,severity:"bad"});
    const vatReserve=Math.round(tI*R.vr);
    if(vatReserve>bal*0.5)alerts.push({icon:"🏛️",title:"VAT reserve warning",desc:`Estimated VAT ${c} ${fmt(vatReserve)} is ${bal>0?((vatReserve/bal*100).toFixed(0)):"∞"}% of balance. Set aside funds.`,severity:"warn"});
    return alerts;
  },[allTx,overdueCustomers,tI,tO,bal]);

  const predictions=useMemo(()=>{
    const avgDailyIn=tI/30;const avgDailyOut=tO/30;
    const pred30In=Math.round(avgDailyIn*30);const pred30Out=Math.round(avgDailyOut*30);
    const pred30Net=pred30In-pred30Out;
    return {pred30In,pred30Out,pred30Net,runwayDays:avgDailyOut>0?Math.round(bal/avgDailyOut):999};
  },[tI,tO,bal]);

  const recurringTx=useMemo(()=>{
    const noteCount: Record<string,{count: number; total: number; cat: string}[]>={};
    const grouped: Record<string,{count: number; total: number; cat: string}>={};
    allTx.filter(t=>t.no).forEach(t=>{
      const key=t.no.toLowerCase().trim();
      if(!grouped[key])grouped[key]={count:0,total:0,cat:t.cat};
      grouped[key].count++;grouped[key].total+=t.am;
    });
    return Object.entries(grouped).filter(([_,v])=>v.count>=2).sort((a,b)=>b[1].count-a[1].count).slice(0,5);
  },[allTx]);

  const taxSuggestions=useMemo(()=>{
    const tips: string[]=[];
    if(R.id==="EG"){
      if(tI<=20000000)tips.push("Eligible for SME simplified tax (0.4%-1.5% of revenue) instead of 22.5% CIT — could save significantly.");
      const deductibleCats=["rent","salaries","utilities","maintenance"];
      const deductibleTotal=allTx.filter(t=>t.ty==="out"&&deductibleCats.includes(t.cat)).reduce((s,t)=>s+t.am,0);
      if(deductibleTotal>0)tips.push(`${c} ${fmt(deductibleTotal)} in deductible expenses (rent, salaries, utilities, maintenance) — keep receipts.`);
      tips.push("Professional services qualify for 10% VAT instead of 14% — categorize correctly.");
    }else{
      if(bal<375000)tips.push("Below AED 375K threshold — 0% corporate tax applies.");
      tips.push("Verify all supplier TRNs before claiming input VAT — FTA can deny claims.");
    }
    return tips;
  },[R,tI,bal,allTx]);

  const [msgs,setMsgs]=useState<ChatMsg[]>([{r:"ai",t:`Hi! I'm felosak AI, your finance assistant for ${R.n} ${R.fl}. I can help with:\n\n• **Cash flow analysis** across your ${books.length} books\n• **VAT & tax** calculations (${R.vl})\n• **${R.auth} compliance** & e-invoicing\n• **Customer tracking** & overdue alerts\n• **Budget insights** & expense analysis\n• **Cash book management** tips\n\nAsk me anything! 💰`}]);
  const [inp,setInp]=useState("");const [typ,setTyp]=useState(false);const ref=useRef<HTMLDivElement>(null);
  const [quickQ]=useState(["What's my cash flow?","VAT breakdown","Overdue customers","Top expenses","Compare my books","Tax liability","Budget advice","Health score","Predictions","Anomalies"]);

  const send=(text?: string)=>{
    const q=(text||inp).trim();if(!q)return;setMsgs(p=>[...p,{r:"u",t:q}]);setInp("");setTyp(true);
    setTimeout(()=>{const lo=q.toLowerCase();let r: string;
      if(lo.includes("cash flow")||lo.includes("flow")||lo.includes("overview")||lo.includes("summary")){
        const bestBook=books.length>0?books.reduce((a,b)=>{const bi=b.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0)-b.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);const ai=a.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0)-a.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);return bi>ai?b:a;}):null;
        r=`📊 **Cash Flow Summary**\n\nTotal across **${books.length} books**: **${c} ${fmt(bal)}** net\n• Income: **${c} ${fmt(tI)}**\n• Expenses: **${c} ${fmt(tO)}**\n• Cash flow ratio: **${(tI/Math.max(tO,1)*100).toFixed(0)}%**\n\n${bestBook?`🏆 Best performing: **${bestBook.icon} ${bestBook.name}**\n\n`:""} ${bal>0?"✅ Positive cash flow — healthy position.":"⚠️ Negative cash flow — review expenses urgently."}`;
      }
      else if(lo.includes("vat")||lo.includes("ضريبة")){
        const oV=Math.round(tI*R.vr);const iV=Math.round(tO*R.vr);const nV=oV-iV;
        r=`🧾 **VAT Breakdown (${R.vl})**\n\n• Output VAT (on sales): **${c} ${fmt(oV)}**\n• Input VAT (on purchases): **${c} ${fmt(iV)}**\n• **Net VAT Payable: ${c} ${fmt(nV)}**\n\n${R.id==="EG"?"📅 Filing: Monthly via ETA portal, within 30 days after period end.\n\n📋 **Rates**: 14% standard goods/services. **10% on professional/consultancy services.**\n\n⚠️ VAT registration mandatory if annual revenue > EGP 500,000.\n\n💡 **Tip**: Keep all purchase e-invoices (paper NOT accepted). Claim input VAT to reduce liability. WHT of 1%–3% applies on vendor payments.":"📅 Filing: Quarterly/monthly via FTA portal, due 28 days after period.\n\n⚠️ **2026 Updates**: 5-year refund deadline now applies. Verify supplier TRN before claiming input VAT."}`;
      }
      else if(lo.includes("tax")||lo.includes("corporate")||lo.includes("income tax")){
        const ct=R.id==="EG"?Math.round(Math.max(0,bal)*R.ct):Math.round(Math.max(0,bal-R.ctT)*R.ct);
        const smeOk=R.id==="EG"&&tI<=20000000;
        const smeNote=smeOk?"\n\n💰 **SME Incentive (Law 5 & 6 of 2025)**: Revenue under EGP 20M qualifies for simplified fixed-rate tax (0.4%-1.5% of revenue) instead of 22.5% CIT. Stamp duty exemptions apply.":"";
        const egTax="📅 Annual filing by April 30. Accounting period: Jan 1 – Dec 31."+smeNote+"\n\n⚠️ **WHT**: 1%-3% withheld on vendor/service payments.\n\n💡 Deductible: salaries, rent, depreciation, bad debts (documented). Keep records 5 years.";
        const aeTax="📅 Filing: 9 months after financial year end.\n\n💡 Small business relief available if revenue < AED 3M.";
        const threshLine=R.id==="AE"?"• Threshold: "+c+" 375,000 (0% below)\n• Rate: 9% above threshold\n":"• Standard CIT rate: 22.5% on net profits\n";
        r="🏛️ **Tax Liability ("+R.n+")**\n\n• Taxable profit: **"+c+" "+fmt(Math.max(0,bal))+"**\n"+threshLine+"• **Estimated CIT: "+c+" "+fmt(ct)+"**\n\n"+(R.id==="EG"?egTax:aeTax);
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
        r=`💰 **Budget & Savings**\n\n• Savings rate: **${savingsRate}%**\n• ${parseFloat(savingsRate)>20?"✅ Excellent!":parseFloat(savingsRate)>10?"⚠️ Fair. Aim for 20%.":"❌ Low. Review spending."}\n\n**Tips for ${R.n}:**\n• Reserve **${Math.round(R.vr*100)}%** for VAT\n• Emergency fund: 3-6 months costs\n• ${R.id==="EG"?"T-Bills ~22% yield":"UAE Sukuk 4-5% yield"}`;
      }
      else if(lo.includes("invoice")||lo.includes("فاتورة")){
        r=`📄 **Invoicing (${R.n})**\n\n**${R.auth} Requirements:**\n• Format: ${R.fmt}\n• Signature: ${R.sig}\n• Archive: ${R.arch} years\n${R.id==="EG"?"• Clearance model: invoice validated by ETA before reaching buyer\n• Mandatory fields: UUID, Seller/Buyer TIN, UIN (39-char), GS1/GPC item codes, QR code\n• Paper invoices NOT accepted for tax deductions\n• B2C: E-Receipts via POS integration mandatory":"• TRN required, Peppol CTC pilot July 2026"}\n\n**Tips:**\n• Send within 24h of delivery\n• Follow up at 7, 14, 21 days\n${R.id==="EG"?"• Validate buyer TIN + UIN before submission\n• Map all items to GS1/GPC codes":""}`;
      }
      else if(lo.includes("health")||lo.includes("score")){
        r=`🏥 **Financial Health Score: ${healthScore}/100 (${healthLabel})**\n\n${healthScore>=80?"✅ Excellent! Your finances are well-managed.":healthScore>=60?"⚠️ Good but room for improvement.":"❌ Needs attention — review spending and collections."}\n\n**Breakdown:**\n• Cash ratio: ${(tI/Math.max(tO,1)).toFixed(2)}x ${tI>=tO?"✅":"❌"}\n• Savings rate: ${tI>0?((bal/tI)*100).toFixed(1):"0"}%\n• Overdue customers: ${overdueCustomers.length}/${cu.length}\n• Active books: ${books.length}\n• Transaction diversity: ${new Set(allTx.map(t=>t.cat)).size} categories`;
      }
      else if(lo.includes("predict")||lo.includes("forecast")||lo.includes("next")||lo.includes("future")){
        r=`🔮 **30-Day Cash Flow Prediction**\n\nBased on current patterns:\n• Projected Income: **${c} ${fmt(predictions.pred30In)}**\n• Projected Expenses: **${c} ${fmt(predictions.pred30Out)}**\n• **Net: ${c} ${fmt(predictions.pred30Net)}**\n\n${predictions.pred30Net>=0?"✅ Positive outlook":"⚠️ Projected deficit — reduce spending"}\n\n💰 **Cash Runway: ${predictions.runwayDays} days** at current burn rate\n${predictions.runwayDays<60?"⚠️ Less than 2 months runway — build reserves":"✅ Comfortable runway"}`;
      }
      else if(lo.includes("anomal")||lo.includes("unusual")||lo.includes("alert")||lo.includes("warning")){
        r=anomalies.length>0?`🚨 **${anomalies.length} Smart Alerts**\n\n${anomalies.map(a=>`${a.icon} **${a.title}**\n${a.desc}`).join("\n\n")}`:"✅ **No anomalies detected!** Your spending patterns look normal.";
      }
      else if(lo.includes("recurring")||lo.includes("repeat")||lo.includes("subscription")){
        r=recurringTx.length>0?`🔄 **Recurring Transactions Detected**\n\n${recurringTx.map(([note,v])=>`• **${note}**: ${v.count} times, total ${c} ${fmt(v.total)} (${LL[v.cat]||v.cat})`).join("\n")}\n\n💡 Track these as subscriptions for better budgeting.`:"No recurring patterns detected yet. Add more transactions to enable pattern detection.";
      }
      else if(lo.includes("tax sav")||lo.includes("deduct")||lo.includes("optimize")){
        r=`💡 **Tax Savings Tips (${R.n})**\n\n${taxSuggestions.map((t,i)=>`${i+1}. ${t}`).join("\n\n")}\n\n📌 Always consult a local tax advisor for specific guidance.`;
      }
      else {
        r=`Try asking about:\n• **"Cash flow"** — overview\n• **"VAT breakdown"** — ${R.vl}\n• **"Tax liability"** — corporate tax\n• **"Health score"** — financial health\n• **"Predictions"** — 30-day forecast\n• **"Anomalies"** — spending alerts\n• **"Recurring"** — pattern detection\n• **"Tax savings"** — optimization tips\n• **"Overdue customers"** — receivables\n• **"Compare books"** — book comparison`;
      }
      setMsgs(p=>[...p,{r:"ai",t:r}]);setTyp(false);
    },1200);
  };
  useEffect(()=>{ref.current&&(ref.current.scrollTop=ref.current.scrollHeight);},[msgs,typ]);

  const vari=[{c:"Revenue",cur:tI,pri:Math.round(tI*0.88),ch:"+13.6%",cl:TK.ok},{c:"Salaries",cur:7500,pri:6800,ch:"+10.3%",cl:TK.bad},{c:"Inventory",cur:3200,pri:4100,ch:"-22.0%",cl:TK.ok},{c:"Rent",cur:5000,pri:5000,ch:"0%",cl:TK.textM}];

  return <div className="space-y-4">
    <h1 className="text-lg font-bold" style={{color:TK.text}}>{LL.ai} — {R.fl} {R.n}</h1>

    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke={`${healthColor}20`} strokeWidth="3"/>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke={healthColor} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${healthScore*0.975} 97.5`}/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center"><span className="text-lg font-black" style={{color:healthColor}}>{healthScore}</span></div>
        </div>
        <div className="flex-1">
          <p className="text-[9px] uppercase font-bold tracking-widest" style={{color:TK.textM}}>Financial Health Score</p>
          <p className="text-sm font-bold" style={{color:healthColor}}>{healthLabel}</p>
          <p className="text-[10px] mt-0.5" style={{color:TK.textM}}>Cash: {(tI/Math.max(tO,1)).toFixed(1)}x · Savings: {tI>0?((bal/tI)*100).toFixed(0):"0"}% · Runway: {predictions.runwayDays}d</p>
        </div>
      </div>
    </Card>

    {anomalies.length>0&&<Card className="p-4" style={{borderColor:`${TK.warn}30`}}>
      <p className="text-[9px] uppercase font-bold tracking-widest mb-2" style={{color:TK.warn}}>🚨 Smart Alerts ({anomalies.length})</p>
      <div className="space-y-2">{anomalies.slice(0,3).map((a,i)=><div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{background:a.severity==="bad"?TK.badBg:TK.warnBg}}>
        <span className="text-sm flex-shrink-0">{a.icon}</span>
        <div><p className="text-[11px] font-semibold" style={{color:a.severity==="bad"?TK.bad:TK.warn}}>{a.title}</p><p className="text-[10px]" style={{color:TK.textS}}>{a.desc}</p></div>
      </div>)}</div>
    </Card>}

    <div className="grid grid-cols-3 gap-2">
      <Card className="p-3 text-center"><p className="text-[8px] uppercase font-bold" style={{color:TK.textM}}>30d Income</p><p className="text-sm font-black" style={{color:TK.ok}}>{c} {fmt(predictions.pred30In)}</p></Card>
      <Card className="p-3 text-center"><p className="text-[8px] uppercase font-bold" style={{color:TK.textM}}>30d Expense</p><p className="text-sm font-black" style={{color:TK.bad}}>{c} {fmt(predictions.pred30Out)}</p></Card>
      <Card className="p-3 text-center"><p className="text-[8px] uppercase font-bold" style={{color:TK.textM}}>30d Net</p><p className="text-sm font-black" style={{color:predictions.pred30Net>=0?TK.ok:TK.bad}}>{c} {fmt(predictions.pred30Net)}</p></Card>
    </div>

    {recurringTx.length>0&&<Card className="p-4">
      <p className="text-[9px] uppercase font-bold tracking-widest mb-2" style={{color:TK.info}}>🔄 Recurring Patterns Detected</p>
      <div className="space-y-1">{recurringTx.map(([note,v],i)=><div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{background:TK.muted}}>
        <div><p className="text-[11px] font-semibold" style={{color:TK.text}}>{note}</p><p className="text-[9px]" style={{color:TK.textM}}>{v.count}x · {LL[v.cat]||v.cat}</p></div>
        <span className="text-[11px] font-bold" style={{color:TK.accent}}>{c} {fmt(v.total)}</span>
      </div>)}</div>
    </Card>}

    {taxSuggestions.length>0&&<Card className="p-4">
      <p className="text-[9px] uppercase font-bold tracking-widest mb-2" style={{color:TK.ok}}>💡 Tax Optimization Tips</p>
      <div className="space-y-1.5">{taxSuggestions.map((tip,i)=><div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{background:TK.okBg}}>
        <span className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background:TK.ok,color:"#fff"}}>{i+1}</span>
        <p className="text-[10px]" style={{color:TK.textS}}>{tip}</p>
      </div>)}</div>
    </Card>}

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
  const rev=tI;
  const smeEligible=R.id==="EG"&&R.smeThreshold&&rev<=R.smeThreshold;
  const smeTier=smeEligible&&R.smeTiers?R.smeTiers.find(t=>rev<=t.max):null;
  const smeTax=smeTier?Math.round(rev*parseFloat(smeTier.rate)/100):0;

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><div><h1 className="text-lg font-bold" style={{color:TK.text}}>{R.fl} Compliance — {R.n}</h1><p className="text-[10px]" style={{color:TK.textM}}>{R.auth} • {R.vl} • {R.tin||""}</p></div><Badge t={R.eM?"Active":"Pilot"} c={R.eM?TK.ok:TK.warn}/></div>

    {R.id==="EG"&&<Card className="p-4" style={{background:TK.infoBg,borderColor:`${TK.info}20`}}>
      <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{color:TK.info}}>🏛️ Core Tax Identifiers</h3>
      <div className="grid grid-cols-2 gap-2">
        {[["Taxpayer ID (TIN)",R.tin||""],["VAT Threshold","EGP 500,000/yr"],["WHT on Services",R.wht||""],["Prof. Services VAT",`${(R.profVat||0)*100}%`],["E-Signature","Egypt Trust / Misr Tech"],["Record Retention",`${R.arch} years`]].map(([l,v],i)=>
          <div key={i} className="p-2 rounded-lg bg-white"><p className="text-[9px] font-bold" style={{color:TK.info}}>{l}</p><p className="text-[11px] font-semibold" style={{color:TK.text}}>{v}</p></div>
        )}
      </div>
    </Card>}

    <Card className="p-4"><h3 className="text-sm font-bold mb-1" style={{color:TK.text}}>{LL.vatSum} — {R.vl}{R.id==="EG"?" (Professional: 10%)":""}</h3>
      <div className="grid grid-cols-3 gap-2 mt-3">{[[LL.outVat,oV,TK.ok,TK.okBg],[LL.inVat,iV,TK.bad,TK.badBg],[LL.netVat,nV,TK.accent,TK.accentBg]].map(([l,v,cl,bg],i)=>
        <div key={i} className="p-3 rounded-xl text-center" style={{background:bg as string}}><p className="text-[9px] font-bold" style={{color:cl as string}}>{l as string}</p><p className="text-base font-black mt-0.5" style={{color:TK.text}}>{c} {fmt(v as number)}</p></div>
      )}</div>
      {R.id==="EG"&&<p className="text-[9px] mt-2" style={{color:TK.textM}}>Standard VAT 14% on goods/services. Professional/consultancy services taxed at 10%. Monthly filing within 30 days after period end.</p>}
    </Card>

    <Card className="p-4"><h3 className="text-sm font-bold mb-1" style={{color:TK.text}}>{LL.corpTax} — {R.id==="EG"?"22.5% on net profits":"0%→9% (AED 375K)"}</h3>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="p-3 rounded-xl" style={{background:TK.muted}}><p className="text-[9px] font-bold" style={{color:TK.textM}}>Taxable Profit</p><p className="text-base font-black" style={{color:TK.text}}>{c} {fmt(Math.max(0,pr))}</p>{R.id==="AE"&&pr<=R.ctT&&<p className="text-[9px] mt-0.5" style={{color:TK.ok}}>Below threshold ✓</p>}</div>
        <div className="p-3 rounded-xl" style={{background:TK.accentBg}}><p className="text-[9px] font-bold" style={{color:TK.accent}}>Est. CIT (22.5%)</p><p className="text-base font-black" style={{color:TK.accent}}>{c} {fmt(ct)}</p></div>
      </div>
      {R.id==="EG"&&<p className="text-[9px] mt-2" style={{color:TK.textM}}>Annual return due April 30. Accounting period: Jan 1 – Dec 31. WHT {R.wht} deducted on vendor payments.</p>}
    </Card>

    {R.id==="EG"&&smeEligible&&<Card className="p-4" style={{background:TK.okBg,borderColor:`${TK.ok}20`}}>
      <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{color:TK.ok}}>💰 SME Simplified Tax (Law 5 & 6 of 2025)</h3>
      <p className="text-[10px] mb-2" style={{color:TK.textM}}>Your revenue EGP {fmt(rev)} qualifies for simplified fixed-rate tax instead of 22.5% CIT.</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="p-2.5 rounded-xl bg-white"><p className="text-[9px] font-bold" style={{color:TK.ok}}>SME Tax Rate</p><p className="text-base font-black" style={{color:TK.ok}}>{smeTier?.rate||"—"}</p></div>
        <div className="p-2.5 rounded-xl bg-white"><p className="text-[9px] font-bold" style={{color:TK.ok}}>Est. SME Tax</p><p className="text-base font-black" style={{color:TK.ok}}>{c} {fmt(smeTax)}</p></div>
      </div>
      <div className="p-2 rounded-lg bg-white"><p className="text-[9px] font-bold mb-1" style={{color:TK.text}}>SME Tax Tiers (Turnover ≤ EGP 20M)</p>
        <div className="space-y-0.5">{R.smeTiers?.map((t,i)=><div key={i} className="flex justify-between text-[9px]" style={{color:rev<=t.max&&(!R.smeTiers?.[i-1]||rev>R.smeTiers[i-1].max)?TK.ok:TK.textM}}>
          <span>≤ EGP {(t.max/1000000).toFixed(1)}M</span><span className="font-bold">{t.rate} of revenue</span>
        </div>)}</div>
      </div>
      <p className="text-[9px] mt-2" style={{color:TK.textM}}>Savings vs CIT: <strong style={{color:TK.ok}}>EGP {fmt(ct-smeTax)}</strong>. Also exempt from stamp duty with reduced compliance obligations.</p>
    </Card>}

    {R.id==="EG"&&R.eInvFields&&<Card className="p-4">
      <h3 className="text-sm font-bold mb-1 flex items-center gap-1.5" style={{color:TK.text}}>🧾 E-Invoicing Requirements (B2B & B2G)</h3>
      <p className="text-[10px] mb-2" style={{color:TK.textM}}>Mandatory since April 2023. {R.eInvModel}. Paper invoices NOT recognized for tax deductions.</p>
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {[["Format",R.fmt],["Model","Clearance"],["Coding",R.pc],["B2C","E-Receipts (POS)"]].map(([l,v],i)=>
          <div key={i} className="p-2 rounded-lg" style={{background:TK.muted}}><p className="text-[9px] font-bold" style={{color:TK.textM}}>{l}</p><p className="text-[11px] font-semibold" style={{color:TK.text}}>{v}</p></div>
        )}
      </div>
      <p className="text-[9px] font-bold mb-1" style={{color:TK.text}}>Mandatory Invoice Fields:</p>
      <div className="space-y-1">{R.eInvFields.map((f,i)=>
        <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{background:TK.muted}}>
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{background:TK.accentBg,color:TK.accent}}>{i+1}</span>
          <div><p className="text-[10px] font-bold" style={{color:TK.text}}>{f.l}</p><p className="text-[9px]" style={{color:TK.textM}}>{f.d}</p></div>
        </div>
      )}</div>
    </Card>}

    {R.v26&&<Card className="p-4" style={{background:R.id==="EG"?TK.accentBg:TK.warnBg,borderColor:`${R.id==="EG"?TK.accent:TK.warn}20`}}>
      <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{color:R.id==="EG"?TK.accent:TK.warn}}>⚠️ {R.id==="EG"?"Egypt 2025–2026 Legal Updates":"UAE 2026 VAT Amendments"}</h3>
      <div className="space-y-1.5">{R.v26.map((a,i)=><div key={i} className="p-2.5 rounded-xl bg-white"><p className="text-[11px] font-bold" style={{color:TK.text}}>{a.t}</p><p className="text-[10px] mt-0.5" style={{color:TK.textM}}>{a.d}</p></div>)}</div>
    </Card>}

    {R.id==="EG"&&R.implSteps&&<Card className="p-4">
      <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{color:TK.text}}>🚀 Implementation Checklist</h3>
      <p className="text-[10px] mb-2" style={{color:TK.textM}}>Steps to set up ETA-compliant billing system:</p>
      <div className="space-y-1.5">{R.implSteps.map((s,i)=>
        <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl" style={{background:TK.muted}}>
          <span className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background:TK.accentBg,color:TK.accent}}>{i+1}</span>
          <p className="text-[10px] font-medium" style={{color:TK.text}}>{s}</p>
        </div>
      )}</div>
    </Card>}

    <Card className="p-4"><h3 className="text-sm font-bold mb-3 flex items-center gap-1.5" style={{color:TK.text}}>📅 {LL.taxCal}</h3>
      <div className="space-y-1.5">{R.cal.map((ev,i)=><div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{background:TK.muted}}>
        <span className="text-xs">{ev.r?"🔄":"⏰"}</span>
        <div className="flex-1"><p className="text-[11px] font-semibold" style={{color:TK.text}}>{ev.e}</p><p className="text-[10px]" style={{color:TK.textM}}>Deadline: {ev.d}</p></div>
        <Badge t={ev.r?"Recurring":"One-time"} c={ev.r?TK.info:TK.warn}/>
      </div>)}</div></Card>

    {R.id==="EG"&&<Card className="p-3" style={{background:TK.warnBg,borderColor:`${TK.warn}20`}}>
      <p className="text-[9px]" style={{color:TK.warn}}>⚠️ <strong>Disclaimer:</strong> Tax regulations in Egypt are updated frequently (especially with 2025 laws). Engage a local Egyptian tax advisor to ensure full compliance. Data reflects laws as of 2025/2026.</p>
    </Card>}
  </div>;
};

const SetPg = ({R,user,onLogout,onUserUpdate}: {R: RegionInfo; user: UserData; onLogout: () => void; onUserUpdate: (u: UserData) => void}) => {
  const [section,setSection]=useState<"profile"|"business"|"bank"|null>(null);
  const [pName,setPName]=useState(user.name||"");
  const [bName,setBName]=useState(user.bankName||"");
  const [bAcct,setBAcct]=useState(user.bankAccount||"");
  const [bIban,setBIban]=useState(user.bankIban||"");
  const [bSwift,setBSwift]=useState(user.bankSwift||"");
  const [pLink,setPLink]=useState(user.paymentLink||"");
  const [bizName,setBizName]=useState(user.businessName||"");
  const [bizPhone,setBizPhone]=useState(user.businessPhone||"");
  const [bizAddr,setBizAddr]=useState(user.businessAddress||"");
  const [taxId,setTaxId]=useState(user.taxId||"");
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState("");
  const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);

  const saveSection=async(sec: string, data: Record<string,string>)=>{
    setSaving(true);
    try {
      const res = await api.auth.updateProfile(data);
      onUserUpdate(res.user);
      setSaved(sec); setTimeout(()=>setSaved(""),2000);
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const hasBankSetup = user.bankName || user.bankAccount || user.bankIban || user.paymentLink;
  const hasBizSetup = user.businessName || user.businessPhone || user.businessAddress || user.taxId;
  const initials = user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  return <div className="space-y-4">
    <h1 className="text-lg font-bold" style={{color:TK.text}}>{LL.settings}</h1>

    <Card className="p-4">
      <div className="flex items-center gap-4 p-4 rounded-xl" style={{background:`linear-gradient(135deg,${TK.accent}08,${TK.accent}15)`}}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0" style={{background:`linear-gradient(135deg,${TK.accent},#DABC42)`,color:"#1A1510"}}>{initials}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{color:TK.text}}>{user.name}</p>
          <p className="text-[10px] truncate" style={{color:TK.textM}}>{user.email}</p>
          {user.businessName&&<p className="text-[10px] font-semibold mt-0.5" style={{color:TK.accent}}>{user.businessName}</p>}
        </div>
        <button onClick={()=>setSection(section==="profile"?null:"profile")} className="text-[10px] font-semibold px-3 py-1.5 rounded-full flex-shrink-0" style={{background:TK.accentBg,color:TK.accent}}>{section==="profile"?"Close":"Edit"}</button>
      </div>
      {section==="profile"&&<div className="space-y-3 pt-3 mt-3" style={{borderTop:`1px solid ${TK.borderL}`}}>
        <Inp label="Full Name" value={pName} onChange={setPName} placeholder="Your full name"/>
        <p className="text-[9px]" style={{color:TK.textM}}>Email: {user.email} (cannot be changed)</p>
        <button onClick={()=>saveSection("profile",{name:pName})} disabled={saving} className="w-full py-2 rounded-xl text-xs font-bold" style={{background:saved==="profile"?"#22A06B":"linear-gradient(135deg,#C8A630,#DABC42)",color:saved==="profile"?"#fff":"#1A1510"}}>{saving?"Saving...":saved==="profile"?"✓ Saved!":"Save Profile"}</button>
      </div>}
    </Card>

    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{background:`${TK.accent}12`}}>{R.fl}</div><div><p className="text-xs font-semibold" style={{color:TK.text}}>{R.n}</p><p className="text-[10px]" style={{color:TK.textM}}>{R.auth} • {R.vl} • {R.cur}</p></div></div>
        <Badge t={R.eM?"Compliant":"Pilot"} c={R.eM?TK.ok:TK.warn}/>
      </div>
      <div className="mt-3 pt-3 space-y-1.5" style={{borderTop:`1px solid ${TK.borderL}`}}>
        {(R.id==="EG"?[["VAT","14% (Professional: 10%)"],["Corp Tax","22.5% (SME: 0.4%–1.5%)"],["E-Invoice","ETA — Mandatory (real-time clearance)"],["WHT","1%–3% on services"],["Archival","5 years"],["Social Ins","11% + 18.75%"]]:[["VAT","5% (Zero-rate & exempt handling)"],["Corp Tax","0% up to AED 375K, then 9%"],["E-Invoice","FTA — Pilot 2026 (Peppol CTC ready)"],["WHT","0%"],["Archival","5 years"],["Social Ins","5% + 12.5% (nationals)"]]).map(([label,val],i)=>
          <div key={i} className="flex justify-between items-center py-1.5 px-2 rounded-lg text-[10px]" style={{background:i%2===0?TK.muted:"transparent"}}>
            <span className="font-bold" style={{color:TK.text}}>{label}</span>
            <span className="font-semibold" style={{color:TK.accent}}>{val}</span>
          </div>
        )}
      </div>
    </Card>

    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${TK.info}12`}}>🏢</div><div><p className="text-xs font-semibold" style={{color:TK.text}}>Business Profile</p><p className="text-[10px]" style={{color:TK.textM}}>{hasBizSetup?[user.businessName,user.taxId?"TIN: "+user.taxId:""].filter(Boolean).join(" · "):"Not configured"}</p></div></div>
        <button onClick={()=>setSection(section==="business"?null:"business")} className="text-[10px] font-semibold px-3 py-1 rounded-full" style={{background:TK.accentBg,color:TK.accent}}>{section==="business"?"Close":"Edit"}</button>
      </div>
      {section==="business"&&<div className="space-y-3 pt-3 mt-3" style={{borderTop:`1px solid ${TK.borderL}`}}>
        <div className="grid grid-cols-2 gap-2">
          <Inp label="Business Name" value={bizName} onChange={setBizName} placeholder="Your Company Name"/>
          <Inp label="Business Phone" value={bizPhone} onChange={setBizPhone} placeholder={R.id==="EG"?"+20 10 1234 5678":"+971 50 123 4567"}/>
        </div>
        <Inp label="Business Address" value={bizAddr} onChange={setBizAddr} placeholder={R.id==="EG"?"15 Tahrir St, Cairo, Egypt":"Dubai Media City, Dubai, UAE"} textarea/>
        <Inp label={R.id==="EG"?"Tax ID (TIN) — 9-digit":"Tax Registration Number (TRN)"} value={taxId} onChange={setTaxId} placeholder={R.id==="EG"?"123456789":"100123456700003"}/>
        <p className="text-[9px]" style={{color:TK.textM}}>{R.id==="EG"?"Your 9-digit TIN is required for ETA e-invoicing compliance. Get it from the ETA portal.":"Your TRN is required for FTA tax invoices. Format: 15 digits."}</p>
        <button onClick={()=>saveSection("business",{businessName:bizName,businessPhone:bizPhone,businessAddress:bizAddr,taxId})} disabled={saving} className="w-full py-2 rounded-xl text-xs font-bold" style={{background:saved==="business"?"#22A06B":"linear-gradient(135deg,#C8A630,#DABC42)",color:saved==="business"?"#fff":"#1A1510"}}>{saving?"Saving...":saved==="business"?"✓ Saved!":"Save Business Info"}</button>
      </div>}
    </Card>

    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${TK.accent}12`}}>💳</div><div><p className="text-xs font-semibold" style={{color:TK.text}}>Payment Details</p><p className="text-[10px]" style={{color:TK.textM}}>{hasBankSetup?"Configured — shown on invoices":"Not configured"}</p></div></div>
        <button onClick={()=>setSection(section==="bank"?null:"bank")} className="text-[10px] font-semibold px-3 py-1 rounded-full" style={{background:TK.accentBg,color:TK.accent}}>{section==="bank"?"Close":"Edit"}</button>
      </div>
      {section==="bank"&&<div className="space-y-3 pt-3 mt-3" style={{borderTop:`1px solid ${TK.borderL}`}}>
        <p className="text-[9px] font-bold uppercase tracking-wider" style={{color:TK.textM}}>Bank Account</p>
        <div className="grid grid-cols-2 gap-2">
          <Inp label="Bank Name" value={bName} onChange={setBName} placeholder={R.id==="EG"?"e.g. CIB, Banque Misr, NBE":"e.g. Emirates NBD, ADCB"} options={R.id==="EG"?[{v:"",l:"— Select or type —"},{v:"CIB",l:"CIB"},{v:"National Bank of Egypt",l:"NBE"},{v:"Banque Misr",l:"Banque Misr"},{v:"QNB Al Ahli",l:"QNB Al Ahli"},{v:"HSBC Egypt",l:"HSBC Egypt"},{v:"Bank of Alexandria",l:"Alex Bank"},{v:"Faisal Islamic Bank",l:"Faisal Islamic"}]:[{v:"",l:"— Select or type —"},{v:"Emirates NBD",l:"Emirates NBD"},{v:"ADCB",l:"ADCB"},{v:"First Abu Dhabi Bank",l:"FAB"},{v:"Mashreq",l:"Mashreq"},{v:"Dubai Islamic Bank",l:"DIB"},{v:"RAKBank",l:"RAKBank"}]}/>
          <Inp label="Account Number" value={bAcct} onChange={setBAcct} placeholder="1234567890"/>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Inp label="IBAN" value={bIban} onChange={setBIban} placeholder={R.id==="EG"?"EG38 0019 0005 0000 0000 1234 5":"AE07 0331 2345 6789 0123 456"}/>
          <Inp label="SWIFT/BIC" value={bSwift} onChange={setBSwift} placeholder={R.id==="EG"?"CIBEEGCX":"EABORADR"}/>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-wider mt-2" style={{color:TK.textM}}>Payment Link</p>
        <Inp label="Online Payment URL" value={pLink} onChange={setPLink} placeholder="https://pay.fawry.io/your-link or https://www.paypal.me/..."/>
        <p className="text-[9px]" style={{color:TK.textM}}>Accepts: Fawry, InstaPay, PayPal, Stripe, Paymob, or any payment URL. Shown on invoice reminders.</p>
        <button onClick={()=>saveSection("bank",{bankName:bName,bankAccount:bAcct,bankIban:bIban,bankSwift:bSwift,paymentLink:pLink})} disabled={saving} className="w-full py-2 rounded-xl text-xs font-bold" style={{background:saved==="bank"?"#22A06B":"linear-gradient(135deg,#C8A630,#DABC42)",color:saved==="bank"?"#fff":"#1A1510"}}>{saving?"Saving...":saved==="bank"?"✓ Saved!":"Save Payment Details"}</button>
      </div>}
    </Card>

    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${TK.bad}12`}}>⚠️</div><div><p className="text-xs font-semibold" style={{color:TK.text}}>Danger Zone</p><p className="text-[10px]" style={{color:TK.textM}}>Delete account and all data</p></div></div>
      </div>
      {!showDeleteConfirm?<button onClick={()=>setShowDeleteConfirm(true)} className="w-full mt-3 py-2 rounded-xl text-[11px] font-semibold" style={{color:TK.bad,border:`1px solid ${TK.bad}20`}}>Delete My Account</button>
      :<div className="mt-3 p-3 rounded-xl space-y-2" style={{background:TK.badBg,border:`1px solid ${TK.bad}20`}}>
        <p className="text-[11px] font-semibold" style={{color:TK.bad}}>This will permanently delete your account, all cash books, invoices, and customer data. This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={()=>setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-xl text-[11px] font-semibold" style={{background:"#fff",color:TK.textS,border:`1px solid ${TK.border}`}}>Cancel</button>
          <button onClick={async()=>{try{await api.auth.deleteAccount();onLogout();}catch(e){console.error(e);}}} className="flex-1 py-2 rounded-xl text-[11px] font-bold" style={{background:TK.bad,color:"#fff"}}>Confirm Delete</button>
        </div>
      </div>}
    </Card>

    <button onClick={onLogout} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold" style={{color:TK.bad,border:`1px solid ${TK.bad}20`}}>🚪 {LL.logout}</button>
    <p className="text-center text-[9px] pb-4" style={{color:TK.textM}}>felosak v1.0 · www.felosak.com · support@felosak.com</p>
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
  const [showLogin,setShowLogin]=useState(false);

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
    setUser(null); setReg(null); setBooks([]); setCustomers([]); setInvoices([]); setShowLogin(false);
  };

  if(!authChecked) return <div className="min-h-screen flex items-center justify-center" style={{background:TK.bg}}><Spinner/></div>;
  if(!user && !showLogin) return <FelosakWebsite onGoToLogin={()=>setShowLogin(true)}/>;
  if(!user) return <Login onLogin={handleLogin} onBack={()=>setShowLogin(false)}/>;
  if(!reg) return <RegSel onSel={async(r)=>{setReg(r);try{await api.auth.updateProfile({region:r});}catch(e){}}}/>;
  const R=RG[reg];

  const nav=[{id:"dash",i:"📊",l:LL.dashboard},{id:"cash",i:"📒",l:LL.cash},{id:"inv",i:"📄",l:LL.invoices},{id:"ai",i:"⚡",l:LL.ai},{id:"comp",i:"⚖️",l:LL.compliance},{id:"set",i:"⚙️",l:LL.settings}];

  const page=()=>{
    if(loading && books.length===0) return <Spinner/>;
    switch(pg){
      case "dash":return <Dash R={R} books={books} cu={customers} onNav={setPg}/>;
      case "cash":return <CashBookPg R={R} books={books} reload={loadData} cu={customers} invoices={invoices}/>;
      case "inv":return <InvPg R={R} cu={customers} invoices={invoices} reload={loadData} user={user}/>;
      case "ai":return <AiPg R={R} books={books} cu={customers}/>;
      case "comp":return <CompPg R={R} books={books}/>;
      case "set":return <SetPg R={R} user={user} onLogout={handleLogout} onUserUpdate={setUser}/>;
      default:return null;
    }
  };

  return <div className="flex h-screen overflow-hidden" style={{background:TK.bg,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
    <aside className={`${sb?"w-52":"w-14"} transition-all duration-300 flex flex-col bg-white border-r shrink-0`} style={{borderColor:TK.border}}>
      <div className={`p-3 flex items-center ${sb?"gap-2.5":"justify-center"}`}>
        <img src={logoImg} alt="felosak" className={`${sb?"h-5":"h-4"} flex-shrink-0`}/>
        {sb&&<div><p className="text-[8px]" style={{color:TK.textM}}>{R.fl} {R.n} • {R.cur}</p></div>}
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
