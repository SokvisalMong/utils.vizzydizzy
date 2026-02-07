"use client";

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/page-header";

const PDFToImageConverter = dynamic(
    () => import("@/components/pdf-to-image/converter").then((mod) => mod.PDFToImageConverter),
    { ssr: false }
);

export default function PDFToImagePage() {
    return (
        <main className="container mx-auto py-12 px-4 max-w-4xl">
            <PageHeader
                title="PDF to Image"
                showBack={true}
                backHref="/"
            />

            <div className="mt-8">
                <PDFToImageConverter />
            </div>
        </main>
    );
}
