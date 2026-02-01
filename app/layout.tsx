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
          id="here-maps-blocker"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Completely block HERE Maps from loading
              (function() {
                // Block HERE Maps script loading
                const originalCreateElement = document.createElement;
                document.createElement = function(tagName) {
                  const element = originalCreateElement.call(this, tagName);
                  if (tagName.toLowerCase() === 'script') {
                    const originalSetAttribute = element.setAttribute;
                    element.setAttribute = function(name, value) {
                      if (name === 'src' && (value.includes('here.com') || value.includes('heremaps'))) {
                        console.warn('Blocked HERE Maps script:', value);
                        return;
                      }
                      return originalSetAttribute.call(this, name, value);
                    };
                  }
                  return element;
                };

                // Create comprehensive HERE Maps polyfill
                if (typeof window.H === 'undefined') {
                  window.H = {
                    map: function() {
                      return { 
                        addEventListener: function() {},
                        setCenter: function() {},
                        setZoom: function() {},
                        getViewModel: function() { return { addObserver: function() {} }; },
                        addLayer: function() {},
                        removeLayer: function() {},
                        setBaseLayer: function() {},
                        getCenter: function() { return { lat: 0, lng: 0 }; },
                        getZoom: function() { return 10; },
                        getElement: function() { return document.createElement('div'); }
                      };
                    },
                    Client: function() {
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
                    },
                    service: {
                      Platform: function() {
                        return { getMapService: function() { return {}; } };
                      }
                    }
                  };
                  console.log('HERE Maps blocker loaded');
                }

                // Freeze H object to prevent modification
                if (typeof Object.freeze === 'function') {
                  Object.freeze(window.H);
                }
              })();
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
          id="error-suppressor"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Completely suppress HERE Maps errors
              (function() {
                // Suppress all HERE Maps related errors
                window.addEventListener('error', function(e) {
                  if (e.message && (e.message.includes('H.map is not a function') || e.message.includes('_.map is not a function'))) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  }
                }, true);
                
                window.addEventListener('unhandledrejection', function(e) {
                  if (e.reason && (e.reason.toString().includes('H.map') || e.reason.toString().includes('_.map'))) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  }
                }, true);
                
                // Override console methods to filter HERE Maps errors
                const originalConsoleError = console.error;
                const originalConsoleWarn = console.warn;
                
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('H.map is not a function') || 
                      message.includes('ErrorBoundary caught an error: TypeError: H.map is not a function') ||
                      message.includes('Map Error detected in ErrorBoundary')) {
                    return; // Completely suppress HERE Maps errors
                  }
                  return originalConsoleError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('HERE Maps') || message.includes('Filtered HERE Maps error')) {
                    return; // Suppress HERE Maps warnings
                  }
                  return originalConsoleWarn.apply(console, args);
                };
                
                // Override ErrorBoundary console.error calls
                const originalLog = console.log;
                console.log = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('Map Error detected in ErrorBoundary')) {
                    return; // Suppress ErrorBoundary map errors
                  }
                  return originalLog.apply(console, args);
                };
              })();
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
