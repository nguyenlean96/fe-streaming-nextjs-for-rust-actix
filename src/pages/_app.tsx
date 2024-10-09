import "@/styles/globals.css";
import { useViewportSize } from '@mantine/hooks';
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const { width, height } = useViewportSize();
  return (
    <Component
      {...pageProps}
      width={width}
      height={height}
    />
  );
}
