import { useState, useEffect, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

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
};

const CATS=["sales","services","rent","inventory","salaries","utilities","transport","food","maintenance","other"];
const PERSONAL_CATS=["salary","freelance","gifts","groceries","dining","transport","entertainment","health","education","bills","shopping","savings","other"];

interface TxItem { id: number; ty: string; am: number; cat: string; no: string; dt: string }

interface CashBook {
  id: number;
  name: string;
  type: "business" | "personal";
  icon: string;
  color: string;
  tx: TxItem[];
  createdAt: string;
}

const DEFAULT_BOOKS: CashBook[] = [
  {id:1,name:"Main Shop",type:"business",icon:"🏪",color:BOOK_COLORS[0],createdAt:"Jan 2026",tx:[
    {id:1,ty:"in",am:12500,cat:"sales",no:"Shop daily sales",dt:"Mar 16"},
    {id:2,ty:"out",am:3200,cat:"inventory",no:"Stock purchase",dt:"Mar 16"},
    {id:3,ty:"in",am:8700,cat:"sales",no:"Wholesale – Ahmed",dt:"Mar 15"},
    {id:4,ty:"out",am:5000,cat:"rent",no:"March shop rent",dt:"Mar 15"},
    {id:5,ty:"in",am:4500,cat:"services",no:"Delivery fees",dt:"Mar 14"},
    {id:6,ty:"out",am:1800,cat:"utilities",no:"Electricity bill",dt:"Mar 14"},
    {id:7,ty:"in",am:15000,cat:"sales",no:"Bulk sale – Mohamed",dt:"Mar 13"},
    {id:8,ty:"out",am:7500,cat:"salaries",no:"Employee salaries",dt:"Mar 13"},
  ]},
  {id:2,name:"Online Store",type:"business",icon:"🛒",color:BOOK_COLORS[1],createdAt:"Feb 2026",tx:[
    {id:9,ty:"in",am:6200,cat:"sales",no:"Online orders",dt:"Mar 12"},
    {id:10,ty:"out",am:950,cat:"transport",no:"Shipping costs",dt:"Mar 12"},
    {id:11,ty:"in",am:3800,cat:"services",no:"Consultation",dt:"Mar 11"},
    {id:12,ty:"out",am:2400,cat:"maintenance",no:"Website hosting",dt:"Mar 11"},
  ]},
  {id:3,name:"Freelance Projects",type:"business",icon:"💼",color:BOOK_COLORS[2],createdAt:"Mar 2026",tx:[
    {id:13,ty:"in",am:9900,cat:"services",no:"Design project – Sara",dt:"Mar 10"},
    {id:14,ty:"out",am:1200,cat:"utilities",no:"Software licenses",dt:"Mar 9"},
  ]},
  {id:4,name:"Personal Wallet",type:"personal",icon:"👛",color:BOOK_COLORS[3],createdAt:"Jan 2026",tx:[
    {id:15,ty:"in",am:18000,cat:"salary",no:"Monthly salary",dt:"Mar 1"},
    {id:16,ty:"out",am:4500,cat:"groceries",no:"Weekly groceries",dt:"Mar 15"},
    {id:17,ty:"out",am:2000,cat:"dining",no:"Restaurants",dt:"Mar 14"},
    {id:18,ty:"out",am:800,cat:"entertainment",no:"Netflix & Spotify",dt:"Mar 10"},
    {id:19,ty:"out",am:3500,cat:"bills",no:"Phone & Internet",dt:"Mar 5"},
  ]},
  {id:5,name:"Savings",type:"personal",icon:"🏦",color:BOOK_COLORS[4],createdAt:"Jan 2026",tx:[
    {id:20,ty:"in",am:5000,cat:"savings",no:"Monthly savings transfer",dt:"Mar 1"},
    {id:21,ty:"in",am:2500,cat:"freelance",no:"Side gig payment",dt:"Mar 8"},
  ]},
];

const BOOK_ICONS=["🏪","🛒","💼","🏢","🏭","🚗","🏠","📱","💻","🎯","📦","🔧","👛","🏦","💳","🎓","✈️","🏥","🎭","📚"];

interface CustItem { id: number; nm: string; ph: string; ow: number; pd: number; tr: number }

