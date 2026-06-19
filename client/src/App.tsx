/**
 * App.tsx — Unified My Car Rent PWA
 * Hub page + 3 sub-apps: Daily Task, Pricing Calculator, Maintenance Dashboard
 * Lazy-loaded sub-apps for performance.
 */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingScreen from "./components/LoadingScreen";
import SubAppLayout from "./components/SubAppLayout";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { DataProvider, useData } from "./contexts/DataContext";
import BottomNav from "./components/BottomNav";
import { Moon, Sun } from "lucide-react";

// --- Eager: Hub + Daily Task (primary app) ---
import HubLanding from "./pages/hub/Index";
import DailyDashboard from "./pages/dailytask/Dashboard";
import AddEntry from "./pages/dailytask/AddEntry";
import History from "./pages/dailytask/History";
import Reports from "./pages/dailytask/Reports";
import Vehicles from "./pages/dailytask/Vehicles";
import Settings from "./pages/dailytask/Settings";
import NotFound from "./pages/NotFound";

// --- Lazy: Pricing Calculator ---
const PricingCalculator = lazy(() => import("./pages/pricing/Calculator"));

// --- Lazy: Maintenance Dashboard ---
const MaintenanceDashboard = lazy(() => import("./pages/maintenance/Dashboard"));
const AddVehicle = lazy(() => import("./pages/maintenance/AddVehicle"));
const EditVehicle = lazy(() => import("./pages/maintenance/EditVehicle"));

// ── Logo — local icon for offline support ──────────────────────────

// ── Lazy fallback ──────────────────────────────────────────────────
function LazyFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingScreen />
    </div>
  );
}

// ── Hub Router ─────────────────────────────────────────────────────
function HubRouter() {
  return <HubLanding />;
}

// ── Daily Task Sub-App Router (eager) ──────────────────────────────
function DailyTaskRouter() {
  return (
    <SubAppLayout title="บันทึกค่าใช้จ่าย" backTo="/">
      <Switch>
        <Route path="/daily" component={DailyDashboard} />
        <Route path="/daily/add" component={AddEntry} />
        <Route path="/daily/history" component={History} />
        <Route path="/daily/reports" component={Reports} />
        <Route path="/daily/vehicles" component={Vehicles} />
        <Route path="/daily/settings" component={Settings} />
      </Switch>
    </SubAppLayout>
  );
}

// ── Pricing Calculator Sub-App Router (lazy) ───────────────────────
function PricingRouter() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <SubAppLayout title="คำนวณราคาเช่า" backTo="/">
        <PricingCalculator />
      </SubAppLayout>
    </Suspense>
  );
}

// ── Maintenance Dashboard Sub-App Router (lazy) ────────────────────
function MaintenanceRouter() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <SubAppLayout title="เช็คระยะรถ" backTo="/">
        <Switch>
          <Route path="/maintenance" component={MaintenanceDashboard} />
          <Route
            path="/maintenance/vehicles/new"
            component={AddVehicle}
          />
          <Route
            path="/maintenance/vehicles/:id"
            component={EditVehicle}
          />
        </Switch>
      </SubAppLayout>
    </Suspense>
  );
}

// ── Header ─────────────────────────────────────────────────────────
function HeaderContent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header
      className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="max-w-lg lg:max-w-5xl xl:max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <img
          src="/icon-512.png"
          alt="My Car Rent"
          className="h-9 w-auto rounded-md cursor-pointer"
          onClick={() => (window.location.href = "/")}
        />
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>
    </header>
  );
}

// ── Root Router ────────────────────────────────────────────────────
// ponytail: flat routes avoid wouter nested-Switch issues
function Router() {
  return (
    <Switch>
      <Route path="/" component={HubRouter} />

      {/* Daily Task sub-app */}
      <Route path="/daily" component={DailyTaskRouter} />
      <Route path="/daily/add" component={DailyTaskRouter} />
      <Route path="/daily/history" component={DailyTaskRouter} />
      <Route path="/daily/reports" component={DailyTaskRouter} />
      <Route path="/daily/vehicles" component={DailyTaskRouter} />
      <Route path="/daily/settings" component={DailyTaskRouter} />

      {/* Pricing Calculator sub-app */}
      <Route path="/pricing" component={PricingRouter} />

      {/* Maintenance Dashboard sub-app */}
      <Route path="/maintenance" component={MaintenanceRouter} />
      <Route path="/maintenance/vehicles/new" component={MaintenanceRouter} />
      <Route path="/maintenance/vehicles/:id" component={MaintenanceRouter} />

      <Route component={NotFound} />
    </Switch>
  );
}

// ── App Content (needs DataContext) ────────────────────────────────
function AppContent() {
  const { loading } = useData();
  const [location] = useLocation();
  const isDailyRoute = location.startsWith("/daily");

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderContent />
      <main className="max-w-lg lg:max-w-5xl xl:max-w-7xl mx-auto px-4 pt-4 pb-28">
        <Router />
      </main>
      {isDailyRoute && <BottomNav />}
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TooltipProvider>
          <DataProvider>
            <AppContent />
            <Toaster
              position="top-center"
              toastOptions={{
                className:
                  "!rounded-xl !shadow-md !border !border-orange-100",
              }}
            />
          </DataProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
