import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import Protected from "./features/auth/components/Protected";

// Lazy load route components for code splitting
const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));
const Dashboard = lazy(() => import("./features/chat/pages/Dashboard"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
    <div className="text-zinc-400">Loading...</div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Protected>
          <Dashboard />
        </Protected>
      </Suspense>
    ),
  },
]);

