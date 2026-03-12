import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import { DemoModeProvider } from "./context/DemoModeContext";
import { AppErrorBoundary } from "./components/common/ErrorBoundary";

// ── Original pages (wouter-free, work with react-router-dom) ─────────────
const LandingPage   = lazy(() => import("./pages/LandingPage"));
const LoginPage     = lazy(() => import("./pages/LoginPage"));
const RegisterPage  = lazy(() => import("./pages/RegisterPage"));
const DemoEntryPage = lazy(() => import("./pages/DemoEntryPage"));

// ── New *Page.tsx files (react-router-dom native) ────────────────────────
const DashboardPage    = lazy(() => import("./pages/DashboardPage"));
const ChatPage         = lazy(() => import("./pages/ChatPage"));
const AnalysisPage     = lazy(() => import("./pages/AnalysisPage"));
const CreativePage     = lazy(() => import("./pages/CreativePage"));
const CRMPage          = lazy(() => import("./pages/CRMPage"));
const GrowthPage       = lazy(() => import("./pages/GrowthPage"));
const BillingPage      = lazy(() => import("./pages/BillingPage"));
const IntegrationsPage = lazy(() => import("./pages/IntegrationsPage"));
const SettingsPage     = lazy(() => import("./pages/SettingsPage"));

// ── Legacy pages (fallback for routes not yet migrated) ──────────────────
const Dashboard    = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Chat         = lazy(() => import("./pages/Chat").then(m => ({ default: m.Chat })));
const Analysis     = lazy(() => import("./pages/Analysis").then(m => ({ default: m.Analysis })));
const Creative     = lazy(() => import("./pages/Creative").then(m => ({ default: m.Creative })));
const Crm          = lazy(() => import("./pages/Crm").then(m => ({ default: m.Crm })));
const Growth       = lazy(() => import("./pages/Growth").then(m => ({ default: m.Growth })));
const Integrations = lazy(() => import("./pages/Integrations").then(m => ({ default: m.Integrations })));
const Billing      = lazy(() => import("./pages/Billing").then(m => ({ default: m.Billing })));
const Settings     = lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const Seo          = lazy(() => import("./pages/Seo").then(m => ({ default: m.Seo })));
const Calendar     = lazy(() => import("./pages/Calendar").then(m => ({ default: m.Calendar })));
const Reports      = lazy(() => import("./pages/Reports").then(m => ({ default: m.Reports })));
const Campaigns    = lazy(() => import("./pages/Campaigns").then(m => ({ default: m.Campaigns })));
const NotFound     = lazy(() => import("./pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function PageLoader() {
  return (
    <div className="h-full flex items-center justify-center min-h-screen">
      <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
    </div>
  );
}

function ProtectedRoute({ component: Component, noPadding = false }: { component: React.ComponentType; noPadding?: boolean }) {
  return (
    <AppLayout noPadding={noPadding}>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </AppLayout>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/demo" element={<DemoEntryPage />} />

        {/* Legacy /dashboard etc → redirect to /app/dashboard */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/chat" element={<Navigate to="/app/chat" replace />} />

        {/* App shell — /app/* routes (new *Page.tsx components with demo mode) */}
        <Route path="/app/dashboard" element={<ProtectedRoute component={DashboardPage} />} />
        <Route path="/app/chat" element={<ProtectedRoute component={ChatPage} noPadding />} />
        <Route path="/app/analysis" element={<ProtectedRoute component={AnalysisPage} />} />
        <Route path="/app/creative" element={<ProtectedRoute component={CreativePage} noPadding />} />
        <Route path="/app/crm" element={<ProtectedRoute component={CRMPage} />} />
        <Route path="/app/growth" element={<ProtectedRoute component={GrowthPage} />} />
        <Route path="/app/billing" element={<ProtectedRoute component={BillingPage} />} />
        <Route path="/app/integrations" element={<ProtectedRoute component={IntegrationsPage} />} />
        <Route path="/app/settings" element={<ProtectedRoute component={SettingsPage} />} />

        {/* Legacy /app/* routes not yet migrated to new pages */}
        <Route path="/app/seo" element={<ProtectedRoute component={Seo} />} />
        <Route path="/app/calendar" element={<ProtectedRoute component={Calendar} />} />
        <Route path="/app/reports" element={<ProtectedRoute component={Reports} />} />
        <Route path="/app/campaigns" element={<ProtectedRoute component={Campaigns} />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <DemoModeProvider>
              <TooltipProvider>
                <AppRoutes />
                <Toaster />
              </TooltipProvider>
            </DemoModeProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
