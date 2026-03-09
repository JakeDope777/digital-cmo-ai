import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarDays, Loader2, UploadCloud } from 'lucide-react';
import { restaurantService } from '../services/api';
import type {
  RestaurantControlTowerResponse,
  RestaurantIngestResponse,
  RestaurantRecommendationsResponse,
} from '../types';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function ControlTowerPage() {
  const [date, setDate] = useState(todayIso());
  const [controlTower, setControlTower] = useState<RestaurantControlTowerResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RestaurantRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const [posFile, setPosFile] = useState<File | null>(null);
  const [purchaseFile, setPurchaseFile] = useState<File | null>(null);
  const [laborFile, setLaborFile] = useState<File | null>(null);

  const loadDaily = async () => {
    setLoading(true);
    try {
      const [ct, recs] = await Promise.all([
        restaurantService.getControlTowerDaily(date),
        restaurantService.getDailyRecommendations(date),
      ]);
      setControlTower(ct);
      setRecommendations(recs);
      setStatus('Daily metrics refreshed.');
    } catch {
      setStatus('Unable to load daily metrics. Upload data first or check backend status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDaily();
  }, []);

  const uploadHandler = async (
    kind: 'pos' | 'purchases' | 'labor',
    file: File | null,
  ) => {
    if (!file) return;
    setUploading(kind);
    try {
      let response: RestaurantIngestResponse;
      if (kind === 'pos') {
        response = await restaurantService.ingestPosCsv(file);
      } else if (kind === 'purchases') {
        response = await restaurantService.ingestPurchasesCsv(file);
      } else {
        response = await restaurantService.ingestLaborCsv(file);
      }
      setStatus(`${kind.toUpperCase()} upload complete: ${response.rows_ingested ?? 0} rows ingested.`);
      await loadDaily();
    } catch {
      setStatus(`Upload failed for ${kind}. Check CSV format and retry.`);
    } finally {
      setUploading(null);
    }
  };

  const kpis = controlTower?.kpis;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Daily Control Tower</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">TablePilot Operator View</h2>
            <p className="text-sm text-slate-500">Revenue, labor, food cost, anomalies, and next actions.</p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button onClick={() => void loadDaily()} className="btn-primary px-4 py-2 text-sm" disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            key: 'pos',
            title: 'Upload POS CSV',
            hint: 'Columns: date, menu_item, quantity, net_sales, covers, channel, forecast_revenue',
            setter: setPosFile,
            file: posFile,
          },
          {
            key: 'purchases',
            title: 'Upload Purchases CSV',
            hint: 'Columns: date, item_name, quantity, unit_cost (+ optional stock columns)',
            setter: setPurchaseFile,
            file: purchaseFile,
          },
          {
            key: 'labor',
            title: 'Upload Labor CSV',
            hint: 'Columns: date, staff_name, role, hours_worked, hourly_rate',
            setter: setLaborFile,
            file: laborFile,
          },
        ].map((card) => (
          <article key={card.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
            <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-700 hover:border-slate-400">
              <UploadCloud className="h-4 w-4" />
              <span>{card.file ? card.file.name : 'Choose CSV file'}</span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => card.setter(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              onClick={() => void uploadHandler(card.key as 'pos' | 'purchases' | 'labor', card.file)}
              disabled={!card.file || uploading === card.key}
              className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {uploading === card.key ? 'Uploading...' : 'Upload'}
            </button>
          </article>
        ))}
      </section>

      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
        </div>
      )}

      {kpis && !loading && (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <KpiCard label="Revenue" value={`€${kpis.revenue.toFixed(2)}`} note={`${kpis.revenue_vs_forecast_pct.toFixed(1)}% vs forecast`} />
          <KpiCard label="Covers" value={`${kpis.covers}`} note={`Avg check €${kpis.avg_check.toFixed(2)}`} />
          <KpiCard label="Labor %" value={`${kpis.labor_cost_pct.toFixed(1)}%`} note={`€${kpis.labor_cost.toFixed(2)} labor`} />
          <KpiCard label="Food Cost %" value={`${kpis.food_cost_pct.toFixed(1)}%`} note={`€${kpis.food_cost.toFixed(2)} food cost`} />
          <KpiCard label="Review Sentiment" value={kpis.review_sentiment.toFixed(2)} note="-1 to +1" />
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Anomalies</h3>
          <div className="mt-3 space-y-2">
            {(controlTower?.anomalies ?? []).length === 0 && (
              <p className="text-sm text-slate-600">No anomalies detected for this date.</p>
            )}
            {(controlTower?.anomalies ?? []).map((a, idx) => (
              <div key={`${a.title}-${idx}`} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-amber-900">{a.title}</p>
                <p className="mt-1 text-xs text-amber-800">{a.why}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">AI Recommendations</h3>
          <div className="mt-3 space-y-3">
            {(recommendations?.recommendations ?? []).length === 0 && (
              <p className="text-sm text-slate-600">No recommendations yet. Upload operational data first.</p>
            )}
            {(recommendations?.recommendations ?? []).map((rec, idx) => (
              <div key={`${rec.title}-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{rec.title}</p>
                    <p className="mt-1 text-xs text-slate-700"><strong>Warning:</strong> {rec.warning}</p>
                    <p className="mt-1 text-xs text-slate-700"><strong>Why:</strong> {rec.why}</p>
                    <p className="mt-1 text-xs text-slate-700"><strong>Next action:</strong> {rec.next_action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function KpiCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{note}</p>
    </article>
  );
}
