"use client";

import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBack?: boolean;
  backHref?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  showBack = false,
  backHref = "/",
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col items-center mb-12 text-center", className)}>
      {/* Navigation Space Reservation */}
      <div className="w-full h-10 flex items-center justify-start mb-4">
        {showBack ? (
          <Button
            variant="ghost"
            asChild
            className="-ml-4 text-muted-foreground hover:text-foreground"
          >
            <Link href={backHref}>
              <IconChevronLeft size={18} className="mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        ) : (
          /* Empty placeholder to reserve vertical space */
          <div className="h-10" aria-hidden="true" />
        )}
      </div>

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground text-lg max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
