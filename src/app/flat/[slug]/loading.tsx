export default function FlatLoading() {
  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border p-6 space-y-3">
            <div className="h-7 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted animate-pulse mt-4" />
            <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-6 w-32 rounded bg-muted animate-pulse mt-8" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-4 w-12 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="h-12 w-20 mx-auto rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
