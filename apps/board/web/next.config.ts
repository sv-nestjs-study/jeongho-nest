import type { NextConfig } from 'next';

const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  // 브라우저는 /api만 호출하고, Next 서버가 Nest API로 요청을 전달합니다.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
