import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { LandingPage } from "./pages/Landing";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Dashboard } from "./pages/Dashboard";
import { Chat } from "./pages/Chat";
import { Analysis } from "./pages/Analysis";
import { Creative } from "./pages/Creative";
import { Crm } from "./pages/Crm";
import { Growth } from "./pages/Growth";
import { Integrations } from "./pages/Integrations";
import { Billing } from "./pages/Billing";
import { Settings } from "./pages/Settings";
import { AppLayout } from "./components/layout/AppLayout";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ component: Component, noPadding = false }: { component: any, noPadding?: boolean }) => {
  return (
    <AppLayout noPadding={noPadding}>
      <Component />
    </AppLayout>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/chat"><ProtectedRoute component={Chat} noPadding /></Route>
      <Route path="/analysis"><ProtectedRoute component={Analysis} /></Route>
      <Route path="/creative"><ProtectedRoute component={Creative} /></Route>
      <Route path="/crm"><ProtectedRoute component={Crm} /></Route>
      <Route path="/growth"><ProtectedRoute component={Growth} /></Route>
      <Route path="/integrations"><ProtectedRoute component={Integrations} /></Route>
      <Route path="/billing"><ProtectedRoute component={Billing} /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
