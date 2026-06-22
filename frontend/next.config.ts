import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config.output.devtoolModuleFilenameTemplate = (info: any) => {
        // Normaliza las rutas de Windows reemplazando contrabarra por barra y removiendo prefijos absolutos redundantes
        const cleanPath = info.resourcePath.replace(/\\/g, '/');
        return `webpack:///${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
      };
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  turbopack: {},
  async rewrites() {
    const backendUrl = process.env.BACKEND_PROXY_URL || "http://127.0.0.1:8009";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`, // Proxy al backend FastAPI
      },
    ];
  },
};

export default nextConfig;
