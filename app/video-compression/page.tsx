import { VideoCompressor } from "@/components/video-compressor";
import { PageHeader } from "@/components/page-header";

export default function VideoCompressionPage() {
  return (
    <main className="container mx-auto py-12 px-4 max-w-6xl">
      <PageHeader
        title="Video Compression Tool"
        showBack={true}
      />

      <VideoCompressor />
    </main>
  );
}