const CUST: CustItem[] = [
  {id:1,nm:"Ahmed Hassan",ph:"+201012345678",ow:8700,pd:25000,tr:92},
  {id:2,nm:"Mohamed Ali",ph:"+201098765432",ow:15000,pd:45000,tr:85},
  {id:3,nm:"Sara Ibrahim",ph:"+201155544433",ow:3800,pd:12000,tr:95},
  {id:4,nm:"Khaled Mahmoud",ph:"+201234567890",ow:22000,pd:18000,tr:65},
  {id:5,nm:"Fatma Youssef",ph:"+201188877766",ow:0,pd:35000,tr:99},
];

const MO=[{m:"Oct",i:62000,e:41000},{m:"Nov",i:78000,e:52000},{m:"Dec",i:95000,e:61000},{m:"Jan",i:71000,e:48000},{m:"Feb",i:84000,e:55000},{m:"Mar",i:91500,e:21450}];

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

const Inp = ({label,value,onChange,type="text",placeholder,options,prefix,textarea}: {label?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; options?: {v: string; l: string}[]; prefix?: string; textarea?: boolean}) => (
  <div className="mb-3">
    {label&&<label className="block text-[10px] font-bold mb-1 uppercase tracking-wider" style={{color:TK.textM}}>{label}</label>}
    <div className="relative">
      {prefix&&<span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{color:TK.textM}}>{prefix}</span>}
      {options?<select value={value} onChange={e=>onChange(e.target.value)} className="w-full p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}>
        {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>:
      textarea?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 resize-none" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}/>:
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={`w-full p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 ${prefix?"pl-12":""}`} style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}/>}
    </div>
  </div>
);

const fmt = (n: number) => n.toLocaleString();

const Login = ({onLogin}: {onLogin: () => void}) => {
  const [em,setEm]=useState("admin@feloosak.com");
  const [pw,setPw]=useState("••••••••");
  const [showPw,setShowPw]=useState(false);
  const [ld,setLd]=useState(false);
  const go=()=>{setLd(true);setTimeout(()=>{setLd(false);onLogin();},700);};

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
        <h1 className="text-xl font-black mb-0.5" style={{color:TK.text}}>Sign in</h1>
        <p className="text-xs mb-6" style={{color:TK.textM}}>Enter your credentials to continue</p>
        <Inp label="Email" value={em} onChange={setEm} type="email" placeholder="you@company.com"/>
        <div className="mb-3">
          <label className="block text-[10px] font-bold mb-1 uppercase tracking-wider" style={{color:TK.textM}}>Password</label>
          <div className="relative">
            <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} className="w-full p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200" style={{background:TK.muted,border:`1px solid ${TK.border}`,color:TK.text}}/>
            <button onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{color:TK.textM}}>{showPw?"Hide":"Show"}</button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-5">
          <label className="flex items-center gap-1.5 text-[11px]" style={{color:TK.textS}}><input type="checkbox" defaultChecked className="rounded"/>Remember me</label>
          <button className="text-[11px] font-semibold" style={{color:TK.accent}}>Forgot password?</button>
        </div>
        <button onClick={go} disabled={ld} className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
          style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510",boxShadow:"0 2px 8px #C8A63040"}}>
          {ld?<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>:<>🔒 Sign In</>}
        </button>
        <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px" style={{background:TK.border}}/><span className="text-[10px]" style={{color:TK.textM}}>or</span><div className="flex-1 h-px" style={{background:TK.border}}/></div>
        <div className="grid grid-cols-2 gap-2">
          {["G  Google","🍎 Apple"].map(p=><button key={p} className="py-2 rounded-xl text-xs font-semibold hover:bg-gray-50" style={{border:`1px solid ${TK.border}`,color:TK.text}}>{p}</button>)}
        </div>
        <p className="text-center text-[11px] mt-5" style={{color:TK.textM}}>No account? <button className="font-bold" style={{color:TK.accent}}>Sign up</button></p>
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
        <div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate" style={{color:TK.text}}>{t.no}</p><p className="text-[10px]" style={{color:TK.textM}}>{bk?`${bk.icon} ${bk.name} • `:""}{LL[t.cat]||t.cat} • {t.dt}</p></div>
        <p className="text-xs font-bold" style={{color:isI?TK.ok:TK.bad}}>{isI?"+":"-"}{R.cur} {fmt(t.am)}</p>
      </div>})}</div>
    </Card>
  </div>;
};

