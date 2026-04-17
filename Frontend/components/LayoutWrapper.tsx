"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideNav from "@/components/SideNav";
import TopBar from "@/components/TopBar";
import { fetchCurrentUser } from "@/lib/authClient";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    let mounted = true;

    async function validateSession() {
      try {
        const currentUser = await fetchCurrentUser();
        if (!mounted) {
          return;
        }

        const authenticated = Boolean(currentUser);
        setIsAuthenticated(authenticated);

        if (authenticated && isLoginPage) {
          router.replace("/");
        }

        if (!authenticated && !isLoginPage) {
          router.replace("/login");
        }
      } catch {
        if (!mounted) {
          return;
        }
        setIsAuthenticated(false);
        if (!isLoginPage) {
          router.replace("/login");
        }
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    validateSession();

    return () => {
      mounted = false;
    };
  }, [isLoginPage, pathname, router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface text-on-surface">
        <p className="text-sm font-medium tracking-wide uppercase text-outline">Checking session...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <SideNav />
      <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
        <TopBar />
        <div className="p-6 md:p-10 space-y-10">
          {children}
        </div>
      </main>
    </div>
  );
}