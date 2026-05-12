import { clsx } from 'clsx';
import { db, collection, getDocs, query, where } from './firebase';
import { getAIInsights, askAI } from '@/lib/ai/insights';
import { LogOut } from "lucide-react";
import { twMerge } from 'tailwind-merge';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  GraduationCap, 
  Ticket, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle, 
  Plus, 
  Eye, 
  MoreVertical, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Download,
  FileText,
  Menu,
  Sparkles,
  Trash2,
  X,
  Search  // ← Add this
} from "lucide-react";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { api } from "./api";
const logoImg = null;
import FelosakWebsite from "./Website";
import { CashInOut } from './pages/CashInOut';

const TK = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  muted: "#F1F5F9",
  border: "#E2E8F0",
  borderL: "#F1F5F9",
  text: "#0F172A",
  textS: "#64748B",
  textM: "#94A3B8",
  accent: "#6366F1",
  accentBg: "#EEF2FF",
  accentD: "#4F46E5",
  ok: "#10B981",
  okBg: "#ECFDF5",
  bad: "#EF4444",
  badBg: "#FEF2F2",
  warn: "#F59E0B",
  warnBg: "#FFFBEB",
  info: "#3B82F6",
  infoBg: "#EFF6FF",
  sh: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  shM: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};
// Update the chart colors array



interface CalEvent { e: string; d: string; r: boolean }
interface V26Item { t: string; d: string }
interface EInvField { l: string; d: string }
interface SMETier { max: number; rate: string }









interface TxItem { id: number; ty: string; am: number; cat: string; no: string; dt: string; payMode?: string; proof?: string|null }
interface BookMember { id: number; name: string; email: string; role: "admin"|"editor"|"viewer"; avatar: string }
interface CashBook {
  id: number; name: string; type: "business" | "personal";
  icon: string; color: string; tx: TxItem[]; createdAt: string;
  members: BookMember[];
}
interface CustItem { id: number; nm: string; ph: string; em: string; addr: string; tin: string; ow: number; pd: number; tr: number }
interface UserData { id: number; email: string; name: string; region: string; avatar: string; bankName?: string; bankAccount?: string; bankIban?: string; bankSwift?: string; paymentLink?: string; businessName?: string; businessPhone?: string; businessAddress?: string; taxId?: string }











function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
const CC = ["#6366F1", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6", "#F59E0B"];
const BOOK_COLORS = ["#6366F1", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B", "#14B8A6", "#F97316", "#EC4899", "#6366F1"];

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
  dashboard:"Dashboard",
  cash:"Cash Book",
  invoices:"Invoices",
  ai:"AI Insights",
  compliance:"Compliance",
  settings:"Settings",
  welcome:"Welcome back",
  balance:"Total Balance",
  income:"Income",
  expense:"Expenses",
  receivable:"Receivable",
  cashIn:"Cash In",
  cashOut:"Cash Out",
  add:"Add Entry",
  amount:"Amount",
  category:"Category",
  note:"Note",
  save:"Save",
  search:"Search",
  customers:"Customers",
  owed:"Total Owed",
  paid:"Total Paid",
  remind:"Remind",
  createInv:"Create Invoice",
  invNo:"Invoice No.",
  status:"Status",
  paidS:"Paid",
  unpaid:"Unpaid",
  draft:"Draft",
  items:"Items",
  subtotal:"Subtotal",
  vat:"VAT",
  total:"Total",
  netProfit:"Net Profit",
  recentTx:"Recent Transactions",
  topCats:"Top Categories",
  trend:"Monthly Trend",
  askAi:"Ask felosak anything...",
  vatSum:"VAT Summary",
  corpTax:"Corporate Tax",
  outVat:"Output VAT",
  inVat:"Input VAT",
  netVat:"Net VAT Payable",
  taxCal:"Tax Calendar",
  region:"Region",
  lang:"Language",
  logout:"Logout",
  varianceAi:"Variance AI",
  aiGen:"AI Generated",
  itemName:"Item Name",
  qty:"Qty",
  unitPrice:"Unit Price",
  discount:"Discount %",
  lineTotal:"Line Total",
  addLine:"Add Line Item",
  invDate:"Invoice Date",
  terms:"Payment Terms",
  billAddr:"Billing Address",
  notes:"Notes & Terms",
  preview:"Preview",
  print:"Print",
  saveDraft:"Save Draft",
  net30:"Net 30",
  net60:"Net 60",
  dueReceipt:"Due on Receipt",
  rent:"Rent",
  inventory:"Inventory",
  salaries:"Salaries",
  utilities:"Utilities",
  transport:"Transport",
  food:"Food",
  maintenance:"Maintenance",
  sales:"Sales",
  services:"Services",
  other:"Other",
  selectRegion:"Select Your Region",
  regionNote:"Each region follows different tax & compliance laws",
  salary:"Salary",
  freelance:"Freelance",
  gifts:"Gifts",
  groceries:"Groceries",
  dining:"Dining",
  entertainment:"Entertainment",
  health:"Health",
  education:"Education",
  bills:"Bills",
  shopping:"Shopping",
  savings:"Savings",
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

const Card = ({ children, className = "", style = {}, onClick }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }) => (
  <div className={`rounded-xl bg-white ${className}`} style={{ border: `1px solid ${TK.border}`, boxShadow: TK.sh, ...style }} onClick={onClick}>
    {children}
  </div>
);

const Badge = ({ t, c = TK.ok }: { t: string; c?: string }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: `${c}12`, color: c }}>
    ✓ {t}
  </span>
);

