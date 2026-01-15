import type {NextConfig} from 'next';
import { getClientEnv } from './src/lib/env';

// 환경 변수 검증 (빌드 타임)
const clientEnv = getClientEnv();

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // 타입 에러 수정 완료로 ignoreBuildErrors 제거
    // ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // ESLint 에러는 추후 수정 예정
  },
  compiler: {
    // 프로덕션 빌드에서 console.log, console.info, console.debug 제거
    // console.error와 console.warn은 유지 (에러 추적용)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // API 프록시 설정 추가
  async rewrites() {
    const backendUrl = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js 필요
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Tailwind CSS 및 Google Fonts 필요
              "img-src 'self' data: https: placehold.co images.unsplash.com picsum.photos api.dicebear.com", // 이미지 소스 허용
              "font-src 'self' data: https://fonts.gstatic.com", // 폰트 소스 허용
              "connect-src 'self' http://localhost:8080 https://localhost:8080 https://api.lawfulshift.com", // API 연결 허용
              "frame-ancestors 'none'", // iframe 임베드 방지
              "base-uri 'self'", // base 태그 URI 제한
              "form-action 'self'", // 폼 액션 제한
            ].join('; '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
