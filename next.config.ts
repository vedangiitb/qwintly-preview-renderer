import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const parentOrigin = process.env.NEXT_PUBLIC_PARENT_ORIGIN;
    const localParent = process.env.LOCAL_PARENT_ORIGIN;

    const ancestors = [
      "https://qwintly.com",
      "https://dev.qwintly.com",
      ...(localParent ? [localParent] : []),
    ];

    // Use configured parent origin to distinguish prod vs dev builds.
    const isProdDeployment =
      !parentOrigin ||
      parentOrigin === "https://qwintly.com" ||
      parentOrigin === "https://www.qwintly.com";

    const frameAncestors = isProdDeployment
      ? ["https://qwintly.com", "https://www.qwintly.com", ...(localParent ? [localParent] : [])]
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
