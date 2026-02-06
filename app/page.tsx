import { PageHeader } from "@/components/page-header";
import { ToolGrid } from "@/components/dashboard/tool-grid";

export default function Home() {
  return (
    <main className="container mx-auto py-12 px-4 max-w-6xl">
      <PageHeader
        title="Vizzy's Utilities"
        showBack={false}
      />

      <ToolGrid />
    </main>
  );
}
