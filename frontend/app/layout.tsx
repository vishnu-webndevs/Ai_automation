import React from 'react';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Particles from '@/components/Particles';
import Script from 'next/script';
import { menuService } from '@/services/api';

import '@/index.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// We set this to dynamic because it fetches menu data from backend API
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Totan AI | Custom AI Agents & Automation Solutions',
  description: 'Totan AI builds custom artificial intelligence, ML agents, and scalable automation pipelines to revolutionize your business operations.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerMenu, footerMenu] = await Promise.all([
    menuService.getByLocation('header-main').catch(() => null),
    menuService.getByLocation('footer').catch(() => null),
  ]);

  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if (typeof window !== 'undefined' && window.trustedTypes && window.trustedTypes.createPolicy && !window.trustedTypes.defaultPolicy) {
            window.trustedTypes.createPolicy('default', {
              createHTML: function(string) { return string; },
              createScript: function(string) { return string; },
              createScriptURL: function(string) { return string; }
            });
          }
        `}} />
        <link rel="icon" type="image/jpeg" href="/favicon.jpg" />
        <Script
          id="gtm-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-55R2B6S4');
            `,
          }}
        />
        <style>{`
          body {
            background-color: #020617;
            color: #f8fafc;
            overflow-x: hidden;
            font-family: var(--font-inter), sans-serif;
          }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #0f172a; }
          ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #475569; }
        `}</style>
      </head>
      <body>
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-55R2B6S4" 
            height="0" width="0" style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        
        <div className="relative min-h-screen bg-slate-950 text-slate-300 selection:bg-purple-500/30 selection:text-purple-200">
          <Particles />
          <React.Suspense fallback={<div className="h-16" />}>
            <Navbar initialMenuData={headerMenu} />
          </React.Suspense>
          <main className="relative z-10">
            {children}
          </main>
          <React.Suspense fallback={<div className="h-16" />}>
            <Footer initialMenuData={footerMenu} />
          </React.Suspense>
        </div>
      </body>
    </html>
  );
}

