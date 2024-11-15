import { cn } from "@/lib/utils";

interface BoxPlotProps {
  data: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    displayMax: number;
  };
  formatLabel?: (value: number) => string;
  className?: string;
}

export function BoxPlot({ data, formatLabel = (v) => v.toString(), className }: BoxPlotProps) {
  const range = data.displayMax - Math.min(data.min, 0);
  const getPosition = (value: number) => {
    const clampedValue = Math.min(value, data.displayMax);
    return ((clampedValue - Math.min(data.min, 0)) / range) * 100;
  };

  return (
    <div className={cn("relative h-32 w-full", className)}>
      {/* Main horizontal line (min to displayMax) */}
      <div className="absolute left-[5%] right-[5%] top-1/2 h-0.5 -translate-y-1/2 bg-gray-300">
        {/* Box from Q1 to Q3 */}
        <div
          className="absolute h-12 -translate-y-1/2 border border-blue-300 bg-blue-100"
          style={{
            left: `${getPosition(data.q1)}%`,
            width: `${getPosition(data.q3) - getPosition(data.q1)}%`,
          }}
        />

        {/* Median line */}
        <div
          className="absolute h-12 w-1 -translate-x-1/2 -translate-y-1/2 bg-blue-600"
          style={{ left: `${getPosition(data.median)}%` }}
        />

        {/* Whisker lines */}
        {/* Left whisker */}
        <div
          className="absolute h-6 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-gray-400"
          style={{ left: `${getPosition(data.min)}%` }}
        />
        {/* Right whisker */}
        <div
          className="absolute h-6 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-gray-400"
          style={{ left: `${getPosition(Math.min(data.max, data.displayMax))}%` }}
        />

        {/* Connecting lines to whiskers */}
        <div
          className="absolute h-0.5 bg-gray-300"
          style={{
            left: `${getPosition(data.min)}%`,
            width: `${getPosition(data.q1) - getPosition(data.min)}%`,
          }}
        />
        <div
          className="absolute h-0.5 bg-gray-300"
          style={{
            left: `${getPosition(data.q3)}%`,
            width: `${getPosition(Math.min(data.max, data.displayMax)) - getPosition(data.q3)}%`,
          }}
        />

        {/* Truncation indicator if max exceeds displayMax */}
        {data.max > data.displayMax && (
          <div
            className="absolute -top-2 flex -translate-x-1/2 items-center text-xs text-gray-500"
            style={{ left: `${getPosition(data.displayMax)}%` }}
          >
            ▶
          </div>
        )}

        {/* Labels */}
        <div
          className="absolute -bottom-16 flex -translate-x-1/2 flex-col items-center whitespace-nowrap text-xs text-gray-500"
          style={{ left: `${getPosition(data.min)}%` }}
        >
          <span className="font-medium">Min</span>
          <span>{formatLabel(data.min)}</span>
        </div>
        <div
          className="absolute -top-16 flex -translate-x-1/2 flex-col items-center whitespace-nowrap text-xs text-gray-500"
          style={{ left: `${getPosition(data.q1)}%` }}
        >
          <span className="font-medium">Q1</span>
          <span>{formatLabel(data.q1)}</span>
        </div>
        <div
          className="absolute -bottom-16 flex -translate-x-1/2 flex-col items-center whitespace-nowrap text-xs text-gray-500"
          style={{ left: `${getPosition(data.median)}%` }}
        >
          <span className="font-medium">Median</span>
          <span>{formatLabel(data.median)}</span>
        </div>
        <div
          className="absolute -top-16 flex -translate-x-1/2 flex-col items-center whitespace-nowrap text-xs text-gray-500"
          style={{ left: `${getPosition(data.q3)}%` }}
        >
          <span className="font-medium">Q3</span>
          <span>{formatLabel(data.q3)}</span>
        </div>
        <div
          className="absolute -bottom-16 flex -translate-x-1/2 flex-col items-center whitespace-nowrap text-xs text-gray-500"
          style={{ left: `${getPosition(Math.min(data.max, data.displayMax))}%` }}
        >
          <span className="font-medium">Max</span>
          <span>
            {formatLabel(data.max)}
            {data.max > data.displayMax && " ▶"}
          </span>
        </div>
      </div>
    </div>
  );
}
