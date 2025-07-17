/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    // nextjs requires this config to work with the Image component
    // https://nextjs.org/docs/messages/next-image-unconfigured-host
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
