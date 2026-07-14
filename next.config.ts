import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exercise images are plain <img> from the jsDelivr CDN (no next/image remote config needed).
  // Production hardening: mirror data + images into own storage bucket (see README).
};

export default nextConfig;
