import { ConvexAuthProvider } from "@convex-dev/auth/react";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { ConvexReactClient } from "convex/react";
import { ToastProvider } from "~/hooks/useToast";
import "./tailwind.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <ToastProvider />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="loading loading-dots loading-lg"></span>
    </div>
  );
}

export default function App() {
  return (
    <ConvexAuthProvider client={convex}>
      <Outlet />
    </ConvexAuthProvider>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <a href="/" className="link link-primary">
        Back to the home page
      </a>
    </div>
  );
}
