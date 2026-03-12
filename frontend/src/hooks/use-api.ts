import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as demo from "@/lib/demo-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth as useAuthContext } from "@/context/AuthContext";

// ============================================================================
// FALLBACK WRAPPER
// Because the external Render API has cold starts, we implement a strict 3s 
// timeout that seamlessly returns rich demo data if the API isn't ready.
// ============================================================================

async function fetchWithFallback<T>(
  apiCall: (signal: AbortSignal) => Promise<T>,
  fallbackData: T
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  
  try {
    const res = await apiCall(controller.signal);
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("[API Fallback] Request failed or timed out. Returning demo data.");
    return fallbackData;
  }
}

// ----------------------------------------------------------------------------
// AUTH — delegates to AuthContext (single source of truth)
// ----------------------------------------------------------------------------
/** @deprecated Use useAuth from @/context/AuthContext directly */
export { useAuthContext as useAuth };

export function useLogin() {
  const { login } = useAuthContext();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      await login(data.email, data.password);
    },
  });
}

// ----------------------------------------------------------------------------
// DASHBOARD & ANALYTICS
// ----------------------------------------------------------------------------
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["/api/analytics/dashboard"],
    queryFn: () => fetchWithFallback(
      async (signal) => {
        const res = await fetch("https://digital-cmo-api.onrender.com/analytics/dashboard", { signal });
        if (!res.ok) throw new Error();
        return res.json();
      },
      demo.DEMO_DASHBOARD
    )
  });
}

export function useGrowthData() {
  return useQuery({
    queryKey: ["/api/analytics/growth"],
    queryFn: () => fetchWithFallback(
      async (signal) => {
        const res = await fetch("https://digital-cmo-api.onrender.com/analytics/growth", { signal });
        if (!res.ok) throw new Error();
        return res.json();
      },
      demo.DEMO_GROWTH
    )
  });
}

// ----------------------------------------------------------------------------
// CHAT & BRAIN
// ----------------------------------------------------------------------------
export function useChatHistory() {
  return useQuery({
    queryKey: ["/api/brain/history"],
    queryFn: () => fetchWithFallback(
      async () => { throw new Error("Force demo data for chat history"); },
      demo.DEMO_CHAT_HISTORY
    )
  });
}

export function useSendChatMessage() {
  return useMutation({
    mutationFn: async (message: string) => {
      await new Promise(r => setTimeout(r, 1500));
      return {
        id: Math.random().toString(),
        response: `I've analyzed your request regarding "${message}". Based on our current metrics, I recommend deploying a targeted campaign across LinkedIn and email. Would you like me to draft the variants?`,
        tokensUsed: 150
      };
    }
  });
}

// ----------------------------------------------------------------------------
// CRM
// ----------------------------------------------------------------------------
export function useLeads() {
  return useQuery({
    queryKey: ["/api/crm/leads"],
    queryFn: () => fetchWithFallback(
      async () => { throw new Error("Force demo leads"); },
      demo.DEMO_LEADS
    )
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (lead: any) => {
      await new Promise(r => setTimeout(r, 800));
      return { id: Math.random().toString(), ...lead, stage: 'new', lastContact: new Date().toISOString() };
    },
    onSuccess: (newLead) => {
      queryClient.setQueryData(["/api/crm/leads"], (old: any) => [newLead, ...(old || [])]);
      toast({ title: "Lead created successfully" });
    }
  });
}

// ----------------------------------------------------------------------------
// ANALYSIS
// ----------------------------------------------------------------------------
export function useMarketAnalysis() {
  return useQuery({
    queryKey: ["/api/analysis/market"],
    queryFn: () => fetchWithFallback(
      async () => { throw new Error("Force demo analysis"); },
      demo.DEMO_MARKET_ANALYSIS
    )
  });
}

export function useCompetitors() {
  return useQuery({
    queryKey: ["/api/analysis/competitors"],
    queryFn: () => fetchWithFallback(
      async () => { throw new Error("Force demo competitors"); },
      demo.DEMO_COMPETITORS
    )
  });
}

// ----------------------------------------------------------------------------
// CREATIVE
// ----------------------------------------------------------------------------
export function useGenerateCreative() {
  return useMutation({
    mutationFn: async (data: any) => {
      await new Promise(r => setTimeout(r, 2500));
      return {
        variants: [
          { id: "1", headline: "Scale Your SaaS Revenue on Autopilot", body: "Stop wasting time on manual campaign management. Let our AI handle the heavy lifting while you focus on high-level strategy.", cta: "Start Free Trial", wordCount: 28, score: 95 },
          { id: "2", headline: "The Only Marketing Hire You Need", body: "Why hire an agency when you can have an AI CMO working 24/7? Optimize your CAC and scale your pipeline instantly.", cta: "See How It Works", wordCount: 31, score: 92 },
          { id: "3", headline: "Unlock Hidden Pipeline ROI", body: "Our proprietary AI analyzes millions of data points to find your most profitable channels automatically.", cta: "Get Your Custom Report", wordCount: 24, score: 88 }
        ]
      };
    }
  });
}

// ----------------------------------------------------------------------------
// INTEGRATIONS
// ----------------------------------------------------------------------------
export function useIntegrations() {
  return useQuery({
    queryKey: ["/api/integrations"],
    queryFn: () => fetchWithFallback(
      async () => { throw new Error("Force demo integrations"); },
      demo.DEMO_INTEGRATIONS
    )
  });
}

export function useConnectIntegration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(r => setTimeout(r, 1500));
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(["/api/integrations"], (old: any[]) => 
        old?.map(int => int.id === id ? { ...int, status: 'connected', lastSync: new Date().toISOString() } : int)
      );
      toast({ title: "Integration connected successfully" });
    }
  });
}
