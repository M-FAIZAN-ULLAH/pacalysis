// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// };

// export default nextConfig;

import nextTranspileModules from "next-transpile-modules";

// Apply the next-transpile-modules plugin with the required Ant Design packages
const withTM = nextTranspileModules([
  "antd",
  "@ant-design/icons",
  "rc-pagination",
  "rc-picker",
  "rc-notification",
  "rc-tooltip",
  "rc-util",
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Any other Next.js configuration options
};

export default withTM(nextConfig);
