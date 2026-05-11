import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
 async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_HOST}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
