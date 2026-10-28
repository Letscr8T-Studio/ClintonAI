import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

// Public pages only. Add new marketing and help pages here as they ship.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 }];
}
