export default function GlobalLoading() {
  return (
    <section className="container-page pt-32">
      {/* Hero skeleton */}
      <div className="animate-pulse space-y-6">
        <div className="mx-auto h-6 w-40 rounded-full bg-white/[0.06]" />
        <div className="mx-auto h-14 w-3/4 max-w-2xl rounded-xl bg-white/[0.08]" />
        <div className="mx-auto h-4 w-2/4 max-w-md rounded-lg bg-white/[0.05]" />
        <div className="mx-auto mt-12 h-80 w-full max-w-5xl rounded-3xl bg-white/[0.03]" />
      </div>
    </section>
  );
}
