'use client';

import Script from 'next/script';

export function UmamiScript() {
  if (process.env.NODE_ENV === 'development') return null;
  return (
    <Script
      src="https://insight.ravelloh.com/script.js?siteId=e56a11ef-e373-44e6-8ec9-50993bde1ef5"
      strategy="afterInteractive"
    />
  );
}