const CashBookPg = ({R,books,setBooks,cu}: {R: RegionInfo; books: CashBook[]; setBooks: React.Dispatch<React.SetStateAction<CashBook[]>>; cu: CustItem[]}) => {
  const c=R.cur;
  const [bookType,setBookType]=useState<"business"|"personal">("business");
  const [activeBook,setActiveBook]=useState<number|null>(null);
  const [tab,setTab]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [showNewBook,setShowNewBook]=useState(false);
  const [ty,setTy]=useState("in");
  const [am,setAm]=useState("");const [ca,setCa]=useState("sales");const [no,setNo]=useState("");
  const [newBookName,setNewBookName]=useState("");
  const [newBookIcon,setNewBookIcon]=useState("🏪");

  const filteredBooks = books.filter(b=>b.type===bookType);
  const currentBook = activeBook!==null ? books.find(b=>b.id===activeBook) : null;
  const currentCats = bookType==="personal" ? PERSONAL_CATS : CATS;

  const allTxInType = filteredBooks.flatMap(b=>b.tx);
  const totalIn = allTxInType.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);
  const totalOut = allTxInType.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);

  const addTx=()=>{
    if(!am||isNaN(Number(am))||!currentBook)return;
    const newTx: TxItem = {id:Date.now(),ty,am:parseFloat(am),cat:ca,no,dt:"Mar 16"};
    setBooks(prev=>prev.map(b=>b.id===currentBook.id?{...b,tx:[newTx,...b.tx]}:b));
    setShowAdd(false);setAm("");setNo("");
  };

  const removeTx=(txId: number)=>{
    if(!currentBook)return;
    setBooks(prev=>prev.map(b=>b.id===currentBook.id?{...b,tx:b.tx.filter(t=>t.id!==txId)}:b));
  };

  const createBook=()=>{
    if(!newBookName.trim())return;
    const newBook: CashBook = {
      id:Date.now(),name:newBookName.trim(),type:bookType,icon:newBookIcon,
      color:BOOK_COLORS[books.length%BOOK_COLORS.length],tx:[],createdAt:"Mar 2026"
    };
    setBooks(prev=>[...prev,newBook]);
    setShowNewBook(false);setNewBookName("");setNewBookIcon("🏪");
  };

  const deleteBook=(bookId: number)=>{
    setBooks(prev=>prev.filter(b=>b.id!==bookId));
    if(activeBook===bookId)setActiveBook(null);
  };

  if(currentBook){
    const bTx = currentBook.tx;
    const bIn = bTx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);
    const bOut = bTx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);
    const fl = tab==="in"?bTx.filter(t=>t.ty==="in"):tab==="out"?bTx.filter(t=>t.ty==="out"):tab==="cust"?[]:bTx;

    return <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={()=>setActiveBook(null)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 text-sm" style={{border:`1px solid ${TK.border}`}}>←</button>
        <div className="flex-1">
          <div className="flex items-center gap-2"><span className="text-lg">{currentBook.icon}</span><h1 className="text-lg font-bold" style={{color:TK.text}}>{currentBook.name}</h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{background:currentBook.type==="business"?TK.infoBg:TK.accentBg,color:currentBook.type==="business"?TK.info:TK.accent}}>{currentBook.type}</span>
          </div>
          <p className="text-[10px]" style={{color:TK.textM}}>Created {currentBook.createdAt} • {bTx.length} transactions</p>
        </div>
        <button onClick={()=>setShowAdd(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>+ {LL.add}</button>
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
        <div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate" style={{color:TK.text}}>{t.no||LL[t.cat]||t.cat}</p><p className="text-[10px]" style={{color:TK.textM}}>{LL[t.cat]||t.cat} • {t.dt}</p></div>
        <p className="text-xs font-bold" style={{color:isI?TK.ok:TK.bad}}>{isI?"+":"-"}{c} {fmt(t.am)}</p>
        <button onClick={()=>removeTx(t.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition-opacity">✕</button>
      </div>})}</div>}</div>}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title={`${LL.add} — ${currentBook.icon} ${currentBook.name}`}>
        <div className="flex gap-2 mb-3">{(["in","out"] as const).map(t=><button key={t} onClick={()=>setTy(t)} className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all" style={{background:ty===t?(t==="in"?TK.ok:TK.bad):TK.muted,color:ty===t?"#fff":TK.textM}}>{t==="in"?`↓ ${LL.cashIn}`:`↑ ${LL.cashOut}`}</button>)}</div>
        <Inp label={LL.amount} value={am} onChange={setAm} type="number" placeholder="0.00" prefix={c}/>
        <Inp label={LL.category} value={ca} onChange={setCa} options={currentCats.map(x=>({v:x,l:LL[x]||x.charAt(0).toUpperCase()+x.slice(1)}))}/>
        <Inp label={LL.note} value={no} onChange={setNo} placeholder="Add a note..."/>
        <button onClick={addTx} className="w-full py-2.5 rounded-xl text-sm font-bold mt-1" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>{LL.save}</button>
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
            <p className="text-[10px] mt-0.5" style={{color:TK.textM}}>{book.tx.length} transactions • Since {book.createdAt}</p>
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
      <button onClick={createBook} className="w-full py-2.5 rounded-xl text-sm font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>Create Book</button>
    </Modal>
  </div>;
};

interface InvLine { n: string; q: number; p: number; d: number }

const InvPg = ({R,cu}: {R: RegionInfo; cu: CustItem[]}) => {
  const c=R.cur;
  const [showC,setShowC]=useState(false);
  const [iCu,setICu]=useState("");const [iTm,setITm]=useState("net30");const [iAd,setIAd]=useState("");const [iNo,setINo]=useState("");
  const [its,setIts]=useState<InvLine[]>([{n:"",q:1,p:0,d:0}]);
  const addIt=()=>setIts(p=>[...p,{n:"",q:1,p:0,d:0}]);
  const upIt=(i: number,f: string,v: string)=>setIts(p=>p.map((x,j)=>j===i?{...x,[f]:f==="n"?v:parseFloat(v)||0}:x));
  const rmIt=(i: number)=>setIts(p=>p.filter((_,j)=>j!==i));
  const lines=its.map(x=>({...x,disc:x.q*x.p*(x.d/100),lt:x.q*x.p*(1-x.d/100)}));
  const sub=lines.reduce((s,x)=>s+x.lt,0);const vat=Math.round(sub*R.vr);const tot=sub+vat;

  const sinv=[{nm:"FEL-001",cu:"Ahmed Hassan",t:Math.round(8700*(1+R.vr)),s:"unpaid"},{nm:"FEL-002",cu:"Mohamed Ali",t:Math.round(15000*(1+R.vr)),s:"unpaid"},{nm:"FEL-003",cu:"Fatma Youssef",t:Math.round(6500*(1+R.vr)),s:"paid"},{nm:"FEL-004",cu:"Sara Ibrahim",t:Math.round(3800*(1+R.vr)),s:"draft"}];
  const sc: Record<string,string>={paid:TK.ok,unpaid:TK.warn,draft:TK.textM};

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
    <div className="space-y-1.5">{sinv.map((inv,i)=><Card key={i} className="p-3.5 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:TK.accentBg}}>📄</div>
      <div className="flex-1"><p className="text-xs font-semibold" style={{color:TK.text}}>{inv.nm}</p><p className="text-[10px]" style={{color:TK.textM}}>{inv.cu}</p></div>
      <div className="text-right"><p className="text-xs font-bold" style={{color:TK.text}}>{c} {fmt(inv.t)}</p><span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase mt-0.5" style={{background:`${sc[inv.s]}12`,color:sc[inv.s]}}>{inv.s}</span></div>
    </Card>)}</div>

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
        <button className="py-2 rounded-xl text-[11px] font-bold" style={{background:"linear-gradient(135deg,#C8A630,#DABC42)",color:"#1A1510"}}>📨 {R.id==="EG"?"Submit ETA":"Send"}</button>
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
        const bestBook=books.reduce((a,b)=>{const bi=b.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0)-b.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);const ai=a.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0)-a.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);return bi>ai?b:a;});
        r=`📊 **Cash Flow Summary**\n\nTotal across **${books.length} books**: **${c} ${fmt(bal)}** net\n• Income: **${c} ${fmt(tI)}**\n• Expenses: **${c} ${fmt(tO)}**\n• Cash flow ratio: **${(tI/Math.max(tO,1)*100).toFixed(0)}%**\n\n🏆 Best performing: **${bestBook.icon} ${bestBook.name}**\n\n${bal>0?"✅ Positive cash flow — healthy position.":"⚠️ Negative cash flow — review expenses urgently."}`;
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
        r=`👥 **Customer Receivables**\n\n${overdueCustomers.length>0?`⚠️ **${overdueCustomers.length} customers** owe **${c} ${fmt(totalOwed)}**:\n\n${overdueCustomers.map(x=>`• **${x.nm}**: ${c} ${fmt(x.ow)} (Trust: ${x.tr}%${x.tr<80?" ⚠️ LOW":""})`).join("\n")}\n\n💡 **Recommendations**:\n${overdueCustomers.filter(x=>x.tr<80).map(x=>`• ${x.nm}: Consider payment plan or advance deposits for future orders`).join("\n")}\n• Send automated reminders via ${R.auth} for compliant collection`:`✅ All customers are clear — no outstanding receivables!\n\n${cu.length} active customers with avg trust score: **${Math.round(cu.reduce((s,x)=>s+x.tr,0)/cu.length)}%**`}`;
      }
      else if(lo.includes("expense")||lo.includes("spending")||lo.includes("cost")||lo.includes("مصاريف")){
        r=`📉 **Expense Analysis**\n\nTotal expenses: **${c} ${fmt(tO)}**\n\nTop categories:\n${topExpenseCat.slice(0,5).map(([cat,val],i)=>`${i+1}. **${LL[cat]||cat}**: ${c} ${fmt(val)} (${(val/tO*100).toFixed(1)}%)`).join("\n")}\n\n💡 **Insights**:\n${topExpenseCat[0]?`• Largest: **${LL[topExpenseCat[0][0]]||topExpenseCat[0][0]}** at ${(topExpenseCat[0][1]/tO*100).toFixed(0)}% of total`:""}\n• Consider negotiating bulk discounts with top suppliers\n• Review recurring costs quarterly for optimization`;
      }
      else if(lo.includes("compare")||lo.includes("book")||lo.includes("entity")||lo.includes("دفتر")){
        r=`📚 **Cash Book Comparison**\n\n**Business Books** (${bizBooks.length}):\n${bizBooks.map(b=>{const bi=b.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);const bo=b.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);return `• ${b.icon} **${b.name}**: Net ${c} ${fmt(bi-bo)} (${b.tx.length} tx)`;}).join("\n")}\n\n**Personal Books** (${perBooks.length}):\n${perBooks.map(b=>{const bi=b.tx.filter(t=>t.ty==="in").reduce((s,t)=>s+t.am,0);const bo=b.tx.filter(t=>t.ty==="out").reduce((s,t)=>s+t.am,0);return `• ${b.icon} **${b.name}**: Net ${c} ${fmt(bi-bo)} (${b.tx.length} tx)`;}).join("\n")}\n\n💡 Keep business and personal finances separate for clean tax filing and compliance.`;
      }
      else if(lo.includes("budget")||lo.includes("save")||lo.includes("saving")||lo.includes("ميزانية")){
        const savingsRate=bal>0?((bal/tI)*100).toFixed(1):"0";
        r=`💰 **Budget & Savings Advice**\n\n• Current savings rate: **${savingsRate}%** of income\n• ${parseFloat(savingsRate)>20?"✅ Excellent! Above 20% target.":parseFloat(savingsRate)>10?"⚠️ Fair. Try to reach 20% savings rate.":"❌ Low savings. Review discretionary spending."}\n\n**Recommendations for ${R.n}:**\n• Set aside ${R.id==="EG"?"15-20%":"20-25%"} of monthly revenue as buffer\n• Automate VAT provision: reserve **${(R.vr*100)}%** of sales immediately\n• Emergency fund: maintain 3-6 months of operating costs\n• ${R.id==="EG"?"Consider Treasury Bills (T-Bills) for surplus cash — currently ~22% yield":"Consider UAE savings accounts or Sukuk for surplus — 4-5% yield"}`;
      }
      else if(lo.includes("invoice")||lo.includes("فاتورة")||lo.includes("billing")){
        r=`📄 **Invoicing Best Practices (${R.n})**\n\n**${R.auth} Requirements:**\n• Format: ${R.fmt}\n• Signature: ${R.sig}\n• Archival: ${R.arch} years minimum\n${R.id==="EG"?"• GS1 product codes required\n• Real-time submission to ETA\n• UUID + QR code mandatory":"• TRN (Tax Registration Number) required\n• Peppol CTC pilot starting July 2026\n• Full mandate expected 2027"}\n\n**Tips:**\n• Send invoices within 24 hours of delivery\n• Include clear payment terms (Net 30 recommended)\n• Follow up on unpaid invoices at 7, 14, 21 days\n• ${R.id==="EG"?"Use Paymob or Fawry for instant collection":"Offer Apple Pay / Tabby for faster payment"}`;
      }
      else if(lo.includes("profit")||lo.includes("ربح")){
        const ct=R.id==="EG"?Math.round(bal*R.ct):Math.round(Math.max(0,bal-R.ctT)*R.ct);
        const afterTax=bal-ct-Math.round(bal*R.vr);
        r=`📊 **Profitability Analysis**\n\n• Gross profit: **${c} ${fmt(bal)}**\n• Est. VAT (${(R.vr*100)}%): **${c} ${fmt(Math.round(bal*R.vr))}**\n• Est. Corp Tax: **${c} ${fmt(ct)}**\n• **After-tax profit: ${c} ${fmt(afterTax)}**\n• Profit margin: **${(bal/Math.max(tI,1)*100).toFixed(1)}%**\n\n${bal/tI>0.3?"✅ Strong margins above 30%.":bal/tI>0.15?"⚠️ Moderate margins. Look for cost optimizations.":"❌ Thin margins below 15%. Urgent cost review needed."}`;
      }
      else if(lo.includes("hello")||lo.includes("hi")||lo.includes("مرحبا")||lo.includes("اهلا")){
        r=`Hello! 👋 I'm your Feloosak AI assistant for ${R.n}. Here's what I can help with:\n\n• 💰 **Cash flow** — "What's my cash flow?"\n• 🧾 **VAT** — "VAT breakdown"\n• 🏛️ **Tax** — "Tax liability"\n• 👥 **Customers** — "Overdue customers"\n• 📉 **Expenses** — "Top expenses"\n• 📚 **Books** — "Compare my books"\n• 💰 **Budget** — "Budget advice"\n• 📄 **Invoicing** — "Invoice tips"\n\nJust type your question!`;
      }
      else if(lo.includes("help")||lo.includes("مساعدة")||lo.includes("what can")){
        r=`I can analyze your finances across all **${books.length} cash books** and provide insights on:\n\n🔢 **Numbers**: Cash flow, profit margins, expense ratios\n🧾 **Compliance**: ${R.auth} rules, VAT filing, e-invoice requirements\n📊 **Analysis**: Variance reports, trend detection, anomaly alerts\n👥 **Customers**: Receivable tracking, trust scores, collection tips\n💡 **Advice**: Budget planning, tax optimization, savings strategies\n📄 **Invoicing**: ${R.n}-specific requirements, best practices\n\nTry asking: "What's my cash flow?" or "Compare my books" or "Budget advice"`;
      }
      else{
        r=`I can help with many topics! Try asking about:\n\n• **"Cash flow"** — full financial overview\n• **"VAT breakdown"** — ${R.vl} calculations\n• **"Tax liability"** — corporate tax estimate\n• **"Overdue customers"** — receivable alerts\n• **"Top expenses"** — spending analysis\n• **"Compare my books"** — book-by-book view\n• **"Budget advice"** — savings tips for ${R.n}\n• **"Invoice tips"** — ${R.auth} compliance guide\n• **"Profit"** — profitability analysis`;
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
          <p className="text-[11px] mt-1 leading-relaxed" style={{color:TK.textS}}>Salaries up <strong style={{color:TK.bad}}>+10.3%</strong> ({c} 700 increase — new delivery hire). Inventory down 22% — supplier renegotiation successful. Across <strong>{books.length} books</strong>, net position is <strong style={{color:bal>=0?TK.ok:TK.bad}}>{c} {fmt(bal)}</strong>.</p></div></div>
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
        {typ&&<div className="flex justify-start"><div className="p-3 rounded-2xl" style={{background:TK.muted}}><div className="flex gap-1 items-center"><div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{background:TK.accent,animationDelay:`${i*0.15}s`}}/>)}</div><span className="text-[10px] ml-2" style={{color:TK.textM}}>Analyzing your data...</span></div></div></div>}
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

