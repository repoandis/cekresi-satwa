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
              // Ensure HERE Maps is available globally and prevent errors
              if (typeof window.H === 'undefined') {
                window.H = {
                  map: function() {
                    console.warn('HERE Maps H.map() called but not loaded - using polyfill');
                    return { 
                      addEventListener: function() {},
                      setCenter: function() {},
                      setZoom: function() {},
                      getViewModel: function() { return { addObserver: function() {} }; }
                    };
                  },
                  Client: function() {
                    console.warn('HERE Maps H.Client() called but not loaded - using polyfill');
                    return { 
                      configure: function() {},
                      getPlatform: function() { return { getMapService: function() { return {}; } }; }
                    };
                  },
                  util: {
                    Request: function() {
                      return { 
                        send: function() {},
                        abort: function() {}
                      };
                    }
                  },
                  geo: {
                    Point: function() {
                      return { lat: 0, lng: 0 };
                    }
                  }
                };
                console.log('HERE Maps polyfill loaded');
              }
              
              // Override any existing H.map to prevent errors
              var originalMap = window.H?.map;
              if (originalMap) {
                window.H.map = function() {
                  console.warn('HERE Maps H.map() intercepted by polyfill');
                  return originalMap.apply(this, arguments) || window.H.map();
                };
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
              // Aggressive error prevention for map-related errors
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('H.map is not a function') || e.message.includes('_.map is not a function'))) {
                  console.error('Map Error prevented:', e.message);
                  console.error('Error details:', {
                    message: e.message,
                    filename: e.filename,
                    lineno: e.lineno,
                    colno: e.colno,
                    stack: e.error?.stack
                  });
                  // Prevent the error from crashing the app
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && (e.reason.toString().includes('H.map') || e.reason.toString().includes('_.map'))) {
                  console.error('Map Promise Error prevented:', e.reason);
                  console.error('Promise error details:', {
                    reason: e.reason,
                    stack: e.reason?.stack
                  });
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              });
              
              // Override console.error to catch and filter map errors
              const originalConsoleError = console.error;
              console.error = function(...args) {
                const message = args.join(' ');
                if (message.includes('H.map is not a function')) {
                  console.warn('Filtered HERE Maps error:', message);
                  return;
                }
                return originalConsoleError.apply(console, args);
              };
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
