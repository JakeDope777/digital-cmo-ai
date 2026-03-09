import { Sparkles } from 'lucide-react';

export default function DemoDataBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 ${className}`.trim()}
    >
      <Sparkles className="h-3 w-3" />
      Demo data
    </span>
  );
}
