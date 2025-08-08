/** @type {import('next').NextConfig} */
const nextConfig = {

  output: "standalone",

  eslint: {
    //compilar aunque haya errores de lint
    ignoreDuringBuilds: true,
  },

  images: {
    domains: ["dev-rubik.s3.us-east-1.amazonaws.com"],
  },
};

export default nextConfig;
