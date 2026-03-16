import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, useApp } from "@/hooks/use-app-state";
import { BottomNav } from "@/components/BottomNav";

// Pages
import { Login } from "@/pages/Login";
import { RegionSelect } from "@/pages/RegionSelect";
import { Home } from "@/pages/Home";
import { CashInOut } from "@/pages/CashInOut";
import { Invoices } from "@/pages/Invoices";
import { Settings } from "@/pages/Settings";

const queryClient = new QueryClient();

function Shell() {
  const { tab } = useApp();
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="h-full overflow-y-auto">
        {tab === 0 && <Home />}
        {tab === 1 && <CashInOut />}
        {tab === 2 && <Invoices />}
        {tab === 3 && <Settings />}
      </div>
      <BottomNav />
    </div>
  );
}

function MainRouter() {
  const { authed, region } = useApp();

  if (!authed) return <Login />;
  if (!region) return <RegionSelect />;
  return <Shell />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <MainRouter />
        </WouterRouter>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
