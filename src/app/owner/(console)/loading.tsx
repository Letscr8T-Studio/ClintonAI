import { card } from "@/components/owner/styles";

export default function ConsoleLoading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse space-y-4 motion-reduce:animate-none">
      <span className="sr-only">Loading…</span>
      <div className="h-10 w-48 rounded-xl bg-line" />
      <div className="h-48 rounded-3xl bg-brand-tint" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${card} h-28`} />
        ))}
      </div>
    </div>
  );
}
