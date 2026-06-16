import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dockerイメージを小さくするためにスタンドアロンモードで出力する
  output: 'standalone',
};

export default nextConfig;
