'use client';

import Script from 'next/script';

export function UmamiScript() {
  if (process.env.NODE_ENV === 'development') return null;
  return (
    <Script
      src="https://analytics.ravelloh.top/script.js"
      data-website-id="95e67860-7720-4f26-938c-649986984c8d"
      strategy="afterInteractive"
    />
  );
}