const SetPg = ({R,setReg,setAuth}: {R: RegionInfo; setReg: (r: RegionKey | null) => void; setAuth: (v: boolean) => void}) => (
  <div className="space-y-4">
    <h1 className="text-lg font-bold" style={{color:TK.text}}>{LL.settings}</h1>
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${TK.accent}12`}}>📍</div><div><p className="text-xs font-semibold" style={{color:TK.text}}>{LL.region}</p><p className="text-[10px]" style={{color:TK.textM}}>{R.fl} {R.n} • {R.auth} • {R.vl}</p></div></div>
        <div className="flex rounded-xl overflow-hidden" style={{border:`1px solid ${TK.border}`}}>{(["EG","AE"] as RegionKey[]).map(r=><button key={r} onClick={()=>setReg(r)} className="px-3 py-1.5 text-[11px] font-bold" style={{background:R.id===r?TK.accent:"transparent",color:R.id===r?"#fff":TK.textM}}>{RG[r].fl} {r}</button>)}</div>
      </div>
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${TK.ok}12`}}>🛡</div><div><p className="text-xs font-semibold" style={{color:TK.text}}>{R.auth}</p><p className="text-[10px]" style={{color:TK.textM}}>{R.fmt} • {R.eM?"Mandatory":"Pilot"}</p></div></div>
        <Badge t={R.eM?"Active":"Pilot"} c={R.eM?TK.ok:TK.warn}/></div>
    </Card>
    <Card className="p-4"><h3 className="text-xs font-bold mb-3" style={{color:TK.text}}>🇪🇬 vs 🇦🇪 Comparison</h3>
      <div className="space-y-1">{[["VAT","14%","5%"],["Corp Tax","22.5% flat","0%→9%"],["E-Invoice","ETA Mandatory","FTA Pilot 2026"],["Archival","7 years","5 years"],["Social Ins","11%+18.75%","5%+12.5% (nationals)"]].map(([l,eg,ae],i)=>
        <div key={i} className="grid grid-cols-3 text-[10px] p-1.5 rounded" style={{background:i%2===0?TK.muted:"transparent"}}>
          <span className="font-bold" style={{color:TK.text}}>{l}</span><span style={{color:R.id==="EG"?TK.accent:TK.textM}}>{eg}</span><span style={{color:R.id==="AE"?TK.accent:TK.textM}}>{ae}</span>
        </div>)}</div></Card>
    <button onClick={()=>{setAuth(false);setReg(null);}} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold" style={{color:TK.bad,border:`1px solid ${TK.bad}20`}}>🚪 {LL.logout}</button>
  </div>
);

