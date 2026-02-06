"use client";

import { tools } from "@/constants/tools";
import { ToolCard } from "./tool-card";
import { ToolStatus } from "@/interfaces/tool";

const STATUS_PRIORITY: Record<ToolStatus, number> = {
  Active: 1,
  Planned: 2,
  Deprecated: 3,
};

export function ToolGrid() {
  const sortedTools = [...tools].sort((a, b) => {
    return STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {sortedTools.map((tool) => (
        <ToolCard key={tool.title} tool={tool} />
      ))}
    </div>
  );
}
