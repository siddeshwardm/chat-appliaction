import axios from "axios";

const trimTrailingSlash = (value) => (value.endsWith("/") ? value.slice(0, -1) : value);

const DEFAULT_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

const ensureApiSuffix = (value) => {
  const trimmed = trimTrailingSlash(value);
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

// Prefer explicit API base URL (must include /api)
const apiBaseFromEnv = import.meta.env.VITE_API_BASE_URL
  ? ensureApiSuffix(import.meta.env.VITE_API_BASE_URL)
  : "";

// Convenience: allow setting backend origin and we will append /api
const backendOriginFromEnv = import.meta.env.VITE_BACKEND_URL
  ? trimTrailingSlash(import.meta.env.VITE_BACKEND_URL)
  : "";

const BASE_URL = apiBaseFromEnv || (backendOriginFromEnv ? `${backendOriginFromEnv}/api` : DEFAULT_BASE_URL);

// Helpful warning for common Vercel misconfig: backend is separate, but env vars are not set.
if (
  import.meta.env.MODE !== "development" &&
  !apiBaseFromEnv &&
  !backendOriginFromEnv &&
  typeof window !== "undefined" &&
  window.location?.hostname?.includes("vercel.app")
) {
  // eslint-disable-next-line no-console
  console.warn(
    "[chat-app] API base URL is using '/api'. On Vercel this usually requires setting VITE_BACKEND_URL or VITE_API_BASE_URL."
  );
}

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});
