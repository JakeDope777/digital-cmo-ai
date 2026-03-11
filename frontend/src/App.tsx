import { Suspense, lazy } from "react";
  import { Switch, Route, Router as WouterRouter } from "wouter";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { Toaster } from "@/components/ui/toaster";
  import { TooltipProvider } from "@/components/ui/tooltip";
  import { Loader2 } from "lucide-react";
  import { AppLayout } from "./components/layout/AppLayout";

  // Main app pages (redesigned)
  const LandingPage    = lazy(() => import("./pages/Landing").then(m => ({ default: m.LandingPage })));
  const Login          = lazy(() => import("./pages/auth/Login").then(m => ({ default: m.Login })));
  const Register       = lazy(() => import("./pages/auth/Register").then(m => ({ default: m.Register })));
  const Dashboard      = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
  const Chat           = lazy(() => import("./pages/Chat").then(m => ({ default: m.Chat })));
  const Analysis       = lazy(() => import("./pages/Analysis").then(m => ({ default: m.Analysis })));
  const Creative       = lazy(() => import("./pages/Creative").then(m => ({ default: m.Creative })));
  const Crm            = lazy(() => import("./pages/Crm").then(m => ({ default: m.Crm })));
  const Growth         = lazy(() => import("./pages/Growth").then(m => ({ default: m.Growth })));
  const Integrations   = lazy(() => import("./pages/Integrations").then(m => ({ default: m.Integrations })));
  const Billing        = lazy(() => import("./pages/Billing").then(m => ({ default: m.Billing })));
  const Settings       = lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
  const NotFound       = lazy(() => import("./pages/not-found"));

  // Auth & utility pages (restored)
  const ForgotPassword  = lazy(() => import("./pages/ForgotPasswordPage"));
  const ResetPassword   = lazy(() => import("./pages/ResetPasswordPage"));
  const VerifyEmail     = lazy(() => import("./pages/VerifyEmailPage"));
  const Demo            = lazy(() => import("./pages/DemoEntryPage"));
  const Profile         = lazy(() => import("./pages/ProfilePage"));

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
      <div className="h-full flex items-center justify-center">
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

  function Router() {
    return (
      <Suspense fallback={<PageLoader />}>
        <Switch>
          {/* Public */}
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot-password"><Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense></Route>
          <Route path="/reset-password"><Suspense fallback={<PageLoader />}><ResetPassword /></Suspense></Route>
          <Route path="/verify-email"><Suspense fallback={<PageLoader />}><VerifyEmail /></Suspense></Route>
          <Route path="/demo"><Suspense fallback={<PageLoader />}><Demo /></Suspense></Route>

          {/* Protected app */}
          <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
          <Route path="/chat"><ProtectedRoute component={Chat} noPadding /></Route>
          <Route path="/analysis"><ProtectedRoute component={Analysis} /></Route>
          <Route path="/creative"><ProtectedRoute component={Creative} noPadding /></Route>
          <Route path="/crm"><ProtectedRoute component={Crm} /></Route>
          <Route path="/growth"><ProtectedRoute component={Growth} /></Route>
          <Route path="/integrations"><ProtectedRoute component={Integrations} /></Route>
          <Route path="/billing"><ProtectedRoute component={Billing} /></Route>
          <Route path="/settings"><ProtectedRoute component={Settings} /></Route>
          <Route path="/profile"><ProtectedRoute component={Profile} /></Route>

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  export default function App() {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }
  