const Modal = ({ open, onClose, title, wide, children }: { open: boolean; onClose: () => void; title: string; wide?: boolean; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[4vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-xl bg-white p-4 sm:p-5 shadow-xl max-h-[88vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-bold" style={{ color: TK.text }}>{title}</h3>
          <button onClick={onClose} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 text-lg">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Inp = ({ label, value, onChange, type = "text", placeholder, options, prefix, textarea, groupedOptions }: { label?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; options?: { v: string; l: string }[]; prefix?: string; textarea?: boolean; groupedOptions?: { g: string; opts: { v: string; l: string }[] }[] }) => (
  <div className="mb-3">
    {label && <label className="block text-[10px] sm:text-[11px] font-bold mb-1 uppercase tracking-wider" style={{ color: TK.textM }}>{label}</label>}
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: TK.textM }}>{prefix}</span>}
      {groupedOptions ? (
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition-all" style={{ background: TK.muted, border: `1px solid ${TK.border}`, color: TK.text }}>
          <option value="">— Select —</option>
          {groupedOptions.map(g => <optgroup key={g.g} label={g.g}>{g.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</optgroup>)}
        </select>
      ) : options ? (
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition-all" style={{ background: TK.muted, border: `1px solid ${TK.border}`, color: TK.text }}>
          {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full p-2 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-200 resize-none" style={{ background: TK.muted, border: `1px solid ${TK.border}`, color: TK.text }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full p-2 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${prefix ? "pl-12" : ""}`} style={{ background: TK.muted, border: `1px solid ${TK.border}`, color: TK.text }} />
      )}
    </div>
  </div>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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

const Login = ({ onLogin, onBack }: { onLogin: (user: UserData) => void; onBack?: () => void }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");
  const [nm, setNm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [ld, setLd] = useState(false);
  const [err, setErr] = useState("");

  const go = async () => {
    setLd(true); setErr("");
    try {
      if (mode === "register") {
        if (!nm.trim()) { setErr("Name is required"); setLd(false); return; }
        const data = await api.auth.register(em, pw, nm, "EG");
        onLogin(data.user);
      } else {
        const data = await api.auth.login(em, pw);
        onLogin(data.user);
      }
    } catch (e: any) {
      setErr(e.message || "Login failed");
    }
    setLd(false);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white">
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-8 lg:p-12 relative z-10 bg-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl lg:text-3xl font-black text-gray-900">felosak</span>
        </div>
        <div className="max-w-2xl">
          <h2 className="text-4xl lg:text-7xl font-black leading-tight text-gray-900 mb-4 lg:mb-6">
            The financial<br />brain for every<br />MENA business
          </h2>
          <p className="text-base lg:text-xl leading-relaxed text-gray-600 mb-6 lg:mb-10 max-w-lg">
            AI-powered finance intelligence for Egypt & UAE. Cash management, e-invoicing, VAT automation.
          </p>
          <div className="flex flex-wrap gap-2 lg:gap-3">
            {["ETA Compliant", "FTA Ready", "Offline-First", "Arabic-Native"].map(t => (
              <span key={t} className="px-3 lg:px-5 py-1 lg:py-2 rounded-full text-[10px] lg:text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm whitespace-nowrap">
                {t}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs lg:text-sm text-gray-400 font-medium">© 2026 felosak · www.felosak.com</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-6 sm:mb-8">
            <span className="text-2xl font-black text-gray-900 tracking-tight">felosak</span>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xl border border-gray-100">
            <div className="w-12 sm:w-16 h-1 bg-blue-500 rounded-full mb-5 sm:mb-6 mx-auto" />
            
            <h1 className="text-xl sm:text-2xl font-black mb-2 text-gray-900 text-center">{mode === "login" ? "Welcome Back" : "Create Account"}</h1>
            <p className="text-xs sm:text-sm mb-6 sm:mb-8 text-gray-500 text-center">
              {mode === "login" ? "Sign in to your account" : "Get started with felosak"}
            </p>

            {err && (
              <div className="p-2 sm:p-3 rounded-xl mb-3 sm:mb-4 text-xs sm:text-sm font-medium bg-red-50 text-red-600 border border-red-200">
                {err}
              </div>
            )}

            {mode === "register" && (
              <div className="mb-3 sm:mb-4">
                <label className="block text-[10px] sm:text-xs font-semibold mb-1 text-gray-600">Full Name</label>
                <input
                  type="text"
                  value={nm}
                  onChange={e => setNm(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm outline-none bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            )}

            <div className="mb-3 sm:mb-4">
              <label className="block text-[10px] sm:text-xs font-semibold mb-1 text-gray-600">Email Address</label>
              <input
                type="email"
                value={em}
                onChange={e => setEm(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm outline-none bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-[10px] sm:text-xs font-semibold mb-1 text-gray-600">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm outline-none bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-gray-500 hover:text-gray-700"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 accent-blue-500" /> Remember me
                </label>
                <button className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              onClick={go}
              disabled={ld}
              className="w-full py-2.5 sm:py-3.5 rounded-xl text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ld ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>{mode === "login" ? "Sign In" : "Create Account"}</>
              )}
            </button>

            <div className="flex items-center gap-3 my-5 sm:my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] sm:text-xs text-gray-400">Or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button className="flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl bg-white text-xs sm:text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-150 shadow-sm">
                <img src="https://i.ibb.co/LDK86wJy/download.jpg" alt="Google" className="w-4 h-4 sm:w-5 sm:h-5" />
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl bg-white text-xs sm:text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-150 shadow-sm">
                <img src="https://i.ibb.co/yFTBPJNG/download.png" alt="Apple" className="w-4 h-4 sm:w-5 sm:h-5" />
                Apple
              </button>
            </div>

            <p className="text-center text-xs sm:text-sm mt-5 sm:mt-6 text-gray-500">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                className="font-semibold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2 transition-colors"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegSel = ({ onSel }: { onSel: (r: RegionKey) => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-white">
    <img src={logoImg} alt="felosak" className="h-8 sm:h-10 mb-3 sm:mb-4" />
    <h2 className="text-base sm:text-lg font-bold mb-1 text-gray-900">{LL.selectRegion}</h2>
    <p className="text-[10px] sm:text-xs mb-4 sm:mb-6 text-center max-w-xs text-gray-500">{LL.regionNote}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
      {(Object.values(RG) as RegionInfo[]).map(r => (
        <Card key={r.id} className="p-4 sm:p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]">
          <button onClick={() => onSel(r.id as RegionKey)} className="w-full text-left">
            <span className="text-2xl sm:text-3xl block mb-2">{r.fl}</span>
            <p className="text-sm sm:text-base font-bold text-gray-900">{r.n}</p>
            <p className="text-xs sm:text-sm font-medium text-indigo-600">{r.ar}</p>
            <div className="mt-2 sm:mt-3 space-y-1">
              {[["VAT", `${Math.round(r.vr * 100)}%`], ["E-Invoice", r.auth], ["Currency", r.cur], ["Corp Tax", r.id === "AE" ? `0%→9% (AED 375K)` : `${Math.round(r.ct * 100)}%`]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-[10px] sm:text-[11px]"><span className="text-gray-500">{k}</span><span className="font-bold text-gray-900">{v}</span></div>
              ))}
            </div>
            <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-semibold flex items-center gap-1 text-indigo-600">Select →</div>
          </button>
        </Card>
      ))}
    </div>
  </div>
);

const EmptyChart = ({ label }: { label: string }) => (
  <div className="h-40 sm:h-52 flex flex-col items-center justify-center gap-2 text-gray-400">
    <AlertCircle size={24} className="opacity-30 sm:w-7 sm:h-7" />
    <p className="text-[10px] sm:text-xs">{label}</p>
  </div>
);

const Dash = ({ R, books, cu, onNav }: { R: RegionInfo; books: CashBook[]; cu: CustItem[]; onNav: (pg: string) => void }) => {
  const c = R.cur;
  const allTx = books.flatMap(b => b.tx);
  const tI = allTx.filter(t => t.ty === "in").reduce((s, t) => s + t.am, 0);
  const tO = allTx.filter(t => t.ty === "out").reduce((s, t) => s + t.am, 0);
  const bal = tI - tO;
  const profit = tI - tO;
  const profitPct = tO > 0 ? ((profit / tO) * 100).toFixed(1) : "0";

  const formatCurrency = (amount: number) => `${c} ${amount.toLocaleString()}`;

  const monthlyTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = months.map(month => ({ name: month, income: 0, expense: 0 }));
    allTx.forEach(tx => {
      if (!tx.dt) return;
      let monthName = "";
      if (tx.dt.includes("-")) {
        const date = new Date(tx.dt);
        monthName = date.toLocaleString('default', { month: 'short' });
      } else {
        const parts = tx.dt.split(' ');
        if (parts.length >= 1) monthName = parts[0];
      }
      const monthIndex = months.indexOf(monthName);
      if (monthIndex !== -1) {
        if (tx.ty === "in") monthlyData[monthIndex].income += tx.am;
        else if (tx.ty === "out") monthlyData[monthIndex].expense += tx.am;
      }
    });
    return monthlyData;
  }, [allTx]);

  const totalTx = allTx.length;

  return (
    <div className="min-h-screen w-full bg-white p-4 sm:p-6">
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Welcome back EG</h1>
        <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">2025-04-09 - Start - VAT 14%</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-5 sm:mb-8">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-md border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-2">Net Balance</p>
              <p className="text-base sm:text-2xl font-bold text-gray-900 break-words">{formatCurrency(bal)}</p>
            </div>
            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Wallet size={16} className="text-amber-600 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-1 sm:mt-3">
            <span className={`text-[8px] sm:text-xs ${bal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {bal >= 0 ? '↑' : '↓'} {profitPct}% from last period
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-md border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-2">Sales</p>
              <p className="text-base sm:text-2xl font-bold text-gray-900 break-words">{formatCurrency(tI)}</p>
            </div>
            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp size={16} className="text-amber-600 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-1 sm:mt-3">
            <span className="text-[8px] sm:text-xs text-emerald-600">Total Income</span>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-md border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-2">Expenses</p>
              <p className="text-base sm:text-2xl font-bold text-gray-900 break-words">{formatCurrency(tO)}</p>
            </div>
            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingDown size={16} className="text-amber-600 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-1 sm:mt-3">
            <span className="text-[8px] sm:text-xs text-rose-600">Total Expenses</span>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-md border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-2">Profit</p>
              <p className="text-base sm:text-2xl font-bold text-gray-900 break-words">{formatCurrency(profit)}</p>
            </div>
            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap size={16} className="text-amber-600 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-1 sm:mt-3">
            <span className="text-[8px] sm:text-xs text-emerald-600">{profitPct}% margin</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-8">
        <button onClick={() => onNav("cashio")} className="bg-gradient-to-r from-amber-200/10 via-yellow-200/10 to-orange-400/20 text-amber-800 border border-amber-200 py-2.5 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-xs sm:text-sm">
          <Plus size={16} className="text-amber-500 sm:w-5 sm:h-5" />
          <span>Add Transaction</span>
        </button>
        <button onClick={() => onNav("inv")} className="bg-gradient-to-r from-emerald-200/10 via-green-200/10 to-teal-200/20 text-emerald-800 border border-emerald-200 py-2.5 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-emerald-100/30 hover:via-green-100/30 hover:to-teal-100/40 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-xs sm:text-sm">
          <FileText size={16} className="text-emerald-600 sm:w-5 sm:h-5" />
          <span>Add Invoice</span>
        </button>
        <button 
  onClick={() => onNav("cash")} 
  className="bg-gradient-to-r from-blue-200/10 via-sky-200/10 to-cyan-200/20 text-blue-800 border border-blue-200 py-2.5 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-100/30 hover:via-sky-100/30 hover:to-cyan-100/40 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-xs sm:text-sm"
>
  <Plus size={16} className="text-blue-600 sm:w-5 sm:h-5" />
  <span>Add Book</span>
</button>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Monthly Trend</h2>
            <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5">Income vs Expenses Overview</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-[9px] sm:text-xs text-gray-600">Income</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <span className="text-[9px] sm:text-xs text-gray-600">Expenses</span>
            </div>
          </div>
        </div>
        
        {totalTx === 0 ? (
          <div className="h-48 sm:h-80 flex flex-col items-center justify-center gap-2 text-gray-400">
            <AlertCircle size={32} className="opacity-30 sm:w-12 sm:h-12" />
            <p className="text-xs sm:text-sm">No transaction data available</p>
            <p className="text-[9px] sm:text-xs">Add transactions to see your monthly trend</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${c} ${(value / 1000).toFixed(0)}K`} width={45} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "11px" }} formatter={(value: number) => [`${c} ${value.toLocaleString()}`, ""]} />
                <Line type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="expense" name="Expenses" stroke="#EF4444" strokeWidth={2} dot={{ fill: "#EF4444", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="flex items-center justify-center mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
          <p className="text-[8px] sm:text-xs text-gray-400 text-center">
            {totalTx} total transactions • {formatCurrency(tI)} income • {formatCurrency(tO)} expenses
          </p>
        </div>
      </div>
    </div>
  );
};

// CashBookPg component (mobile optimized)
const CashBookPg = ({ R, books, reload, cu, invoices, user }: { R: RegionInfo; books: CashBook[]; reload: () => void; cu: CustItem[]; invoices?: any[]; user: UserData }) => {
  const c = R.cur;
  const reg = R.id as RegionKey;
  const [bookType, setBookType] = useState<"business" | "personal">("business");
  const [showNewBook, setShowNewBook] = useState(false);
  const [newBookName, setNewBookName] = useState("");
  const [newBookIcon, setNewBookIcon] = useState("🏪");
  const [saving, setSaving] = useState(false);
  const [expandedBookId, setExpandedBookId] = useState<number | null>(null);

  const filteredBooks = books.filter(b => b.type === bookType);
  const allTxInType = filteredBooks.flatMap(b => b.tx);
  const totalIn = allTxInType.filter(t => t.ty === "in").reduce((s, t) => s + t.am, 0);
  const totalOut = allTxInType.filter(t => t.ty === "out").reduce((s, t) => s + t.am, 0);
  const netBalance = totalIn - totalOut;

  const formatCurrency = (amount: number) => `${c} ${amount.toLocaleString()}`;

  const createBook = async () => {
    if (!newBookName.trim()) return;
    setSaving(true);
    try {
      await api.books.create({
        name: newBookName.trim(), type: bookType, icon: newBookIcon,
        color: BOOK_COLORS[books.length % BOOK_COLORS.length],
      });
      reload();
      setShowNewBook(false); setNewBookName(""); setNewBookIcon("🏪");
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const deleteBook = async (bookId: number) => {
    try { await api.books.delete(bookId); reload(); } catch (e) { console.error(e); }
  };

  const toggleExpand = (bookId: number) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  return (
    <div className="min-h-screen w-full bg-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cash Books</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              {books.length} books • {books.filter(b => b.type === "business").length} business, {books.filter(b => b.type === "personal").length} personal
            </p>
          </div>
          <button onClick={() => setShowNewBook(true)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all shadow-md text-sm">
            <Plus size={14} /> New Book
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 shadow-md">
            <p className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase tracking-wide">Total In</p>
            <p className="text-lg sm:text-2xl font-bold text-emerald-600 mt-1 break-words">{formatCurrency(totalIn)}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 shadow-md">
            <p className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase tracking-wide">Total Out</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600 mt-1 break-words">{formatCurrency(totalOut)}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 shadow-md">
            <p className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase tracking-wide">Net Balance</p>
            <p className={`text-lg sm:text-2xl font-bold mt-1 break-words ${netBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(netBalance)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit overflow-x-auto">
          {(["business", "personal"] as const).map((v) => (
            <button key={v} onClick={() => setBookType(v)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${bookType === v ? "bg-gray-600 text-white shadow-md" : "text-gray-600"}`}>
              {v === "business" ? "🏢 Business" : "👤 Personal"}
            </button>
          ))}
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white/50 rounded-xl border border-gray-200">
            <p className="text-2xl sm:text-3xl mb-2">📒</p>
            <p className="text-sm sm:text-base text-gray-600 font-medium">No {bookType} books yet</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Create your first {bookType} cash book to start tracking</p>
            <button onClick={() => setShowNewBook(true)} className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all text-sm">+ Create Book</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {filteredBooks.map(book => {
              const bIn = book.tx.filter(t => t.ty === "in").reduce((s, t) => s + t.am, 0);
              const bOut = book.tx.filter(t => t.ty === "out").reduce((s, t) => s + t.am, 0);
              const bal = bIn - bOut;
              const isExpanded = expandedBookId === book.id;
              
              return (
                <div key={book.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden">
                  <div onClick={() => toggleExpand(book.id)} className="p-3 sm:p-5 cursor-pointer transition-all hover:bg-gray-50/30">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0">{book.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{book.name}</h3>
                          <span className="text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700 whitespace-nowrap">{book.type}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{book.tx.length} transactions • Since {book.createdAt}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm sm:text-lg font-bold ${bal >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(bal).slice(0, 12)}...</p>
                        <div className="flex gap-1 sm:gap-2 text-[8px] sm:text-xs">
                          <span className="text-emerald-500">↓{formatCurrency(bIn).slice(0, 8)}</span>
                          <span className="text-red-500">↑{formatCurrency(bOut).slice(0, 8)}</span>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteBook(book.id); }} className="p-1 rounded-lg text-gray-400 hover:text-red-500 transition-all flex-shrink-0">
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <div className="flex justify-center mt-1 sm:mt-2">
                      <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/30 p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wide">Transaction History</h4>
                        <span className="text-[8px] sm:text-[10px] text-gray-500">{book.tx.length} entries</span>
                      </div>
                      {book.tx.length === 0 ? (
                        <div className="text-center py-4 sm:py-6 text-gray-400">
                          <p className="text-xs">No transactions yet</p>
                          <button onClick={() => onNav("cashio")} className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-600 hover:text-gray-800 font-medium">+ Add first transaction</button>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto">
                          {book.tx.slice().reverse().map((tx) => {
                            const isIncome = tx.ty === "in";
                            return (
                              <div key={tx.id} className="bg-white rounded-lg p-2 sm:p-3 border border-gray-100 hover:shadow-sm transition-all">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isIncome ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                      {isIncome ? <ArrowUpRight size={12} className="text-emerald-600 sm:w-4 sm:h-4" /> : <ArrowDownLeft size={12} className="text-rose-600 sm:w-4 sm:h-4" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{tx.cat}</p>
                                      {tx.no && <p className="text-[8px] sm:text-[10px] text-gray-400 truncate">{tx.no}</p>}
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className={`text-xs sm:text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>{isIncome ? '+' : '-'} {formatCurrency(tx.am).slice(0, 12)}</p>
                                    <p className="text-[8px] sm:text-[10px] text-gray-400">{tx.dt}</p>
                                  </div>
                                </div>
                                {tx.payMode && (
                                  <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-50">
                                    <span className="text-[7px] sm:text-[9px] text-gray-400 capitalize">💰 {tx.payMode}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Modal open={showNewBook} onClose={() => setShowNewBook(false)} title={`New ${bookType === "business" ? "Business" : "Personal"} Book`}>
          <Inp label="Book Name" value={newBookName} onChange={setNewBookName} placeholder={bookType === "business" ? "e.g. Coffee Shop, Import Business..." : "e.g. Personal Wallet, Vacation Fund..."} />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose Icon</label>
            <div className="flex flex-wrap gap-2">
              {BOOK_ICONS.slice(0, 12).map(ic => (
                <button key={ic} onClick={() => setNewBookIcon(ic)} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg transition-all ${newBookIcon === ic ? "bg-gray-200 border-2 border-gray-500" : "bg-gray-100"}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-gray-100 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm text-gray-700">
            {bookType === "business"
              ? "🏢 Business books track sales, inventory, rent, salaries, and other commercial transactions."
              : "👤 Personal books track salary, groceries, bills, entertainment, and other personal expenses."}
          </div>
          <button onClick={createBook} disabled={saving} className="w-full py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 text-sm">
            {saving ? "Creating..." : "Create Book"}
          </button>
        </Modal>
      </div>
    </div>
  );
};
const InvPg = ({ R, cu, invoices, reload, user }: { R: RegionInfo; cu: CustItem[]; invoices: any[]; reload: () => void; user: UserData }) => {
  const c = R.cur;
  const [showC, setShowC] = useState(false);
  const [iCu, setICu] = useState("");
  const [iTm, setITm] = useState("net30");
  const [iAd, setIAd] = useState("");
  const [iNo, setINo] = useState("");
  const [iDate, setIDate] = useState(todayStr());
  const [its, setIts] = useState<InvLine[]>([{ n: "", q: 1, p: 0, d: 0, dType: "pct" }]);
  const [saving, setSaving] = useState(false);
  const [remInv, setRemInv] = useState<any | null>(null);
  const [copied, setCopied] = useState("");
  const [vatPct, setVatPct] = useState(Math.round(R.vr * 100));
  const [editVat, setEditVat] = useState(false);
  const [whtOn, setWhtOn] = useState(false);
  const [whtPct, setWhtPct] = useState(1);
  const [sellerTin, setSellerTin] = useState("");
  const [buyerTin, setBuyerTin] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDel, setConfirmDel] = useState<number | null>(null);
  const [editingInvId, setEditingInvId] = useState<number | null>(null);
  const [editingInvNo, setEditingInvNo] = useState("");
  const [sigData, setSigData] = useState("");
  const [sigMode, setSigMode] = useState<"draw" | "upload">("draw");
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showQuickCust, setShowQuickCust] = useState(false);
  const [qcName, setQcName] = useState("");
  const [qcPhone, setQcPhone] = useState("");
  const [qcEmail, setQcEmail] = useState("");
  const [qcAddr, setQcAddr] = useState("");
  const [qcTin, setQcTin] = useState("");
  const [qcSaving, setQcSaving] = useState(false);
  const [builderInvNo, setBuilderInvNo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (amount: number) => `${c} ${amount.toLocaleString()}`;

  const addIt = () => setIts(p => [...p, { n: "", q: 1, p: 0, d: 0, dType: "pct" }]);
  const upIt = (i: number, f: string, v: string) => setIts(p => p.map((x, j) => j === i ? { ...x, [f]: f === "n" || f === "dType" ? v : parseFloat(v) || 0 } : x));
  const rmIt = (i: number) => setIts(p => p.filter((_, j) => j !== i));
  const lines = its.map(x => { const gross = x.q * x.p; const disc = x.dType === "pct" ? gross * (x.d / 100) : x.d; return { ...x, disc, lt: gross - disc }; });
  const sub = lines.reduce((s, x) => s + x.lt, 0);
  const discTotal = lines.reduce((s, x) => s + x.disc, 0);
  const vat = Math.round(sub * (vatPct / 100));
  const wht = whtOn ? Math.round(sub * (whtPct / 100)) : 0;
  const tot = sub + vat - wht;
  const dueDate = getDueDate(iDate, iTm);

  // Signature drawing functions (keep as is)
  const startSigDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current; if (!canvas) return;
    setIsDrawing(true);
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? (e as React.TouchEvent).touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = "touches" in e ? (e as React.TouchEvent).touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const moveSigDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? (e as React.TouchEvent).touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = "touches" in e ? (e as React.TouchEvent).touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.strokeStyle = "#1A1510"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.lineTo(x, y); ctx.stroke();
  };
  const endSigDraw = () => {
    setIsDrawing(false);
    const canvas = sigCanvasRef.current; if (!canvas) return;
    setSigData(canvas.toDataURL("image/png"));
  };
  const clearSig = () => {
    const canvas = sigCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigData("");
  };
  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setSigData(ev.target?.result as string); };
    reader.readAsDataURL(file);
  };

  const openEditInvoice = (inv: any) => {
    const rawInv = invoices.find(x => x.id === inv.id); if (!rawInv) return;
    setEditingInvId(rawInv.id);
    setEditingInvNo(rawInv.invoiceNo || "");
    setIDate(rawInv.invoiceDate || todayStr());
    setITm(rawInv.terms || "net30");
    setIAd(rawInv.billingAddress || "");
    setINo(rawInv.notes || "");
    setSellerTin(rawInv.sellerTin || "");
    setBuyerTin(rawInv.buyerTin || "");
    setVatPct(parseFloat(rawInv.vatRate) || Math.round(R.vr * 100));
    const wr = parseFloat(rawInv.whtRate) || 0;
    setWhtOn(wr > 0); setWhtPct(wr || 1);
    setSigData(rawInv.signature || "");
    const cust = rawInv.customerId ? cu.find(x => x.id === rawInv.customerId) : null;
    setICu(cust?.nm || "");
    const items = Array.isArray(rawInv.items) ? rawInv.items.map((it: any) => ({ n: it.n || "", q: it.q || 1, p: it.p || 0, d: it.d || 0, dType: (it.dType || "pct") as "pct" | "flat" })) : ([{ n: "", q: 1, p: 0, d: 0, dType: "pct" as const }]);
    setIts(items);
    setShowC(true);
  };

  const resetBuilder = () => {
    setEditingInvId(null); setEditingInvNo(""); setBuilderInvNo("");
    setIts([{ n: "", q: 1, p: 0, d: 0, dType: "pct" }]); setICu(""); setIAd(""); setINo(""); setIDate(todayStr()); setSellerTin(""); setBuyerTin(""); setWhtOn(false); setSigData("");
  };

  const quickAddCustomer = async () => {
    if (!qcName.trim()) return;
    setQcSaving(true);
    try {
      await api.customers.create({ name: qcName, phone: qcPhone, email: qcEmail, address: qcAddr, tin: qcTin, owed: "0", paid: "0", trust: 50 });
      reload();
      setICu(qcName);
      if (qcTin) setBuyerTin(qcTin);
      if (qcAddr) setIAd(qcAddr);
      setShowQuickCust(false); setQcName(""); setQcPhone(""); setQcEmail(""); setQcAddr(""); setQcTin("");
    } catch (e) { console.error(e); }
    setQcSaving(false);
  };

  const sinv = invoices.map(inv => {
    const dd = inv.dueDate || getDueDate(inv.invoiceDate || "", inv.terms || "net30");
    const effectiveStatus = inv.status === "unpaid" && isOverdue(dd) ? "overdue" : inv.status;
    return {
      id: inv.id, nm: inv.invoiceNo,
      cu: inv.customerId ? cu.find(c => c.id === inv.customerId)?.nm || "Unknown" : "Unknown",
      cuPhone: inv.customerId ? cu.find(c => c.id === inv.customerId)?.ph || "" : "",
      t: parseFloat(inv.total) || 0, s: effectiveStatus, rawStatus: inv.status,
      terms: inv.terms || "net30", date: inv.invoiceDate || "", dueDate: dd,
    };
  });

  const filteredInv = sinv.filter(inv => {
    const matchesSearch = searchTerm === '' || 
      inv.nm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.cu?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.s === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sc: Record<string, string> = { paid: "bg-emerald-100 text-emerald-700", unpaid: "bg-amber-100 text-amber-700", draft: "bg-gray-100 text-gray-600", overdue: "bg-red-100 text-red-700", sent: "bg-blue-100 text-blue-700" };
  const totalRevenue = sinv.reduce((s, x) => s + x.t, 0);
  const totalPaid = sinv.filter(x => x.s === "paid").reduce((s, x) => s + x.t, 0);
  const totalOutstanding = sinv.filter(x => x.s !== "paid" && x.s !== "draft").reduce((s, x) => s + x.t, 0);

  const hasBankInfo = user.bankName || user.bankAccount || user.bankIban;
  const hasPayLink = !!user.paymentLink;
  const bizName = user.businessName || user.name;

  const buildReminderText = (inv: any, includeBank: boolean, includePayLink: boolean) => {
    const termsLabel: Record<string, string> = { net30: "Net 30 Days", net60: "Net 60 Days", due: "Due on Receipt" };
    let msg = `Payment Reminder\n\nDear ${inv.cu},\n\nThis is a friendly reminder regarding the following invoice:\n\nInvoice: ${inv.nm}\nAmount Due: ${c} ${fmt(inv.t)}\nDate: ${inv.date}\nDue: ${inv.dueDate}\nTerms: ${termsLabel[inv.terms] || inv.terms}\n`;
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
    const phone = inv.cuPhone ? inv.cuPhone.replace(/[^0-9+]/g, "") : "";
    const url = phone ? `https://wa.me/${phone.replace("+", "")}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareEmail = (inv: any, includeBank: boolean, includePayLink: boolean) => {
    const text = buildReminderText(inv, includeBank, includePayLink);
    const subject = encodeURIComponent(`Payment Reminder: ${inv.nm} - ${c} ${fmt(inv.t)}`);
    window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(text)}`, "_blank");
  };

  const updateInvStatus = async (id: number, status: string) => {
    try { await api.invoices.update(id, { status }); reload(); } catch (e) { console.error(e); }
  };

  const deleteInvoice = async (id: number) => {
    try { await api.invoices.delete(id); setConfirmDel(null); reload(); } catch (e) { console.error(e); }
  };

  const createInvoice = async (asDraft = false) => {
    setSaving(true);
    try {
      const selectedCust = cu.find(x => x.nm === iCu);
      const existingInv = editingInvId ? invoices.find(x => x.id === editingInvId) : null;
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
        payload.invoiceNo = builderInvNo || `INV-${String(invoices.length + 1).padStart(3, "0")}`;
        await api.invoices.create(payload);
      }
      reload();
      setShowC(false); resetBuilder();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const previewInvoice = (opts?: { print?: boolean }) => {
    const selectedCust = cu.find(x => x.nm === iCu);
    const w = window.open("", "_blank");
    if (!w) return;
    const invNo = editingInvId ? editingInvNo : (builderInvNo || `INV-${String(invoices.length + 1).padStart(3, "0")}`);
    w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invNo}</title>
      <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1A1A1A}
      .header{display:flex;justify-content:space-between;margin-bottom:30px}.logo{font-size:24px;font-weight:800;color:#C8A630}
      table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#FEF3C7;text-align:left;padding:10px;font-size:12px;text-transform:uppercase;color:#92400E}
      td{padding:10px;border-bottom:1px solid #FDE68A;font-size:13px}.totals{text-align:right;margin-top:20px}
      .totals div{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}.totals .total{font-weight:800;font-size:16px;color:#D97706;border-top:2px solid #D97706;padding-top:8px;margin-top:8px}
      .words{background:#FEF3C7;padding:12px;border-radius:8px;font-size:11px;margin-top:16px;color:#B45309}
      .footer{margin-top:40px;text-align:center;font-size:10px;color:#94A3B8}
      @media print{body{margin:0}}</style></head><body>
      <div class="header"><div><div class="logo">felosak</div><p style="font-size:11px;color:#64748B">${bizName}${user.businessPhone ? " · " + user.businessPhone : ""}</p>
      ${sellerTin ? `<p style="font-size:10px;color:#64748B">TIN: ${sellerTin}</p>` : ""}</div>
      <div style="text-align:right"><h2 style="margin:0;color:#D97706">INVOICE</h2>
      <p style="font-size:12px">#${invNo}</p>
      <p style="font-size:11px;color:#64748B">Date: ${iDate}<br/>Due: ${dueDate}<br/>Terms: ${iTm === "net30" ? "Net 30" : iTm === "net60" ? "Net 60" : "Due on Receipt"}</p></div></div>
      <div style="margin-bottom:20px"><strong style="font-size:12px">Bill To:</strong>
      <p style="font-size:12px">${selectedCust?.nm || iCu || "—"}</p>
      ${selectedCust?.addr ? `<p style="font-size:11px;color:#64748B">${selectedCust.addr}</p>` : ""}
      ${(selectedCust?.tin || buyerTin) ? `<p style="font-size:11px;color:#64748B">TIN: ${selectedCust?.tin || buyerTin}</p>` : ""}
      ${iAd ? `<p style="font-size:11px;color:#64748B">${iAd}</p>` : ""}</div>
      <tr><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Disc</th><th style="text-align:right">Total</th></tr></thead><tbody>
      ${lines.map((l, i) => `<tr><td>${i + 1}</td><td>${l.n || "—"}</td><td>${l.q}</td><td>${c} ${fmt(l.q * l.p)}</td><td>${l.dType === "pct" ? l.d + "%" : c + " " + fmt(l.d)}</td><td style="text-align:right">${c} ${fmt(l.lt)}</td></tr>`).join("")}
      </tbody></table>
      <div class="totals" style="max-width:300px;margin-left:auto">
      <div><span>Subtotal</span><span>${c} ${fmt(sub)}</span></div>
      ${discTotal > 0 ? `<div><span>Discount</span><span style="color:#EF4444">-${c} ${fmt(discTotal)}</span></div>` : ""}
      <div><span>VAT (${vatPct}%)</span><span>${c} ${fmt(vat)}</span></div>
      ${whtOn ? `<div><span>WHT (${whtPct}%)</span><span style="color:#EF4444">-${c} ${fmt(wht)}</span></div>` : ""}
      <div class="total"><span>Total</span><span>${c} ${fmt(tot)}</span></div></div>
      <div class="words"><strong>Amount in words:</strong> ${numToWords(tot)} ${c}</div>
      ${iNo ? `<div style="margin-top:16px;padding:12px;background:#FEF3C7;border-radius:8px;font-size:11px"><strong>Notes:</strong> ${iNo}</div>` : ""}
      ${hasBankInfo ? `<div style="margin-top:16px;padding:12px;background:#FEF3C7;border-radius:8px;font-size:11px"><strong>Payment Details:</strong><br/>${user.bankName ? "Bank: " + user.bankName + "<br/>" : ""}${user.businessName ? "Account: " + user.businessName + "<br/>" : ""}${user.bankAccount ? "Account No: " + user.bankAccount + "<br/>" : ""}${user.bankIban ? "IBAN: " + user.bankIban + "<br/>" : ""}${user.bankSwift ? "SWIFT: " + user.bankSwift : ""}</div>` : ""}
      ${sigData ? `<div style="margin-top:24px;border-top:1px solid #FDE68A;padding-top:16px"><p style="font-size:10px;color:#64748B;margin-bottom:8px">Authorized Signature</p><img src="${sigData}" alt="Signature" style="max-height:60px"/><p style="font-size:11px;margin-top:4px;font-weight:600">${bizName}</p></div>` : ""}
      <div class="footer">© 2026 felosak · www.felosak.com · Powered by felosak</div>
      ${opts?.print ? `<script>setTimeout(()=>window.print(),500)<\/script>` : ""}
      </body></html>`);
    w.document.close();
  };

  return (
    <div className="min-h-screen w-full bg-white pb-20 sm:pb-24">
      {/* Header */}
      <div className="px-4 py-3 sm:py-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-xs sm:text-sm text-amber-600 mt-0.5">Manage your invoices</p>
      </div>

      <div className="px-4 space-y-4 sm:space-y-5">
        {/* Main Gradient Card */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg h-40">
          <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(circle at 14% 50%, #059669, #FEF3C7, #FFFFFF)' }} />
          <div className="relative p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FileText size={16} className="text-white sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-white/80 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-lg sm:text-2xl font-bold text-white break-words">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] sm:text-[10px] text-white/60">All time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats Cards Row - Responsive */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 -mt-14 sm:-mt-20 relative z-10">
          <div className="bg-white rounded-xl p-2 sm:p-3 shadow-md border border-gray-100 text-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-1">
              <FileText size={12} className="text-gray-600 sm:w-4 sm:h-4" />
            </div>
            <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase">Paid</p>
            <p className="text-xs sm:text-sm font-bold text-gray-900 break-words">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-3 shadow-md border border-gray-100 text-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-1">
              <FileText size={12} className="text-gray-600 sm:w-4 sm:h-4" />
            </div>
            <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase">Outstanding</p>
            <p className="text-xs sm:text-sm font-bold text-amber-600 break-words">{formatCurrency(totalOutstanding)}</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-3 shadow-md border border-gray-100 text-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-1">
              <FileText size={12} className="text-gray-600 sm:w-4 sm:h-4" />
            </div>
            <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase">Total</p>
            <p className="text-xs sm:text-sm font-bold text-gray-900">{sinv.length}</p>
          </div>
        </div>

        {/* Filter Bar - Horizontal Scroll on Mobile */}
        <div className="bg-white rounded-xl p-1 shadow-md border border-gray-200 mt-1 sm:mt-2 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {[["all", "All"], ["unpaid", "Unpaid"], ["paid", "Paid"], ["overdue", "Overdue"], ["draft", "Draft"]].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setStatusFilter(v)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${statusFilter === v ? 'bg-gray-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder:text-gray-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={12} className="text-gray-400 hover:text-gray-600 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
        </div>

        {/* Invoices List */}
        <div className="space-y-2 pb-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] sm:text-xs text-gray-500">
              {filteredInv.length} invoice{filteredInv.length !== 1 ? 's' : ''}
            </p>
            <button onClick={() => { resetBuilder(); setShowC(true); }} className="text-[10px] sm:text-xs font-medium text-gray-600 hover:text-gray-800">
              + Create Invoice
            </button>
          </div>

          {filteredInv.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 text-center border border-gray-200">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText size={20} className="text-gray-400 sm:w-6 sm:h-6" />
              </div>
              <p className="text-sm sm:text-base text-gray-500 font-medium">No invoices found</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                {searchTerm ? 'Try a different search term' : 'Click "Create Invoice" to create your first invoice'}
              </p>
            </div>
          ) : (
            filteredInv.map((inv) => (
              <div key={inv.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${inv.s === 'paid' ? 'bg-gray-100' : inv.s === 'overdue' ? 'bg-gray-100' : 'bg-gray-100'}`}>
                      <FileText size={14} className="text-gray-600 sm:w-4.5 sm:h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{inv.nm}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{inv.cu}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs sm:text-base font-bold text-gray-900">{formatCurrency(inv.t)}</p>
                    <span className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${sc[inv.s] || "bg-gray-100 text-gray-600"}`}>
                      {inv.s}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-gray-100">
                  <div className="flex gap-2 text-[8px] sm:text-[10px] text-gray-400">
                    <span>📅 {inv.date}</span>
                    <span>⏰ Due: {inv.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button onClick={() => openEditInvoice(inv)} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Edit</button>
                    {inv.s === "unpaid" && (
                      <button onClick={() => updateInvStatus(inv.id, "paid")} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">✓ Paid</button>
                    )}
                    <button onClick={() => setRemInv(inv)} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">🔔</button>
                    <button onClick={() => setConfirmDel(inv.id)} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-red-100 text-red-600 hover:bg-red-200">🗑</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button - Grey */}
      <button
        onClick={() => { resetBuilder(); setShowC(true); }}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gray-600 text-white rounded-full shadow-lg shadow-gray-500/30 flex items-center justify-center active:scale-95 transition-all duration-200 hover:bg-gray-700"
      >
        <Plus size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Create Invoice Modal - Grey Theme with responsive padding */}
      <Modal open={showC} onClose={() => { setShowC(false); resetBuilder(); }} title={editingInvId ? `Edit Invoice ${editingInvNo}` : `Create Invoice — ${R.fl} ${R.auth}`} wide>
        <div className="space-y-3 sm:space-y-4">
          <div className="p-2 sm:p-2.5 rounded-lg mb-1 sm:mb-2 text-[10px] sm:text-xs bg-gray-100 text-gray-700 border border-gray-200">
            <strong>{R.n}:</strong> VAT {vatPct}% • {R.fmt} • {R.sig}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-wider text-gray-600">Customer</label>
              <select value={iCu} onChange={e => { const v = e.target.value; if (v === "__new__") { setShowQuickCust(true); return; } setICu(v); const sel = cu.find(x => x.nm === v); if (sel) { setBuyerTin(sel.tin); if (sel.addr) setIAd(sel.addr); } }} className="w-full p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50 border border-gray-200">
                <option value="">— Select —</option>
                {cu.map(x => <option key={x.id} value={x.nm}>{x.nm}</option>)}
                <option value="__new__">➕ Add New Customer</option>
              </select>
            </div>
            <Inp label="Invoice #" value={builderInvNo || `INV-${String(invoices.length + 1).padStart(3, "0")}`} onChange={setBuilderInvNo} placeholder="INV-001" />
            <Inp label="Date" value={iDate} onChange={setIDate} type="date" />
            <Inp label="Terms" value={iTm} onChange={setITm} options={[{ v: "net30", l: "Net 30" }, { v: "net60", l: "Net 60" }, { v: "due", l: "Due on Receipt" }]} />
            <Inp label="Due Date" value={dueDate} onChange={() => {}} type="date" />
            <Inp label="Billing Address" value={iAd} onChange={setIAd} placeholder="123 Street, City" />
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-12 gap-1 p-2 bg-gray-100 text-[8px] sm:text-[10px] font-bold text-gray-700 min-w-[500px]">
              <span className="col-span-5">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3 text-center">Price</span>
              <span className="col-span-2 text-center">Total</span>
            </div>
            {its.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-1 items-center mt-1 min-w-[500px]">
                <input value={it.n} onChange={e => upIt(i, "n", e.target.value)} placeholder="Item name" className="col-span-5 p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm bg-gray-50 border border-gray-200" />
                <input type="number" value={it.q || ""} onChange={e => upIt(i, "q", e.target.value)} className="col-span-2 p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm text-center bg-gray-50 border border-gray-200" />
                <input type="number" value={it.p || ""} onChange={e => upIt(i, "p", e.target.value)} className="col-span-3 p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm text-center bg-gray-50 border border-gray-200" />
                <p className="col-span-1 text-xs sm:text-sm font-bold text-center">{c} {fmt(it.q * it.p)}</p>
                <button onClick={() => rmIt(i)} className="col-span-1 text-red-500 text-xs">✕</button>
              </div>
            ))}
          </div>
          <button onClick={addIt} className="text-xs font-semibold text-gray-600">+ Add Item</button>

          <div className="p-2 sm:p-3 rounded-lg bg-gray-50">
            <div className="flex justify-between text-xs sm:text-sm"><span>Subtotal</span><span>{c} {fmt(sub)}</span></div>
            <div className="flex justify-between text-xs sm:text-sm"><span>VAT ({vatPct}%)</span><span>{c} {fmt(vat)}</span></div>
            <div className="flex justify-between text-sm sm:text-lg font-bold pt-2 border-t"><span>Total</span><span>{c} {fmt(tot)}</span></div>
          </div>

          <Inp label="Notes" value={iNo} onChange={setINo} placeholder="Payment terms..." textarea />

          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={previewInvoice} className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">Preview</button>
            <button onClick={() => createInvoice(true)} className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">Save Draft</button>
            <button onClick={() => createInvoice(false)} className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold bg-gray-600 text-white hover:bg-gray-700">Create Invoice</button>
          </div>
        </div>
      </Modal>

      {/* Payment Reminder Modal */}
      <Modal open={!!remInv} onClose={() => { setRemInv(null); setCopied(""); }} title="🔔 Payment Reminder">
        {remInv && (
          <div className="space-y-3 sm:space-y-4">
            <div className="p-2 sm:p-3 rounded-lg bg-gray-50">
              <p className="text-sm sm:text-base font-bold">{remInv.nm}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Customer: {remInv.cu} · Due: {remInv.dueDate}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => shareWhatsApp(remInv, true, true)} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-200">💬 WhatsApp</button>
              <button onClick={() => shareEmail(remInv, true, true)} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-200">📧 Email</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Add Customer Modal */}
      <Modal open={showQuickCust} onClose={() => setShowQuickCust(false)} title="➕ Quick Add Customer">
        <div className="space-y-3">
          <Inp label="Customer Name" value={qcName} onChange={setQcName} placeholder="Company name" />
          <Inp label="Phone" value={qcPhone} onChange={setQcPhone} placeholder="Phone number" />
          <Inp label="Email" value={qcEmail} onChange={setQcEmail} placeholder="Email" />
          <button onClick={quickAddCustomer} className="w-full py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 text-sm">Add Customer</button>
        </div>
      </Modal>
    </div>
  );
};
interface ChatMsg { r: string; t: string }

const AiPg = ({ R, books, cu }: { R: RegionInfo; books: CashBook[]; cu: CustItem[] }) => {
  const c = R.cur;
  const allTx = books.flatMap(b => b.tx);
  const tI = allTx.filter(t => t.ty === "in").reduce((s, t) => s + t.am, 0);
  const tO = allTx.filter(t => t.ty === "out").reduce((s, t) => s + t.am, 0);
  const bal = tI - tO;
  const overdueCustomers = cu.filter(x => x.ow > 0);

  const healthScore = useMemo(() => {
    let score = 50;
    const cashRatio = tO > 0 ? tI / tO : 1;
    if (cashRatio >= 1.5) score += 15; else if (cashRatio >= 1.2) score += 10; else if (cashRatio >= 1) score += 5; else score -= 15;
    const savingsRate = tI > 0 ? (bal / tI) : 0;
    if (savingsRate >= 0.2) score += 10; else if (savingsRate >= 0.1) score += 5; else if (savingsRate < 0) score -= 10;
    const overdueRatio = cu.length > 0 ? overdueCustomers.length / cu.length : 0;
    if (overdueRatio === 0) score += 10; else if (overdueRatio < 0.2) score += 5; else score -= 5;
    if (books.length >= 3) score += 5;
    if (allTx.length >= 10) score += 5;
    const catCount = new Set(allTx.map(t => t.cat)).size;
    if (catCount >= 3) score += 5;
    return Math.min(100, Math.max(0, score));
  }, [tI, tO, bal, cu, overdueCustomers, books, allTx]);
  
  const healthColor = healthScore >= 80 ? "#22A06B" : healthScore >= 60 ? "#F59E0B" : "#EF4444";
  const healthLabel = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : "Needs Attention";

  const taxSuggestions = useMemo(() => {
    const tips: string[] = [];
    if (R.id === "EG") {
      if (tI <= 20000000) tips.push("Eligible for SME simplified tax (0.4%-1.5% of revenue) instead of 22.5% CIT — could save significantly.");
      const deductibleCats = ["rent", "salaries", "utilities", "maintenance"];
      const deductibleTotal = allTx.filter(t => t.ty === "out" && deductibleCats.includes(t.cat)).reduce((s, t) => s + t.am, 0);
      if (deductibleTotal > 0) tips.push(`${c} ${fmt(deductibleTotal)} in deductible expenses — keep receipts.`);
      tips.push("Professional services qualify for 10% VAT instead of 14% — categorize correctly.");
    } else {
      if (bal < 375000) tips.push("Below AED 375K threshold — 0% corporate tax applies.");
      tips.push("Verify all supplier TRNs before claiming input VAT — FTA can deny claims.");
    }
    return tips;
  }, [R, tI, bal, allTx]);

  const varianceData = [
    { name: "Revenue", current: tI, previous: Math.round(tI * 0.88), change: "+13.6%", color: "#22A06B" },
    { name: "Expenses", current: tO, previous: Math.round(tO * 1.12), change: "-12.5%", color: "#EF4444" },
    { name: "Profit", current: bal, previous: Math.round(bal * 0.85), change: "+17.8%", color: "#F59E0B" },
    { name: "Receivables", current: cu.reduce((s, x) => s + x.ow, 0), previous: Math.round(cu.reduce((s, x) => s + x.ow, 0) * 0.9), change: "+11.2%", color: "#3B82F6" },
  ];

  const formatCurrency = (amount: number) => `${c} ${amount.toLocaleString()}`;

  return (
    <div className="min-h-screen w-full bg-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{R.fl} {R.n} • Powered by felosak AI</p>
        </div>

        {/* Financial Health Card - Horizontal with Circular Indicator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
            {/* Circular Health Indicator - Responsive */}
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-20 h-20 sm:w-28 sm:h-28 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#FEF3C7" strokeWidth="3" />
                <circle 
                  cx="18" cy="18" r="15.5" fill="none" 
                  stroke="url(#goldenGradient)" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeDasharray={`${healthScore * 0.975} 97.5`} 
                />
                <defs>
                  <linearGradient id="goldenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg sm:text-2xl font-black text-amber-600">{healthScore}</span>
              </div>
            </div>

            {/* Health Info */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600">Financial Health Score</p>
              <p className="text-lg sm:text-2xl font-bold text-amber-700 mt-1">{healthLabel}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                Cash: {(tI / Math.max(tO, 1)).toFixed(1)}x · Savings: {tI > 0 ? ((bal / tI) * 100).toFixed(0) : "0"}%
              </p>
            </div>

            {/* Bar Indicator Green to Golden */}
            <div className="flex-1 w-full">
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-[10px] sm:text-xs">
                  <span className="text-gray-500">Poor</span>
                  <span className="text-amber-600 font-medium">Excellent</span>
                </div>
                <div className="h-2 sm:h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-amber-500"
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
                <p className="text-[10px] sm:text-xs text-center text-gray-400 mt-1">Overall Financial Health</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Optimization Tips - Emerald Theme */}
        {taxSuggestions.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl">💡</span>
                <h3 className="text-sm sm:text-base font-bold text-emerald-800">Tax Optimization Tips</h3>
              </div>
              <span className="text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">AI Generated</span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {taxSuggestions.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
                  <span className="text-[10px] sm:text-xs font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    {i + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variance AI Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl">📊</span>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Variance Analysis</h3>
            </div>
            <span className="text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium self-start sm:self-auto">Current vs Previous Period</span>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {varianceData.map((item, i) => (
              <div key={i} className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">{item.name}</span>
                  <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${item.change.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {item.change}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-base sm:text-2xl font-bold text-gray-900 break-words">{formatCurrency(item.current)}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">Previous: {formatCurrency(item.previous)}</p>
                  </div>
                  <div className="w-20 sm:w-24 h-10 sm:h-12">
                    <div className="h-1.5 sm:h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, (item.current / Math.max(item.previous, 1)) * 100)}%`,
                          background: `linear-gradient(90deg, ${item.color}, ${item.color === '#F59E0B' ? '#D97706' : item.color})`
                        }}
                      />
                    </div>
                    <p className="text-[8px] sm:text-[10px] text-center text-gray-400 mt-1">
                      {item.current > item.previous ? '↑ Higher' : item.current < item.previous ? '↓ Lower' : '→ Same'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Insight Summary */}
          <div className="mt-4 sm:mt-5 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-base sm:text-lg">🤖</span>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider">AI Insight</p>
                <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
                  {tI > tO 
                    ? `Your revenue exceeds expenses by ${formatCurrency(bal)}. Consider allocating ${formatCurrency(Math.round(bal * 0.2))} to savings or investments.` 
                    : `Your expenses exceed revenue by ${formatCurrency(Math.abs(bal))}. Review ${varianceData[1]?.name?.toLowerCase() || 'expenses'} to improve profitability.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const CompPg = ({ R, books }: { R: RegionInfo; books: CashBook[] }) => {
  const allTx = books.flatMap(b => b.tx);
  const c = R.cur;
  const tI = allTx.filter(t => t.ty === "in").reduce((s, t) => s + t.am, 0);
  const tO = allTx.filter(t => t.ty === "out").reduce((s, t) => s + t.am, 0);
  const pr = tI - tO;
  const oV = Math.round(tI * R.vr);
  const iV = Math.round(tO * R.vr);
  const nV = oV - iV;
  const ct = R.id === "EG" ? Math.round(Math.max(0, pr) * R.ct) : Math.round(Math.max(0, pr - R.ctT) * R.ct);
  const rev = tI;
  const smeEligible = R.id === "EG" && R.smeThreshold && rev <= R.smeThreshold;
  const smeTier = smeEligible && R.smeTiers ? R.smeTiers.find(t => rev <= t.max) : null;
  const smeTax = smeTier ? Math.round(rev * parseFloat(smeTier.rate) / 100) : 0;

  const formatCurrency = (amount: number) => `${c} ${amount.toLocaleString()}`;

  return (
    <div className="min-h-screen w-full bg-white p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{R.fl} Compliance — {R.n}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Tax & Regulatory Compliance Dashboard</p>
        </div>

        {/* Card 1: Core Tax Identifiers */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
              <span className="text-base sm:text-xl">🏛️</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Core Tax Identifiers</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Egypt ETA Requirements</p>
            </div>
          </div>
          
          {/* First Row - Three Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-gray-200">
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-wider">Taxpayer ID (TIN)</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 mt-1">{R.tin || "9-digit TIN"}</p>
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">ETA Registered</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-gray-200">
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-wider">VAT on Services</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 mt-1">{R.wht || "1%–3% WHT"}</p>
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">Withholding Tax</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-gray-200">
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-wider">E-Signature VAT</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 mt-1">Egypt Trust / Misr Tech</p>
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">Licensed Provider</p>
            </div>
          </div>
          
          {/* Second Row - Three Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-gray-200">
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-wider">VAT Threshold</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 mt-1">EGP 500,000/yr</p>
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">Mandatory Registration</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-gray-200">
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-wider">Professional Services VAT</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 mt-1">{(R.profVat || 0.1) * 100}%</p>
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">Reduced Rate</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-gray-200">
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-wider">Record Retention</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 mt-1">{R.arch} years</p>
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">Mandatory Archival</p>
            </div>
          </div>
        </div>

        {/* Card 2: VAT Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
              <span className="text-base sm:text-xl">🧾</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">VAT Summary</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">{R.vl} {R.id === "EG" ? "(Professional: 10%)" : ""}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-emerald-200 text-center">
              <p className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Output VAT</p>
              <p className="text-base sm:text-xl font-black text-gray-900 mt-1 sm:mt-2 break-words">{formatCurrency(oV)}</p>
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">On Sales</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-rose-200 text-center">
              <p className="text-[8px] sm:text-[10px] font-bold text-rose-600 uppercase tracking-wider">Input VAT</p>
              <p className="text-base sm:text-xl font-black text-gray-900 mt-1 sm:mt-2 break-words">{formatCurrency(iV)}</p>
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">On Purchases</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-amber-300 text-center">
              <p className="text-[8px] sm:text-[10px] font-bold text-amber-700 uppercase tracking-wider">Net VAT Payable</p>
              <p className="text-base sm:text-xl font-black text-amber-700 mt-1 sm:mt-2 break-words">{formatCurrency(nV)}</p>
              <p className="text-[8px] sm:text-[10px] text-amber-600 mt-1">Due to ETA</p>
            </div>
          </div>
          
          {R.id === "EG" && (
            <p className="text-[10px] sm:text-xs mt-3 sm:mt-4 text-gray-500 p-2 sm:p-3 rounded-lg bg-gray-50 border border-gray-200">
              📅 Standard VAT 14% on goods/services. Professional/consultancy services taxed at 10%. Monthly filing within 30 days after period end.
            </p>
          )}
        </div>

        {/* Card 3: Corporate Tax */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
              <span className="text-base sm:text-xl">🏢</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Corporate Tax</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">{R.id === "EG" ? "22.5% on net profits" : "0%→9% (AED 375K)"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">Taxable Profit</p>
              <p className="text-base sm:text-xl font-black text-gray-900 mt-1 sm:mt-2 break-words">{formatCurrency(Math.max(0, pr))}</p>
              {R.id === "AE" && pr <= R.ctT && <p className="text-[8px] sm:text-[10px] mt-1 text-emerald-600">✓ Below threshold</p>}
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-gray-300">
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-700 uppercase tracking-wider">Est. CIT</p>
              <p className="text-base sm:text-xl font-black text-gray-700 mt-1 sm:mt-2 break-words">{formatCurrency(ct)}</p>
              <p className="text-[8px] sm:text-[10px] text-gray-500 mt-1">Estimated Liability</p>
            </div>
          </div>
          
          {R.id === "EG" && (
            <p className="text-[10px] sm:text-xs text-gray-500 p-2 sm:p-3 rounded-lg bg-gray-50 border border-gray-200">
              📅 Annual return due April 30. Accounting period: Jan 1 – Dec 31. WHT {R.wht} deducted on vendor payments.
            </p>
          )}
        </div>

        {/* SME Simplified Tax (Egypt only) */}
        {R.id === "EG" && smeEligible && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center shadow-sm">
                <span className="text-base sm:text-xl">💰</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-emerald-800">SME Simplified Tax</h3>
                <p className="text-[10px] sm:text-xs text-emerald-600">Law 5 & 6 of 2025</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-gray-600">Your revenue <strong>EGP {fmt(rev)}</strong> qualifies for simplified fixed-rate tax instead of 22.5% CIT.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 text-center">
                <p className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider">SME Tax Rate</p>
                <p className="text-lg sm:text-2xl font-black text-emerald-600 mt-1">{smeTier?.rate || "—"}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 text-center">
                <p className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Est. SME Tax</p>
                <p className="text-lg sm:text-2xl font-black text-emerald-600 mt-1 break-words">{formatCurrency(smeTax)}</p>
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-[8px] sm:text-[10px] font-bold mb-2 text-gray-700">SME Tax Tiers (Turnover ≤ EGP 20M)</p>
              <div className="space-y-1">
                {R.smeTiers?.map((t, i) => (
                  <div key={i} className="flex justify-between text-[8px] sm:text-[10px] py-1">
                    <span className={rev <= t.max && (!R.smeTiers?.[i - 1] || rev > R.smeTiers[i - 1].max) ? "text-emerald-600 font-bold" : "text-gray-500"}>
                      ≤ EGP {(t.max / 1000000).toFixed(1)}M
                    </span>
                    <span className={rev <= t.max && (!R.smeTiers?.[i - 1] || rev > R.smeTiers[i - 1].max) ? "text-emerald-600 font-bold" : "text-gray-500"}>
                      {t.rate} of revenue
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm mt-3 text-emerald-700 p-2 sm:p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              💰 Savings vs CIT: <strong className="text-emerald-700">EGP {fmt(ct - smeTax)}</strong>. Also exempt from stamp duty with reduced compliance obligations.
            </p>
          </div>
        )}

        {/* E-Invoicing Requirements (Egypt only) */}
        {R.id === "EG" && R.eInvFields && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                <span className="text-base sm:text-xl">🧾</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">E-Invoicing Requirements</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">B2B & B2G • Mandatory since April 2023</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-gray-500">{R.eInvModel}. Paper invoices NOT recognized for tax deductions.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
              {[
                ["Format", R.fmt],
                ["Model", "Clearance"],
                ["Coding", R.pc],
                ["B2C", "E-Receipts (POS)"]
              ].map(([l, v], i) => (
                <div key={i} className="p-2 sm:p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                  <p className="text-[8px] sm:text-[10px] font-bold text-gray-600">{l}</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">{v}</p>
                </div>
              ))}
            </div>
            <p className="text-[8px] sm:text-[10px] font-bold mb-2 text-gray-700">Mandatory Invoice Fields:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {R.eInvFields.map((f, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[8px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center bg-gray-200 text-gray-700">{i + 1}</span>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{f.l}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Updates */}
        {R.v26 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                <span className="text-base sm:text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">{R.id === "EG" ? "Egypt 2025–2026 Legal Updates" : "UAE 2026 VAT Amendments"}</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">Recent Regulatory Changes</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {R.v26.map((a, i) => (
                <div key={i} className="p-2 sm:p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-xs sm:text-sm font-bold text-gray-900">{a.t}</p>
                  <p className="text-[10px] sm:text-xs mt-1 text-gray-500">{a.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Implementation Checklist (Egypt only) */}
        {R.id === "EG" && R.implSteps && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                <span className="text-base sm:text-xl">🚀</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Implementation Checklist</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">ETA-Compliant Setup Steps</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {R.implSteps.map((s, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[8px] sm:text-[10px] font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-gray-200 text-gray-700">{i + 1}</span>
                  <p className="text-xs sm:text-sm font-medium text-gray-700">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tax Calendar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
              <span className="text-base sm:text-xl">📅</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Tax Calendar</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Important Filing Deadlines</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            {R.cal.map((ev, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-base sm:text-xl">{ev.r ? "🔄" : "⏰"}</span>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{ev.e}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Deadline: {ev.d}</p>
                </div>
                <span className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${ev.r ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                  {ev.r ? "Recurring" : "One-time"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        {R.id === "EG" && (
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-base sm:text-lg">⚠️</span>
              <p className="text-[10px] sm:text-xs text-gray-700">
                <strong>Disclaimer:</strong> Tax regulations in Egypt are updated frequently (especially with 2025 laws). Engage a local Egyptian tax advisor to ensure full compliance. Data reflects laws as of 2025/2026.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SetPg = ({ R, user, onLogout, onUserUpdate }: { R: RegionInfo; user: UserData; onLogout: () => void; onUserUpdate: (u: UserData) => void }) => {
  const [section, setSection] = useState<"profile" | "business" | "bank" | null>(null);
  const [pName, setPName] = useState(user.name || "");
  const [bName, setBName] = useState(user.bankName || "");
  const [bAcct, setBAcct] = useState(user.bankAccount || "");
  const [bIban, setBIban] = useState(user.bankIban || "");
  const [bSwift, setBSwift] = useState(user.bankSwift || "");
  const [pLink, setPLink] = useState(user.paymentLink || "");
  const [bizName, setBizName] = useState(user.businessName || "");
  const [bizPhone, setBizPhone] = useState(user.businessPhone || "");
  const [bizAddr, setBizAddr] = useState(user.businessAddress || "");
  const [taxId, setTaxId] = useState(user.taxId || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const saveSection = async (sec: string, data: Record<string, string>) => {
    setSaving(true);
    try {
      const res = await api.auth.updateProfile(data);
      onUserUpdate(res.user);
      setSaved(sec);
      setTimeout(() => setSaved(""), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const hasBankSetup = user.bankName || user.bankAccount || user.bankIban || user.paymentLink;
  const hasBizSetup = user.businessName || user.businessPhone || user.businessAddress || user.taxId;
  
  // Calculate profile completion percentage
  const profileFields = [user.name, user.email, user.businessName, user.taxId, user.bankName, user.bankAccount].filter(Boolean).length;
  const profileCompletion = Math.round((profileFields / 6) * 100);

  return (
    <div className="min-h-screen w-full bg-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">Settings</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:w-2/3 space-y-5 sm:space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                {/* Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl sm:text-3xl font-bold text-blue-600 shadow-sm border border-blue-200 flex-shrink-0 mx-auto sm:mx-0">
                  {user.avatar || user.name?.charAt(0).toUpperCase()}
                </div>
                
                {/* Profile Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">{user.name}</h2>
                      <p className="text-xs sm:text-sm text-gray-500">{user.email}</p>
                      {user.businessName && (
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {user.businessName}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => setSection(section === "profile" ? null : "profile")} 
                      className="text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all self-center sm:self-auto"
                    >
                      {section === "profile" ? "Close" : "Edit Profile"}
                    </button>
                  </div>
                  
                  {/* Progress Bar - Blue */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Profile Completion</span>
                      <span className="text-blue-600 font-semibold">{profileCompletion}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Edit Profile Section */}
              {section === "profile" && (
                <div className="space-y-3 pt-4 mt-4 border-t border-gray-100">
                  <Inp label="Full Name" value={pName} onChange={setPName} placeholder="Your full name" />
                  <p className="text-[10px] text-gray-500">Email: {user.email} (cannot be changed)</p>
                  <button 
                    onClick={() => saveSection("profile", { name: pName })} 
                    disabled={saving} 
                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving..." : saved === "profile" ? "✓ Saved!" : "Save Profile"}
                  </button>
                </div>
              )}
            </div>

            {/* Business Setup Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <span className="text-base sm:text-xl">🏢</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Business Setup</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">Company & Tax Information</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSection(section === "business" ? null : "business")} 
                  className="text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all self-start sm:self-auto"
                >
                  {section === "business" ? "Close" : hasBizSetup ? "Edit" : "Setup"}
                </button>
              </div>
              
              {/* Business Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase">Business Name</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user.businessName || "Not set"}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase">Tax ID / TIN</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user.taxId || "Not set"}</p>
                </div>
              </div>
              
              {/* Business Progress - Blue */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Business Profile Complete</span>
                  <span className="text-blue-600 font-semibold">
                    {[user.businessName, user.businessPhone, user.businessAddress, user.taxId].filter(Boolean).length}/4
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${([user.businessName, user.businessPhone, user.businessAddress, user.taxId].filter(Boolean).length / 4) * 100}%` }}
                  />
                </div>
              </div>
              
              {section === "business" && (
                <div className="space-y-3 pt-3 mt-3 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Inp label="Business Name" value={bizName} onChange={setBizName} placeholder="Your Company Name" />
                    <Inp label="Business Phone" value={bizPhone} onChange={setBizPhone} placeholder={R.id === "EG" ? "+20 10 1234 5678" : "+971 50 123 4567"} />
                  </div>
                  <Inp label="Business Address" value={bizAddr} onChange={setBizAddr} placeholder={R.id === "EG" ? "15 Tahrir St, Cairo, Egypt" : "Dubai Media City, Dubai, UAE"} textarea />
                  <Inp label={R.id === "EG" ? "Tax ID (TIN) — 9-digit" : "Tax Registration Number (TRN)"} value={taxId} onChange={setTaxId} placeholder={R.id === "EG" ? "123456789" : "100123456700003"} />
                  <button 
                    onClick={() => saveSection("business", { businessName: bizName, businessPhone: bizPhone, businessAddress: bizAddr, taxId })} 
                    disabled={saving} 
                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all"
                  >
                    {saving ? "Saving..." : saved === "business" ? "✓ Saved!" : "Save Business Info"}
                  </button>
                </div>
              )}
            </div>

            {/* Payment Details Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <span className="text-base sm:text-xl">💳</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Payment Details</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">Bank & Payment Information</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSection(section === "bank" ? null : "bank")} 
                  className="text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all self-start sm:self-auto"
                >
                  {section === "bank" ? "Close" : hasBankSetup ? "Edit" : "Setup"}
                </button>
              </div>
              
              {/* Payment Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase">Bank Account</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user.bankName || "Not set"}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase">Payment Link</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user.paymentLink ? "Configured" : "Not set"}</p>
                </div>
              </div>
              
              {/* Payment Progress - Blue */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Payment Setup Complete</span>
                  <span className="text-blue-600 font-semibold">
                    {[user.bankName, user.bankAccount, user.paymentLink].filter(Boolean).length}/3
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${([user.bankName, user.bankAccount, user.paymentLink].filter(Boolean).length / 3) * 100}%` }}
                  />
                </div>
              </div>
              
              {section === "bank" && (
                <div className="space-y-3 pt-3 mt-3 border-t border-gray-100">
                  <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500">Bank Account</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Inp label="Bank Name" value={bName} onChange={setBName} placeholder={R.id === "EG" ? "e.g. CIB, Banque Misr, NBE" : "e.g. Emirates NBD, ADCB"} />
                    <Inp label="Account Number" value={bAcct} onChange={setBAcct} placeholder="1234567890" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Inp label="IBAN" value={bIban} onChange={setBIban} placeholder={R.id === "EG" ? "EG38 0019 0005 0000 0000 1234 5" : "AE07 0331 2345 6789 0123 456"} />
                    <Inp label="SWIFT/BIC" value={bSwift} onChange={setBSwift} placeholder={R.id === "EG" ? "CIBEEGCX" : "EABORADR"} />
                  </div>
                  <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mt-2 text-gray-500">Payment Link</p>
                  <Inp label="Online Payment URL" value={pLink} onChange={setPLink} placeholder="https://pay.fawry.io/your-link or https://www.paypal.me/..." />
                  <button 
                    onClick={() => saveSection("bank", { bankName: bName, bankAccount: bAcct, bankIban: bIban, bankSwift: bSwift, paymentLink: pLink })} 
                    disabled={saving} 
                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all"
                  >
                    {saving ? "Saving..." : saved === "bank" ? "✓ Saved!" : "Save Payment Details"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="lg:w-1/3 space-y-5 sm:space-y-6">
            {/* Let's Finish Setting Up Card - White */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <span className="text-base sm:text-xl">🎯</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Let's Finish Setting Up</h3>
              </div>
              
              <div className="space-y-3">
                {!user.businessName && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="text-xs text-gray-700">Add Business Name</span>
                    <button onClick={() => setSection("business")} className="text-xs font-semibold text-blue-600">Setup →</button>
                  </div>
                )}
                {!user.taxId && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="text-xs text-gray-700">Add Tax ID / TIN</span>
                    <button onClick={() => setSection("business")} className="text-xs font-semibold text-blue-600">Setup →</button>
                  </div>
                )}
                {!user.bankName && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="text-xs text-gray-700">Add Bank Account</span>
                    <button onClick={() => setSection("bank")} className="text-xs font-semibold text-blue-600">Setup →</button>
                  </div>
                )}
                {!user.paymentLink && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="text-xs text-gray-700">Add Payment Link</span>
                    <button onClick={() => setSection("bank")} className="text-xs font-semibold text-blue-600">Setup →</button>
                  </div>
                )}
                {hasBizSetup && hasBankSetup && (
                  <div className="p-3 rounded-lg bg-green-50 text-green-700 text-center text-xs font-medium">
                    ✓ All setup complete!
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Overall Progress</span>
                  <span className="font-bold text-blue-600">{profileCompletion}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Business Compliance Card - White */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <span className="text-base sm:text-xl">⚖️</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Business Compliance</h3>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase">Region</p>
                    <span className="text-[8px] sm:text-[10px] font-semibold text-gray-700">{R.fl} {R.n}</span>
                  </div>
                  <p className="text-xs text-gray-600">{R.auth} • {R.vl}</p>
                </div>
                
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase mb-1">Tax Status</p>
                  <p className="text-xs text-gray-600">Corporate Tax: {R.id === "EG" ? "22.5% on net profits" : "0%→9% (AED 375K)"}</p>
                  <p className="text-xs text-gray-600 mt-0.5">VAT: {R.vl}</p>
                </div>
                
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase mb-1">E-Invoicing</p>
                  <p className="text-xs text-gray-600">{R.auth}: {R.eM ? "Active" : "Pilot"}</p>
                  <p className="text-xs text-gray-600 mt-0.5">Format: {R.fmt}</p>
                </div>
                
                <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✓</span>
                    <p className="text-xs font-medium text-green-700">Compliance Score: 85%</p>
                  </div>
                  <div className="h-1.5 bg-green-200 rounded-full overflow-hidden mt-2">
                    <div className="h-full w-[85%] bg-green-600 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone Card - White */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-red-200 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <span className="text-base sm:text-xl">⚠️</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-red-600">Danger Zone</h3>
              </div>
              
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-all">
                  Delete My Account
                </button>
              ) : (
                <div className="space-y-3 p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-xs font-semibold text-red-700">This will permanently delete your account, all cash books, invoices, and customer data. This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-white text-gray-600 border border-gray-200">Cancel</button>
                    <button onClick={async () => { try { await api.auth.deleteAccount(); onLogout(); } catch (e) { console.error(e); } }} className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-all">Confirm Delete</button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button onClick={onLogout} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all">
              🚪 Logout
            </button>
            
            <p className="text-center text-[8px] sm:text-[9px] text-gray-400 pb-4">felosak v1.0 · www.felosak.com · support@felosak.com</p>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
useEffect(()=>{
  api.auth.me().then(data=>{
    console.log("Auth check - user loaded:", data.user);
    setUser(data.user);
    setReg((data.user.region || "EG") as RegionKey);
  }).catch((err)=>{
    console.log("Auth check - no user:", err);
  }).finally(()=>{
    setAuthChecked(true);
    console.log("Auth check completed");
  });
},[]);
useEffect(() => {
  if (pg) {
    localStorage.setItem('lastPage', pg);
  }
}, [pg]);
useEffect(() => {
  const lastPage = localStorage.getItem('lastPage');
  if (lastPage && ['dash', 'cash', 'cashio', 'inv', 'ai', 'comp', 'set'].includes(lastPage)) {
    setPg(lastPage);
  }
}, []);
  const loadData = useCallback(async () => {
  if (!user) return;
  setLoading(true);
  try {
    // Save current page before loading
    const currentPage = pg;
    
    // Load books
    const booksData = await api.books.list();
    
    // Load ALL transactions for this user
    const transactionsQuery = query(
      collection(db, "transactions"), 
      where("userId", "==", user.id)
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
    const allTransactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Attach transactions to their respective books
    const booksWithTransactions = booksData.map(book => {
      const bookTransactions = allTransactions.filter(tx => tx.bookId === book.id);
      return {
        ...book,
        tx: bookTransactions.map(t => ({
          id: t.id,
          ty: t.type,
          am: parseFloat(t.amount),
          cat: t.category,
          no: t.note || "",
          dt: t.date,
          payMode: t.payMode || "cash",
          proof: t.proof || null,
        }))
      };
    });
    
    // Load customers
    const custData = await api.customers.list();
    const customersList = custData.map(mapCustomerFromApi);
    
    // Load invoices
    const invData = await api.invoices.list();
    
    setBooks(booksWithTransactions);
    setCustomers(customersList);
    setInvoices(invData);
    
    // Restore current page (prevents it from resetting to dash)
    setPg(currentPage);
    
  } catch(e) { 
    console.error("Error loading data:", e); 
  }
  setLoading(false);
}, [user]);

  useEffect(() => {
  if (user && authChecked) {
    loadData().finally(() => {
      setInitialDataLoaded(true);
    });
  } else if (authChecked && !user) {
    setInitialDataLoaded(true);
  }
}, [user, authChecked]);

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
if (initialDataLoaded === false && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your data...</p>
        </div>
      </div>
    );
  }
  if(!reg) return <RegSel onSel={async(r)=>{setReg(r);try{await api.auth.updateProfile({region:r});}catch(e){}}}/>;
  const R=RG[reg];

 const nav = [
  { id: "dash", l: LL.dashboard, i: "📊" },
  { id: "cash", l: LL.cash, i: "📒" },
  { id: "cashio", l: "Cash In/Out", i: "💰" },
  { id: "inv", l: LL.invoices, i: "📄" },
  { id: "ai", l: LL.ai, i: "🤖" },
  { id: "comp", l: LL.compliance, i: "⚖️" },
  { id: "set", l: LL.settings, i: "⚙️" }
];
  const page = () => {
  if (!initialDataLoaded) return <Spinner/>;
  if(loading && books.length === 0) return <Spinner/>;
  switch(pg){
    case "dash": return <Dash R={R} books={books} cu={customers} onNav={setPg}/>;
    case "cash": return <CashBookPg R={R} books={books} reload={loadData} cu={customers} invoices={invoices} user={user} />;
    case "cashio": return <CashInOut />;  // ← ADD THIS LINE
    case "inv": return <InvPg R={R} cu={customers} invoices={invoices} reload={loadData} user={user}/>;
    case "ai": return <AiPg R={R} books={books} cu={customers}/>;
    case "comp": return <CompPg R={R} books={books}/>;
    case "set": return <SetPg R={R} user={user} onLogout={handleLogout} onUserUpdate={setUser}/>;
    default: return null;
  }
};

  return <div className="flex flex-col md:flex-row h-screen overflow-hidden" style={{background:TK.bg,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
    <aside 
  className={`${sb ? "w-64" : "w-20"} transition-all duration-300 ease-in-out flex flex-col bg-white border-r border-gray-200 shadow-sm shrink-0 hidden md:flex`}
>
  {/* Logo Section */}
  <div className={`p-4 flex items-center ${sb ? "gap-3" : "justify-center"} border-b border-gray-100`}>
    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
      <img src={logoImg} alt="felosak" className="h-4 w-4 object-contain brightness-0 invert" />
    </div>
    {sb && (
      <div className="flex-1">
        <span className="font-bold text-gray-900 text-sm">felosak</span>
        <p className="text-[9px] text-gray-400">{R.fl} {R.n} • {R.cur}</p>
      </div>
    )}
  </div>

  {/* Navigation */}
  <nav className="flex-1 px-3 py-4 space-y-1">
  {nav.map((n) => {
    const isActive = pg === n.id;
    return (
      <button
  key={n.id}
  onClick={() => setPg(n.id)}
  className={`
    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
    transition-all duration-200 ease-in-out
    ${isActive 
  ? "bg-gray-100 text-gray-900 shadow-sm" 
  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
}
    ${!sb && "justify-center"}
  `}
>
  <span className="text-lg">{n.i}</span>
  {sb && <span className="truncate">{n.l}</span>}
</button>
    );
  })}
</nav>

  {/* User Section & Collapse Button */}
  <div className="p-3 border-t border-gray-100 space-y-3">
    {/* User Profile */}
    {sb && (
      <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {user.avatar || user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
          <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
        </div>
      </div>
    )}
    
    {/* Logout Button (visible when sidebar is collapsed) */}
    {!sb && (
      <button
        onClick={handleLogout}
        className="w-full flex justify-center p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Logout"
      >
        <LogOut size={18} />
      </button>
    )}
    
    {/* Logout Button (visible when sidebar is expanded) */}
    {sb && (
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
        Logout
      </button>
    )}
    
    {/* Collapse/Expand Button */}
    <button
      onClick={() => setSb(!sb)}
      className="w-full flex items-center justify-center gap-1 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
    >
      {sb ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  </div>
</aside>
    <main className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-3 md:px-5 py-2 bg-white border-b border-gray-200 shrink-0">
  <div className="flex items-center gap-2 md:gap-3">
    {/* Mobile Menu Button */}
    <button 
      onClick={() => setMobileMenuOpen(true)} 
      className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
      style={{background: TK.muted}}
    >
      <Menu className="w-5 h-5" style={{color: TK.text}} />
    </button>
    
    <div className="relative hidden sm:block">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
      <input placeholder={LL.search} className="pl-8 pr-3 py-1.5 rounded-xl text-xs w-32 md:w-48 outline-none" style={{background: TK.muted, border: `1px solid ${TK.border}`, color: TK.text}}/>
    </div>
    <span className="px-2 py-0.5 md:py-1 rounded-full text-[7px] md:text-[9px] font-bold whitespace-nowrap" style={{background: R.id === "EG" ? TK.badBg : TK.okBg, color: R.id === "EG" ? "#C8102E" : "#00732F"}}>
      {R.fl} {R.auth} • {R.vl}
    </span>
  </div>
  <div className="flex items-center gap-1 md:gap-2">
    <span className="relative cursor-pointer text-sm md:text-base">🔔<span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full" style={{background: TK.bad}}/></span>
    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold" style={{background: TK.accentBg, color: TK.accent}}>
      {user.avatar || user.name.charAt(0)}
    </div>
  </div>
</header>
{mobileMenuOpen && (
  <>
    <div 
      className="fixed inset-0 bg-black/50 z-40 md:hidden"
      onClick={() => setMobileMenuOpen(false)}
    />
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 md:hidden shadow-xl flex flex-col" style={{borderRight: `1px solid ${TK.border}`}}>
      <div className="flex items-center justify-between p-4 border-b" style={{borderColor: TK.border}}>
        <img src={logoImg} alt="felosak" className="h-6"/>
        <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
          <X className="w-5 h-5" style={{color: TK.text}} />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(n => {
          const a = pg === n.id;
          return (
            <button 
              key={n.id} 
              onClick={() => {
                setPg(n.id);
                setMobileMenuOpen(false);
              }} 
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all" 
              style={{background: a ? TK.accentBg : "transparent", color: a ? TK.accentD : TK.textS, fontWeight: a ? 700 : 500}}
            >
              <span className="text-lg">{n.i}</span>
              <span>{n.l}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t" style={{borderColor: TK.border}}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background: TK.accentBg, color: TK.accent}}>
            {user.avatar || user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{color: TK.text}}>{user.name}</p>
            <p className="text-[9px] truncate" style={{color: TK.textM}}>{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  </>
)}
      <div className="flex-1 overflow-y-auto p-5">{page()}</div>
    </main>
  </div>;
}
