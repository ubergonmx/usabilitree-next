import { StudyCardSkeleton } from "./study-card-skeleton";

export function StudiesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <StudyCardSkeleton key={i} />
      ))}
    </div>
  );
}
