/**
 * OnboardingWizard — 6-step brand setup wizard
 *
 * Step 1: Company basics
 * Step 2: Brand voice
 * Step 3: Target audience
 * Step 4: Competitors
 * Step 5: Goals
 * Step 6: Connected channels
 *
 * Saves to /api/v1/memory/brand-profile on completion.
 */

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Megaphone,
  Users,
  Trophy,
  Target,
  Plug,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  X,
  Plus,
  Globe,
} from 'lucide-react';
import api from '../../services/api';

// ── Zod schemas per step ──────────────────────────────────────

const step1Schema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']),
  website: z.string().url('Enter a valid URL (e.g. https://example.com)').optional().or(z.literal('')),
});

const step2Schema = z.object({
  tone: z.enum(['professional', 'casual', 'bold', 'playful', 'authoritative']),
  key_values: z.array(z.string()).min(1, 'Add at least one brand value'),
  brand_description: z.string().min(10, 'Please describe your brand voice in a bit more detail'),
});

const step3Schema = z.object({
  icp_description: z.string().min(20, 'Please describe your ideal customer in more detail'),
  age_range: z.string().optional(),
  location: z.string().optional(),
  job_titles: z.string().optional(),
  pain_points: z.string().optional(),
});

const step4Schema = z.object({
  competitors: z.array(
    z.object({ name: z.string().min(1), website: z.string().optional() }),
  ).max(5),
});

const step5Schema = z.object({
  primary_goal: z.enum(['brand_awareness', 'lead_generation', 'customer_retention', 'revenue_growth', 'product_launch']),
  monthly_budget: z.string().optional(),
  timeline: z.enum(['3_months', '6_months', '12_months', 'ongoing']),
});

