import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isProd = process.env.NODE_ENV === "production";

    const localParent = process.env.LOCAL_PARENT_ORIGIN;

    const ancestors = [
      "https://qwintly.com",
      "https://dev.qwintly.com",
      ...(localParent ? [localParent] : []),
    ];

    const frameAncestors = isProd
      ? ["https://qwintly.com", ...(localParent ? [localParent] : [])]
      : ancestors;

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors.join(" ")};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;