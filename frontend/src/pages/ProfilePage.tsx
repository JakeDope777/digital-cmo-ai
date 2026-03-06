import { useMemo, useState } from 'react';
import { ShieldCheck, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('Marketing Lead');
  const [company, setCompany] = useState('Acme Growth Labs');
  const [timezone, setTimezone] = useState('Europe/Madrid');
  const [saved, setSaved] = useState(false);

  const initials = useMemo(() => {
    if (!user?.email) return 'U';
    return user.email.slice(0, 2).toUpperCase();
  }, [user?.email]);

  const saveProfile = async () => {
    setSaved(true);
    await refreshUser();
    setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profile</h2>
        <p className="text-sm text-slate-600">Manage personal details and workspace preferences.</p>
      </div>

      <section className="grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">
            {initials}
          </div>
          <h3 className="mt-4 text-center text-lg font-semibold text-slate-900">{name}</h3>
          <p className="text-center text-sm text-slate-600">{user?.email ?? 'user@email.com'}</p>
          <p className="mt-1 text-center text-xs uppercase tracking-[0.2em] text-slate-400">{user?.role ?? 'user'}</p>
          <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            <span className="inline-flex items-center gap-1 font-medium">
              <ShieldCheck className="h-4 w-4" />
              Workspace security active
            </span>
          </div>
        </aside>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-orange-600" />
            <h3 className="text-sm font-semibold text-slate-800">Account Details</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Company</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Timezone</label>
              <input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input value={user?.email ?? ''} disabled className="input-field bg-slate-100 text-slate-500" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={saveProfile}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              {saved ? 'Saved' : 'Save Profile'}
            </button>
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Reset
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