export default function App(){
  const [auth,setAuth]=useState(false);
  const [reg,setReg]=useState<RegionKey | null>(null);
  const [pg,setPg]=useState("dash");
  const [sb,setSb]=useState(true);
  const [books,setBooks]=useState<CashBook[]>(DEFAULT_BOOKS);

  if(!auth) return <Login onLogin={()=>setAuth(true)}/>;
  if(!reg) return <RegSel onSel={setReg}/>;
  const R=RG[reg];

  const nav=[{id:"dash",i:"📊",l:LL.dashboard},{id:"cash",i:"📒",l:LL.cash},{id:"inv",i:"📄",l:LL.invoices},{id:"ai",i:"⚡",l:LL.ai},{id:"comp",i:"⚖️",l:LL.compliance},{id:"set",i:"⚙️",l:LL.settings}];

  const page=()=>{switch(pg){
    case "dash":return <Dash R={R} books={books} cu={CUST}/>;
    case "cash":return <CashBookPg R={R} books={books} setBooks={setBooks} cu={CUST}/>;
    case "inv":return <InvPg R={R} cu={CUST}/>;
    case "ai":return <AiPg R={R} books={books} cu={CUST}/>;
    case "comp":return <CompPg R={R} books={books}/>;
    case "set":return <SetPg R={R} setReg={setReg} setAuth={setAuth}/>;
    default:return null;
  }};

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
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{background:TK.accentBg,color:TK.accent}}>A</div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-5">{page()}</div>
    </main>
  </div>;
}
