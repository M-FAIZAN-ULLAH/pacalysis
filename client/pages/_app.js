import "@/styles/globals.css";
import { ConfigProvider } from "antd";

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
