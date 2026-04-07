import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ImageStudio } from "@/components/image-generation/image-studio";

export const metadata: Metadata = {
  title: "AI Image Studio | Utils",
  description: "Generate and edit images using Google's AI models via a Bring-Your-Own-Key client-side studio.",
};

export default function AiImageStudioPage() {
  return (
    <main className="container mx-auto py-12 px-4 max-w-7xl">
      <PageHeader
        title="AI Image Studio"
        description="Bring Your Own API Key (BYOAK) to generate and edit images completely locally using Gemini and Imagen 3 models."
        showBack={true}
      />
      
      <div className="mt-8">
        <ImageStudio />
      </div>
    </main>
  );
}
