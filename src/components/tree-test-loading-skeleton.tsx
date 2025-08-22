import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen w-full bg-gray-100">
      {/* Sticky header */}
      <div className="sticky left-0 right-0 top-0 z-10 w-full bg-white pt-4 shadow-sm">
        <div className="mx-auto w-full max-w-3xl items-start justify-between px-4 sm:px-6 md:flex">
          <div className="space-y-2 pr-2">
            <Skeleton className="h-7 w-48" /> {/* Task X of Y */}
            <div className="max-h-[30vh] overflow-y-auto pr-2">
              <Skeleton className="h-5 w-full max-w-md" /> {/* Task description */}
              <Skeleton className="mt-2 h-5 w-3/4" /> {/* Additional description line */}
            </div>
          </div>
          <div className="mt-2 md:mt-1">
            <Skeleton className="h-6 w-20" /> {/* Skip task button */}
          </div>
        </div>
        <div className="mt-4 h-1 w-full bg-theme"></div>
      </div>

      {/* Content area */}
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
        {/* Start button area */}
        <div className="mb-8 flex justify-center">
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Navigation tree items */}
        <div className="mt-4 space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`${i > 0 ? "ml-4" : ""} mb-2`}>
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
