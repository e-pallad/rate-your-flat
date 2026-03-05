export default function RootLoading() {
  return (
    <div className="container py-8">
      <div className="h-9 w-40 mb-4 rounded-md bg-muted animate-pulse" />
      <div className="h-10 w-full max-w-md mb-8 rounded-md bg-muted animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-3">
            <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-8 w-1/3 mt-4 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
