/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        dangerouslyAllowSVG: true,
        remotePatterns: [{
            hostname: 'adjoining-tortoise-893.convex.cloud'
        }]
    }
};

export default nextConfig;
