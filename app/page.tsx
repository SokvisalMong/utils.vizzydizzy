import Link from "next/link";
import { 
  IconPhoto, 
  IconQrcode, 
  IconPdf, 
  IconArrowRight 
} from "@tabler/icons-react";
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

const tools = [
  {
    title: "Image Compressor",
    description: "Optimize images for the web. Supports WebP, PNG, and JPEG with quality control.",
    href: "/image-compression",
    icon: IconPhoto,
    status: "Active",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "QR Code Generator",
    description: "QR Code generator for links, text, etc.",
    href: "#",
    icon: IconQrcode,
    status: "Planned",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "PDF to Image",
    description: "Convert PDF pages into JPEG or PNG images.",
    href: "#",
    icon: IconPdf,
    status: "Planned",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export default function Home() {
  return (
    <main className="container mx-auto py-12 px-4 max-w-6xl">
      <PageHeader
        title="Vizzy's Utilities"
        showBack={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.status === "Active";

          return (
            <Link 
              key={tool.title} 
              href={tool.href}
              className={isActive ? "group" : "cursor-not-allowed opacity-75"}
            >
              <Card className={cn(
                "h-full transition-all duration-300 border-none shadow-md bg-card/50 backdrop-blur-sm",
                isActive ? "hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-primary/20" : ""
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
                  {isActive && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      Launch Tool
                      <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
