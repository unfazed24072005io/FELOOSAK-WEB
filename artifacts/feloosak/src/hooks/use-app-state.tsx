import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

// === TYPES ===
export type Region = 'egypt' | 'uae';

export interface RegionData {
  region: Region;
  id: string;
  name: string;
  nameAr: string;
  flag: string;
  currency: string;
  currencyAr: string;
  vatRate: number;
  vatLabel: string;
  authority: string;
  ctRate: number;
  ctThreshold: number;
  eMandatory: boolean;
  archival: number;
}

export interface Tx {
  id: string;
  type: 'in' | 'out';
  amount: number;
  category: string;
  note: string;
  date: string;
  customer?: string;
  synced: boolean;
}

export interface Customer {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  owed: number;
  paid: number;
  trust: number;
}

// === REGION CONSTANTS ===
export const egyptData: RegionData = {
  region: 'egypt', id: 'EG', name: 'Egypt', nameAr: 'مصر',
  flag: '🇪🇬', currency: 'EGP', currencyAr: 'ج.م',
  vatRate: 0.14, vatLabel: 'VAT 14%', authority: 'ETA',
  ctRate: 0.225, ctThreshold: 0, eMandatory: true, archival: 7
};

export const uaeData: RegionData = {
  region: 'uae', id: 'AE', name: 'UAE', nameAr: 'الإمارات',
  flag: '🇦🇪', currency: 'AED', currencyAr: 'د.إ',
  vatRate: 0.05, vatLabel: 'VAT 5%', authority: 'FTA',
  ctRate: 0.09, ctThreshold: 375000, eMandatory: false, archival: 5
};

// === CONTEXT TYPE ===
interface AppState {
  region: Region | null;
  R: RegionData | null;
  lang: string;
  isAr: boolean;
  authed: boolean;
  tab: number;
  txs: Tx[];
  custs: Customer[];
  totalIn: number;
  totalOut: number;
  balance: number;
  totalOwed: number;
  
  login: () => void;
  logout: () => void;
  setRegion: (r: Region) => void;
  setLang: (l: string) => void;
  setTab: (t: number) => void;
  addTx: (tx: Tx) => void;
  deleteTx: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

// === PROVIDER ===
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<Region | null>(null);
  const [lang, setLangState] = useState<string>('en');
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [custs, setCusts] = useState<Customer[]>([]);

  const isAr = lang === 'ar';
  const R = region === 'egypt' ? egyptData : region === 'uae' ? uaeData : null;

  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [isAr, lang]);

  const login = () => setAuthed(true);
  
  const logout = () => {
    setAuthed(false);
    setRegionState(null);
    setTxs([]);
    setCusts([]);
  };

  const seedData = () => {
    setTxs([
      { id: '1', type: 'in', amount: 12500, category: 'sales', note: 'Shop daily sales', date: '2026-03-16', synced: true },
      { id: '2', type: 'out', amount: 3200, category: 'inventory', note: 'Stock purchase', date: '2026-03-16', synced: true },
      { id: '3', type: 'in', amount: 8700, category: 'sales', note: 'Wholesale – Ahmed', date: '2026-03-15', customer: 'Ahmed Hassan', synced: true },
      { id: '4', type: 'out', amount: 5000, category: 'rent', note: 'March rent', date: '2026-03-15', synced: true },
      { id: '5', type: 'in', amount: 4500, category: 'services', note: 'Delivery fees', date: '2026-03-14', synced: true },
      { id: '6', type: 'out', amount: 1800, category: 'utilities', note: 'Electricity', date: '2026-03-14', synced: true },
      { id: '7', type: 'in', amount: 15000, category: 'sales', note: 'Bulk – Mohamed', date: '2026-03-13', synced: true },
      { id: '8', type: 'out', amount: 7500, category: 'salaries', note: 'Salaries', date: '2026-03-13', synced: true },
      { id: '9', type: 'in', amount: 6200, category: 'sales', note: 'Online orders', date: '2026-03-12', synced: true },
      { id: '10', type: 'out', amount: 950, category: 'transport', note: 'Fuel', date: '2026-03-12', synced: true },
    ]);
    setCusts([
      { id: '1', name: 'Ahmed Hassan', nameAr: 'أحمد حسن', phone: '+201012345678', owed: 8700, paid: 25000, trust: 92 },
      { id: '2', name: 'Mohamed Ali', nameAr: 'محمد علي', phone: '+201098765432', owed: 15000, paid: 45000, trust: 85 },
      { id: '3', name: 'Sara Ibrahim', nameAr: 'سارة إبراهيم', phone: '+201155544433', owed: 3800, paid: 12000, trust: 95 },
      { id: '4', name: 'Khaled Mahmoud', nameAr: 'خالد محمود', phone: '+201234567890', owed: 22000, paid: 18000, trust: 65 },
      { id: '5', name: 'Fatma Youssef', nameAr: 'فاطمة يوسف', phone: '+201188877766', owed: 0, paid: 35000, trust: 99 },
    ]);
  };

  const setRegion = (r: Region) => {
    setRegionState(r);
    seedData();
  };

  const setLang = (l: string) => setLangState(l);

  const addTx = (tx: Tx) => setTxs(prev => [tx, ...prev]);
  const deleteTx = (id: string) => setTxs(prev => prev.filter(t => t.id !== id));

  const totalIn = useMemo(() => txs.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0), [txs]);
  const totalOut = useMemo(() => txs.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0), [txs]);
  const balance = totalIn - totalOut;
  const totalOwed = useMemo(() => custs.reduce((s, c) => s + c.owed, 0), [custs]);

  const value = {
    region, R, lang, isAr, authed, tab, txs, custs,
    totalIn, totalOut, balance, totalOwed,
    login, logout, setRegion, setLang, setTab, addTx, deleteTx
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
