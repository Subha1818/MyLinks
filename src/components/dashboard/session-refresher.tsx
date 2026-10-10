"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function SessionRefresher() {
  useEffect(() => {
    // Proactively refresh session via Route Handler on mount and on window focus
    authClient.getSession().catch(() => {});

    const onFocus = () => {
      authClient.getSession().catch(() => {});
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return null;
}
