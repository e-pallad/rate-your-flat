export default function AuthLoading() {
  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center py-8">
      <div className="w-full max-w-md rounded-lg border p-8 space-y-4">
        <div className="h-7 w-1/2 rounded bg-muted animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
        <div className="space-y-3 mt-4">
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-full rounded bg-muted animate-pulse mt-2" />
      </div>
    </div>
  );
}
