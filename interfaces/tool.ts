import { TablerIcon } from "@tabler/icons-react";

export type ToolStatus = "Active" | "Planned" | "Deprecated";

export interface Tool {
  title: string;
  description: string;
  href: string;
  icon: TablerIcon;
  status: ToolStatus;
  color: string;
  bgColor: string;
}
