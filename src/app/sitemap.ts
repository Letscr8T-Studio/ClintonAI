import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

// Public pages only. Add new marketing and help pages here as they ship.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/privacy"), changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/terms"), changeFrequency: "monthly", priority: 0.3 },
  ];
}
