import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,

  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);