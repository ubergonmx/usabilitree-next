import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl bg-gray-100">
      {/* Fixed header */}
      <div className="fixed left-0 right-0 top-0 z-10 bg-white pt-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="ml-2 space-y-2 sm:ml-0">
            <Skeleton className="h-7 w-48" /> {/* Task X of Y */}
            <Skeleton className="h-5 w-96" /> {/* Task description */}
          </div>
        </div>
        <div className="mt-4 h-1 bg-theme"></div>
      </div>

      {/* Content area */}
      <div className="mt-32 p-4">
        {/* Start button area */}
        <div className="mb-8 flex justify-center">
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Navigation tree items */}
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`${i > 0 ? "ml-4" : ""}`}>
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
