import axios from "axios";
import { createClient } from "@/lib/supabase/client";

/**
 * Browser API client. A request interceptor attaches the Supabase access token to
 * every call; a response interceptor redirects to /login on 401.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      const redirectTo = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?redirectTo=${redirectTo}`;
    }
    return Promise.reject(error);
  },
);
