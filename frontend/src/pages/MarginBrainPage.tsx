import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { restaurantService } from '../services/api';
import type { RestaurantFinanceMarginResponse, RestaurantMarginItem } from '../types';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function MarginBrainPage() {
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RestaurantFinanceMarginResponse | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await restaurantService.getFinanceMargin(fromDate, toDate);
      setData(response);
    } catch {
      setError('Unable to load margin view. Ensure POS and recipe data have been uploaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const lowestMargin = useMemo(() => {
    if (!data?.items?.length) return null;
    return [...data.items].sort((a, b) => a.margin_pct - b.margin_pct)[0];
  }, [data]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Finance & Margin Brain</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Dish-Level Profit Intelligence</h2>
        <p className="mt-1 text-sm text-slate-500">
          Analyze true contribution margin by dish and channel, then prioritize pricing and menu actions.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <span className="text-sm text-slate-500">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
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
            <Card label="Revenue" value={`€${data.summary.revenue.toFixed(2)}`} note="Net sales in selected period" />
            <Card label="Gross Margin" value={`€${data.summary.gross_margin.toFixed(2)}`} note={`${data.summary.gross_margin_pct.toFixed(1)}% margin`} />
            <Card
              label="Break-even Progress"
              value={`${data.summary.break_even_progress_pct.toFixed(1)}%`}
              note={`Target €${data.summary.break_even_revenue.toFixed(2)}`}
            />
          </section>

          {lowestMargin && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Priority pricing watch</p>
              <p className="mt-1 text-sm text-amber-800">
                <strong>{lowestMargin.menu_item}</strong> is currently the weakest performer at{' '}
                <strong>{lowestMargin.margin_pct.toFixed(1)}%</strong> margin.
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Margin by dish</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Dish</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Revenue</th>
                    <th className="px-3 py-2 text-right">Estimated COGS</th>
                    <th className="px-3 py-2 text-right">Gross Margin</th>
                    <th className="px-3 py-2 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((item: RestaurantMarginItem) => (
                    <tr key={item.menu_item}>
                      <td className="px-3 py-2 font-medium text-slate-800">{item.menu_item}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-slate-700">€{item.revenue.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-slate-700">€{item.estimated_cogs.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-slate-700">€{item.gross_margin.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">{item.margin_pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
