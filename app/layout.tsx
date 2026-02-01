import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from "next/script";
import { ErrorBoundary } from "@/components/debug/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cek Resi App",
  description: "Aplikasi cek resi dengan authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="here-maps-polyfill"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Ensure HERE Maps is available globally
              if (typeof window.H === 'undefined') {
                window.H = {
                  map: function() {
                    console.warn('HERE Maps H.map() called but not loaded - using polyfill');
                    return null;
                  },
                  Client: function() {
                    console.warn('HERE Maps H.Client() called but not loaded - using polyfill');
                    return null;
                  }
                };
                console.log('HERE Maps polyfill loaded');
              }
            `,
          }}
        />
        <Script
          id="lodash-polyfill"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Ensure Lodash is available globally
              if (typeof window._ === 'undefined') {
                window._ = {
                  map: function(collection, iteratee) {
                    if (collection == null) return [];
                    if (Array.isArray(collection)) {
                      return collection.map(iteratee);
                    }
                    return Object.values(collection).map(iteratee);
                  }
                };
                console.log('Lodash polyfill loaded');
              }
            `,
          }}
        />
        <Script
          id="error-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('H.map is not a function') || e.message.includes('_.map is not a function'))) {
                  console.error('Map Error detected:', e);
                  console.error('Error details:', {
                    message: e.message,
                    filename: e.filename,
                    lineno: e.lineno,
                    colno: e.colno,
                    stack: e.error?.stack
                  });
                  // Prevent the error from crashing the app
                  e.preventDefault();
                  return false;
                }
              });
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && (e.reason.toString().includes('H.map') || e.reason.toString().includes('_.map'))) {
                  console.error('Map Promise Error:', e);
                  console.error('Promise error details:', {
                    reason: e.reason,
                    stack: e.reason?.stack
                  });
                  e.preventDefault();
                  return false;
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
