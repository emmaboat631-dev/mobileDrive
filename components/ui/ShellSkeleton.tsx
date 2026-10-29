/**
 * Shared skeleton used by every admin / dealer / account loading.tsx.
 * Shows a sidebar silhouette plus a stack of card placeholders, matching
 * the real grid shells so there's no layout shift when content arrives.
 */
export function ShellSkeleton({
  rows = 4,
  withSidebar = true,
}: {
  rows?: number;
  withSidebar?: boolean;
}) {
  return (
    <section
      aria-busy="true"
      aria-label="Loading"
      className="container-page pb-20 pt-28"
    >
      <div
        className={
          'grid gap-6 ' + (withSidebar ? 'lg:grid-cols-[240px_1fr]' : '')
        }
      >
        {withSidebar && (
          <aside className="h-fit space-y-3 rounded-2xl border border-white/[0.06] bg-ink-800/40 p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />
              <div className="space-y-1.5">
                <div className="h-2.5 w-20 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-3 w-14 animate-pulse rounded-full bg-white/[0.06]" />
              </div>
            </div>
            <div className="h-px bg-white/[0.06]" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded-lg bg-white/[0.03]"
              />
            ))}
          </aside>
        )}

        <main className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="h-3 w-24 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-9 w-72 animate-pulse rounded-xl bg-white/[0.08]" />
            <div className="h-3 w-56 animate-pulse rounded-full bg-white/[0.05]" />
          </div>

          {/* KPI row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-ink-800/40"
              />
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className={
                'animate-pulse rounded-2xl border border-white/[0.06] bg-ink-800/40 ' +
                (i === 0 ? 'h-56' : 'h-32')
              }
            />
          ))}
        </main>
      </div>
    </section>
  );
}
