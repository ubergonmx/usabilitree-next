"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const colorMap = {
  "bg-green-500": "#22c55e",
  "bg-green-300": "#86efac",
  "bg-red-500": "#ef4444",
  "bg-red-300": "#fca5a5",
  "bg-gray-500": "#6b7280",
  "bg-gray-300": "#d1d5db",
};

export function PieChart({ data }: PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const width = 192;
    const height = 192;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const pie = d3
      .pie<(typeof data)[0]>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    const path = g.selectAll("path").data(pie(data)).enter().append("path");

    path
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr("d", arc as any)
      .attr("fill", (d) => colorMap[d.data.color as keyof typeof colorMap])
      .attr("stroke", "white")
      .attr("stroke-width", 2);
  }, [data]);

  return <svg ref={svgRef} viewBox="0 0 192 192" className="h-full w-full" />;
}
