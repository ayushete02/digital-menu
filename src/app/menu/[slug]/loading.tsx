import { Skeleton } from "~/components/ui/skeleton";

export default function MenuLoading() {
  return (
    <div className="min-h-screen bg-[#f3eeef] pb-24">
      <div className="sticky top-0 z-20 border-b border-[#e3d9da] bg-white/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="space-y-4 rounded-3xl border border-[#eddfe1] bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="flex gap-3">
                  <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
