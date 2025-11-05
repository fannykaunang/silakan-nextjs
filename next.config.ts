import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // penting: supaya server.js bisa jalan tanpa node_modules penuh
  reactStrictMode: true,
};

export default nextConfig;
