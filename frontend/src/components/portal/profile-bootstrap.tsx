"use client";

import { useEffect } from "react";
import { getProfile } from "@/lib/api";

/**
 * Fires GET /api/profile/me once when a portal page mounts. The backend creates
 * the profile row on first call (EnsureCurrentAsync), so this guarantees a
 * profile row exists for any signed-in Supabase auth user.
 */
export function ProfileBootstrap() {
  useEffect(() => {
    getProfile().catch(() => {
      // Silent — other API calls will surface auth failures via the 401 interceptor.
    });
  }, []);
  return null;
}
