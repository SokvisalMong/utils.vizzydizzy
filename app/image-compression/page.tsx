import { ImageCompressor } from "@/components/image-compressor";
import { PageHeader } from "@/components/page-header";

export default function ImageCompressionPage() {
  return (
    <main className="container mx-auto py-12 px-4 max-w-6xl">
      <PageHeader
        title="Image Compression Tool"
        showBack={true}
      />

      <ImageCompressor />
    </main>
  );
}
