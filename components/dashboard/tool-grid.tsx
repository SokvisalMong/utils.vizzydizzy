"use client";

import { tools } from "@/constants/tools";
import { ToolCard } from "./tool-card";

export function ToolGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {tools.map((tool) => (
        <ToolCard key={tool.title} tool={tool} />
      ))}
    </div>
  );
}
