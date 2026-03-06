import { Check, CreditCard, Download, Receipt } from 'lucide-react';

const invoices = [
  { id: 'INV-2026-001', date: '2026-03-01', amount: '$99.00', status: 'Paid' },
  { id: 'INV-2026-002', date: '2026-02-01', amount: '$99.00', status: 'Paid' },
  { id: 'INV-2026-003', date: '2026-01-01', amount: '$99.00', status: 'Paid' },
];

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Billing</h2>
        <p className="text-sm text-slate-600">Manage plan, payment method, and invoice history.</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Current Plan</p>
              <h3 className="text-xl font-semibold text-slate-900">Pro Growth</h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Active
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {['50K tokens / month', 'Unlimited dashboards', 'Priority support'].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Upgrade Plan
            </button>
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Pause Subscription
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-600" />
            <h3 className="text-sm font-semibold text-slate-800">Payment Method</h3>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-800">Visa •••• 4242</p>
            <p className="text-xs text-slate-500">Expires 11/2028</p>
          </div>
          <button className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Update Card
          </button>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-slate-700" />
          <h3 className="text-sm font-semibold text-slate-800">Invoice History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 font-medium">Invoice</th>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Amount</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 font-medium text-slate-800">{invoice.id}</td>
                  <td className="py-3 text-slate-600">{invoice.date}</td>
                  <td className="py-3 text-slate-600">{invoice.amount}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900">
                      <Download className="h-4 w-4" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
