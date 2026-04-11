"use client";

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/page-header";

const GIFSplitter = dynamic(
    () => import("@/components/gif-splitter/splitter").then((mod) => mod.GIFSplitter),
    { ssr: false }
);

export default function GIFSplitterPage() {
    return (
        <main className="container mx-auto py-12 px-4 max-w-4xl">
            <PageHeader
                title="GIF Splitter"
                showBack={true}
                backHref="/"
            />

            <div className="mt-8">
                <GIFSplitter />
            </div>
        </main>
    );
}
