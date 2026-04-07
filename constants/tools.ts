import {
  IconPhoto,
  IconQrcode,
  IconPdf,
  IconVideo,
  IconSparkles
} from "@tabler/icons-react";
import { Tool } from "@/interfaces/tool";

export const tools: Tool[] = [
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
    description: "Convert PDF pages into high-quality PNG images entirely in the browser.",
    href: "/pdf-to-image",
    icon: IconPdf,
    status: "Active",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Video Compressor",
    description: "Compress and resize videos entirely in the browser using FFmpeg.",
    href: "/video-compression",
    icon: IconVideo,
    status: "Active",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    title: "AI Image Studio",
    description: "Generate and edit images using Google's Imagen 3 model via your own API key.",
    href: "/ai-image-studio",
    icon: IconSparkles,
    status: "Active",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  }
];
