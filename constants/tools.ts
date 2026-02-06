import { 
  IconPhoto, 
  IconQrcode, 
  IconPdf, 
  IconVideo
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
    description: "Convert PDF pages into JPEG or PNG images.",
    href: "#",
    icon: IconPdf,
    status: "Planned",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Vidoe Compressor",
    description: "Compress videos to a target size",
    href: "#",
    icon: IconVideo,
    status: "Planned",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  }
];
