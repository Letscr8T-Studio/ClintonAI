import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/owner", "/api/", "/auth/", "/login", "/onboarding", "/dashboard"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
