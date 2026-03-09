import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { restaurantService } from '../services/api';
import type { RestaurantInventoryAlertsResponse } from '../types';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function InventoryWastePage() {
  const [date, setDate] = useState(todayIso());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RestaurantInventoryAlertsResponse | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await restaurantService.getInventoryAlerts(date);
      setData(response);
    } catch {
      setError('Unable to load inventory alerts. Upload purchases/stock data first.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Inventory & Waste Control</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Stock Risk and Waste Alerts</h2>
        <p className="mt-1 text-sm text-slate-500">
          Detect low-stock risk, usage variance, and supplier price shifts before they hurt service or margin.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button onClick={() => void load()} disabled={loading} className="btn-primary px-4 py-2 text-sm">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </section>

      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
        </div>
      )}

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</section>
      )}

      {data && !loading && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <Card label="Active Alerts" value={`${data.summary.alert_count}`} note="High + medium severity" />
            <Card label="Estimated Waste Qty" value={`${data.summary.estimated_waste_qty.toFixed(2)}`} note="Units" />
            <Card label="Estimated Waste Cost" value={`€${data.summary.estimated_waste_cost.toFixed(2)}`} note="Cost impact" />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Alert Feed</h3>
            <div className="mt-3 space-y-3">
              {data.alerts.length === 0 && (
                <p className="text-sm text-slate-600">No inventory or waste alerts for this date.</p>
              )}
              {data.alerts.map((alert, idx) => (
                <article
                  key={`${alert.title}-${idx}`}
                  className={`rounded-lg border p-3 ${
                    alert.severity === 'high'
                      ? 'border-red-200 bg-red-50'
                      : 'border-amber-200 bg-amber-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className={`mt-0.5 h-4 w-4 ${
                        alert.severity === 'high' ? 'text-red-700' : 'text-amber-700'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                      <p className="mt-1 text-xs text-slate-700"><strong>Why:</strong> {alert.why}</p>
                      <p className="mt-1 text-xs text-slate-700"><strong>Next action:</strong> {alert.next_action}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Card({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{note}</p>
    </article>
  );
}
