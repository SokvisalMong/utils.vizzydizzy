import Link from "next/link";
import { 
  IconArrowRight 
} from "@tabler/icons-react";
import { tools } from "@/constants/tools";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";


export default function Home() {
  return (
    <main className="container mx-auto py-12 px-4 max-w-6xl">
      <PageHeader
        title="Vizzy's Utilities"
        showBack={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.status === "Active";

          return (
            <Link
              key={tool.title}
              href={tool.href}
              className={cn(
                "flex flex-col w-full",
                isActive ? "group" : "cursor-not-allowed opacity-75"
              )}
            >
              <Card className={cn(
                "h-full transition-all duration-300 border-none bg-card/50 backdrop-blur-sm",
                isActive ? "hover:-translate-y-1 hover:ring-2 hover:ring-primary/20" : ""
              )}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className={cn("p-3 rounded-xl", tool.bgColor, tool.color)}>
                      <Icon size={28} />
                    </div>
                    {!isActive && (
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                        {tool.status}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "flex items-center gap-2 text-sm font-semibold text-primary transition-opacity duration-300",
                    isActive ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"
                  )}>
                    Launch
                    <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
