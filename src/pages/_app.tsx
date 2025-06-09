import { Toaster } from "sonner";
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster 
        position="top-center"
        richColors
        expand={true}
        closeButton
      />
    </>
  );
}
