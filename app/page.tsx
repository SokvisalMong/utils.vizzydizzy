import { ImageCompressor } from "@/components/image-compressor";

export default function Home() {
  return (
    <main className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text">
          Image Compression Tool
        </h1>
      </div>
      
      <ImageCompressor />
    </main>
  );
}