const step6Schema = z.object({
  channels: z.array(z.string()),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;
type Step5Data = z.infer<typeof step5Schema>;
type Step6Data = z.infer<typeof step6Schema>;

interface WizardData {
  step1: Partial<Step1Data>;
  step2: Partial<Step2Data>;
  step3: Partial<Step3Data>;
  step4: Partial<Step4Data>;
  step5: Partial<Step5Data>;
  step6: Partial<Step6Data>;
}

// ── Constants ─────────────────────────────────────────────────

const INDUSTRIES = [
  'SaaS / Software', 'E-commerce', 'FinTech', 'HealthTech', 'EdTech',
  'Marketing Agency', 'Consulting', 'Media & Publishing', 'Real Estate',
  'Retail', 'Manufacturing', 'Other',
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', desc: 'Formal, authoritative, trust-building' },
  { value: 'casual', label: 'Casual', desc: 'Friendly, conversational, approachable' },
  { value: 'bold', label: 'Bold', desc: 'Disruptive, direct, no-fluff' },
  { value: 'playful', label: 'Playful', desc: 'Fun, witty, energetic' },
  { value: 'authoritative', label: 'Authoritative', desc: 'Expert, data-driven, credible' },
] as const;

const GOAL_OPTIONS = [
  { value: 'brand_awareness', label: 'Brand Awareness', icon: '📣' },
  { value: 'lead_generation', label: 'Lead Generation', icon: '🎯' },
  { value: 'customer_retention', label: 'Customer Retention', icon: '🔄' },
  { value: 'revenue_growth', label: 'Revenue Growth', icon: '📈' },
  { value: 'product_launch', label: 'Product Launch', icon: '🚀' },
] as const;

const CHANNEL_OPTIONS = [
  { id: 'hubspot', label: 'HubSpot CRM', icon: '🟠' },
  { id: 'sendgrid', label: 'SendGrid', icon: '✉️' },
  { id: 'mailchimp', label: 'Mailchimp', icon: '🐒' },
  { id: 'google_ads', label: 'Google Ads', icon: '🔍' },
  { id: 'meta_ads', label: 'Meta Ads', icon: '📘' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'slack', label: 'Slack', icon: '💬' },
  { id: 'salesforce', label: 'Salesforce', icon: '☁️' },
  { id: 'stripe', label: 'Stripe', icon: '💳' },
  { id: 'posthog', label: 'PostHog', icon: '🦔' },
];

const STEP_META = [
  { title: 'Company Basics', icon: Building2, description: "Let's start with the fundamentals" },
  { title: 'Brand Voice', icon: Megaphone, description: 'How do you want to sound?' },
  { title: 'Target Audience', icon: Users, description: 'Who are you talking to?' },
  { title: 'Competitors', icon: Trophy, description: "Know your competition" },
  { title: 'Goals', icon: Target, description: 'What do you want to achieve?' },
  { title: 'Integrations', icon: Plug, description: 'Connect your marketing stack' },
];

// ── Animation variants ────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// ── Sub-components ────────────────────────────────────────────

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            i < current ? 'bg-primary-600' : i === current ? 'bg-primary-400' : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

// ── Step components ───────────────────────────────────────────

function Step1({ onNext, data }: { onNext: (d: Step1Data) => void; data: Partial<Step1Data> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: data,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Name *</label>
        <input
          {...register('company_name')}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
          placeholder="Acme Corp"
        />
        <FieldError message={errors.company_name?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Industry *</label>
        <select
          {...register('industry')}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
        >
          <option value="">Select industry…</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
        <FieldError message={errors.industry?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Size *</label>
        <div className="grid grid-cols-5 gap-2">
          {(['1-10', '11-50', '51-200', '201-1000', '1000+'] as const).map((size) => (
            <label key={size} className="cursor-pointer">
              <input {...register('company_size')} type="radio" value={size} className="sr-only peer" />
              <div className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-center text-xs text-slate-400 peer-checked:border-primary-600 peer-checked:bg-primary-600/10 peer-checked:text-primary-500 hover:border-slate-600 transition-all">
                {size}
              </div>
            </label>
          ))}
        </div>
        <FieldError message={errors.company_size?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Website <span className="text-slate-600">(optional)</span>
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            {...register('website')}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
            placeholder="https://yourcompany.com"
          />
        </div>
        <FieldError message={errors.website?.message} />
      </div>

      <button type="submit" className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
        Continue <ChevronRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function Step2({ onNext, onBack, data }: { onNext: (d: Step2Data) => void; onBack: () => void; data: Partial<Step2Data> }) {
  const [values, setValues] = useState<string[]>(data.key_values ?? []);
  const [valueInput, setValueInput] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { ...data, key_values: data.key_values ?? [] },
  });

  const addValue = () => {
    const trimmed = valueInput.trim();
    if (!trimmed || values.length >= 6) return;
    const updated = [...values, trimmed];
    setValues(updated);
    setValue('key_values', updated);
    setValueInput('');
  };

  const removeValue = (idx: number) => {
    const updated = values.filter((_, i) => i !== idx);
    setValues(updated);
    setValue('key_values', updated);
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Brand Tone *</label>
        <div className="space-y-2">
          {TONE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-700 bg-slate-800 p-3 hover:border-slate-600 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-600/10 transition-all">
              <input {...register('tone')} type="radio" value={opt.value} className="mt-0.5 accent-primary-600" />
              <div>
                <p className="text-sm font-medium text-white">{opt.label}</p>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
        <FieldError message={errors.tone?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Key Brand Values *</label>
        <div className="flex gap-2">
          <input
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addValue(); } }}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none"
            placeholder="Innovation, Trust, Transparency…"
            maxLength={30}
          />
          <button type="button" onClick={addValue} className="rounded-lg border border-slate-700 px-3 py-2 text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v, i) => (
            <span key={i} className="flex items-center gap-1 rounded-full border border-primary-600/40 bg-primary-600/10 px-3 py-0.5 text-xs text-primary-400">
              {v}
              <button type="button" onClick={() => removeValue(i)}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <FieldError message={errors.key_values?.message as string | undefined} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Describe your brand voice *</label>
        <textarea
          {...register('brand_description')}
          rows={3}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none resize-none"
          placeholder="We speak like a trusted advisor — clear, direct, and always jargon-free…"
        />
        <FieldError message={errors.brand_description?.message} />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button type="submit" className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
          Continue <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function Step3({ onNext, onBack, data }: { onNext: (d: Step3Data) => void; onBack: () => void; data: Partial<Step3Data> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: data,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Ideal Customer Profile *</label>
        <textarea
          {...register('icp_description')}
          rows={4}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none resize-none"
          placeholder="Series A–B SaaS founders and VPs of Marketing at companies with 20–200 employees who are looking to…"
        />
        <FieldError message={errors.icp_description?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Age Range</label>
          <input
            {...register('age_range')}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none"
            placeholder="25–45"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Location</label>
          <input
            {...register('location')}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none"
            placeholder="US, EU, Global…"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Titles / Roles</label>
        <input
          {...register('job_titles')}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none"
          placeholder="VP Marketing, Growth Lead, CMO, Founder…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Key Pain Points</label>
        <textarea
          {...register('pain_points')}
          rows={2}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none resize-none"
          placeholder="Scaling content without growing headcount, proving marketing ROI…"
        />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button type="submit" className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
          Continue <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function Step4({ onNext, onBack, data }: { onNext: (d: Step4Data) => void; onBack: () => void; data: Partial<Step4Data> }) {
  const [competitors, setCompetitors] = useState<{ name: string; website: string }[]>(
    data.competitors?.map((c) => ({ name: c.name, website: c.website ?? '' })) ?? [{ name: '', website: '' }],
  );
  const [fetchingIdx, setFetchingIdx] = useState<number | null>(null);

  const updateCompetitor = (idx: number, field: 'name' | 'website', value: string) => {
    setCompetitors((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const addCompetitor = () => {
    if (competitors.length >= 5) return;
    setCompetitors((prev) => [...prev, { name: '', website: '' }]);
  };

  const removeCompetitor = (idx: number) => {
    setCompetitors((prev) => prev.filter((_, i) => i !== idx));
  };

  // Auto-populate website if blank (best-effort)
  const autoFetch = async (idx: number) => {
    const name = competitors[idx]?.name?.trim();
    if (!name || competitors[idx].website) return;
    setFetchingIdx(idx);
    try {
      // Naive guess — in production this would call a search API
      const guessed = `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`;
      updateCompetitor(idx, 'website', guessed);
    } finally {
      setFetchingIdx(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = competitors.filter((c) => c.name.trim());
    onNext({ competitors: valid });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate-500">Add up to 5 competitors. Your AI CMO will benchmark against them.</p>

      {competitors.map((comp, idx) => (
        <div key={idx} className="flex gap-2">
          <div className="flex-1 space-y-2">
            <input
              value={comp.name}
              onChange={(e) => updateCompetitor(idx, 'name', e.target.value)}
              onBlur={() => void autoFetch(idx)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none"
              placeholder={`Competitor ${idx + 1} name`}
            />
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                value={comp.website}
                onChange={(e) => updateCompetitor(idx, 'website', e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none"
                placeholder="https://…"
              />
              {fetchingIdx === idx && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 animate-spin" />
              )}
            </div>
          </div>
          {competitors.length > 1 && (
            <button type="button" onClick={() => removeCompetitor(idx)} className="self-start mt-2 p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}

      {competitors.length < 5 && (
        <button
          type="button"
          onClick={addCompetitor}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add another competitor
        </button>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button type="submit" className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
          Continue <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function Step5({ onNext, onBack, data }: { onNext: (d: Step5Data) => void; onBack: () => void; data: Partial<Step5Data> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: data,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Primary Goal *</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GOAL_OPTIONS.map((goal) => (
            <label key={goal.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-3 hover:border-slate-600 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-600/10 transition-all">
              <input {...register('primary_goal')} type="radio" value={goal.value} className="accent-primary-600" />
              <span className="text-lg">{goal.icon}</span>
              <span className="text-sm font-medium text-white">{goal.label}</span>
            </label>
          ))}
        </div>
        <FieldError message={errors.primary_goal?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Monthly Marketing Budget</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
          <input
            {...register('monthly_budget')}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-7 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary-600 focus:outline-none"
            placeholder="5,000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Planning Horizon *</label>
        <div className="grid grid-cols-4 gap-2">
          {([
            { value: '3_months', label: '3 mo' },
            { value: '6_months', label: '6 mo' },
            { value: '12_months', label: '12 mo' },
            { value: 'ongoing', label: 'Ongoing' },
          ] as const).map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input {...register('timeline')} type="radio" value={opt.value} className="sr-only peer" />
              <div className="rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-center text-xs text-slate-400 peer-checked:border-primary-600 peer-checked:bg-primary-600/10 peer-checked:text-primary-500 hover:border-slate-600 transition-all">
                {opt.label}
              </div>
            </label>
          ))}
        </div>
        <FieldError message={errors.timeline?.message} />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button type="submit" className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
          Continue <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function Step6({ onNext, onBack, data, saving }: { onNext: (d: Step6Data) => void; onBack: () => void; data: Partial<Step6Data>; saving: boolean }) {
  const [selected, setSelected] = useState<string[]>(data.channels ?? []);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ channels: selected });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-xs text-slate-500">Select which platforms you use. You can configure credentials later in Settings.</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CHANNEL_OPTIONS.map((ch) => {
          const active = selected.includes(ch.id);
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => toggle(ch.id)}
              className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all ${
                active
                  ? 'border-primary-600 bg-primary-600/10 text-primary-400'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="text-base">{ch.icon}</span>
              <span className="font-medium text-xs">{ch.label}</span>
              {active && <CheckCircle2 className="ml-auto h-3.5 w-3.5 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={saving} className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="h-4 w-4" /> Complete Setup</>}
        </button>
      </div>
    </form>
  );
}

// ── Main Wizard ───────────────────────────────────────────────

interface OnboardingWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wizardData, setWizardData] = useState<WizardData>({
    step1: {}, step2: {}, step3: {}, step4: {}, step5: {}, step6: {},
  });

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEP_META.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const updateData = useCallback(<K extends keyof WizardData>(key: K, data: WizardData[K]) => {
    setWizardData((prev) => ({ ...prev, [key]: data }));
  }, []);

  const handleStep1 = useCallback((d: Step1Data) => { updateData('step1', d); goNext(); }, [updateData, goNext]);
  const handleStep2 = useCallback((d: Step2Data) => { updateData('step2', d); goNext(); }, [updateData, goNext]);
  const handleStep3 = useCallback((d: Step3Data) => { updateData('step3', d); goNext(); }, [updateData, goNext]);
  const handleStep4 = useCallback((d: Step4Data) => { updateData('step4', d); goNext(); }, [updateData, goNext]);
  const handleStep5 = useCallback((d: Step5Data) => { updateData('step5', d); goNext(); }, [updateData, goNext]);

  const handleStep6 = useCallback(async (d: Step6Data) => {
    updateData('step6', d);
    setSaving(true);
    setError(null);

    const payload = {
      company: wizardData.step1,
      brand_voice: wizardData.step2,
      target_audience: wizardData.step3,
      competitors: wizardData.step4.competitors ?? [],
      goals: wizardData.step5,
      channels: d.channels,
      created_at: new Date().toISOString(),
    };

    try {
      await api.post('/v1/memory/brand-profile', payload);
      onComplete?.();
    } catch (err: unknown) {
      // Don't block onboarding if API is unavailable
      console.warn('Failed to save brand profile:', err);
      // Still complete locally
      localStorage.setItem('dcmo_brand_profile', JSON.stringify(payload));
      onComplete?.();
    } finally {
      setSaving(false);
    }
  }, [wizardData, updateData, onComplete]);

  const { title, icon: StepIcon, description } = STEP_META[step];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-600/20 bg-primary-600/10 px-3 py-1 text-xs text-primary-500 mb-4">
            Step {step + 1} of {STEP_META.length}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          <p className="text-sm text-slate-400">{description}</p>
        </div>

        <StepProgress current={step} total={STEP_META.length} />

        {/* Step icon strip */}
        <div className="flex justify-center gap-6 mb-8">
          {STEP_META.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  i === step
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : i < step
                    ? 'bg-slate-700 text-emerald-400'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              {step === 0 && <Step1 onNext={handleStep1} data={wizardData.step1} />}
              {step === 1 && <Step2 onNext={handleStep2} onBack={goBack} data={wizardData.step2} />}
              {step === 2 && <Step3 onNext={handleStep3} onBack={goBack} data={wizardData.step3} />}
              {step === 3 && <Step4 onNext={handleStep4} onBack={goBack} data={wizardData.step4} />}
              {step === 4 && <Step5 onNext={handleStep5} onBack={goBack} data={wizardData.step5} />}
              {step === 5 && <Step6 onNext={handleStep6} onBack={goBack} data={wizardData.step6} saving={saving} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Skip */}
        {onSkip && step === 0 && (
          <div className="mt-4 text-center">
            <button onClick={onSkip} className="text-xs text-slate-600 hover:text-slate-400 underline transition-colors">
              Skip setup — I'll do this later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingWizard;
