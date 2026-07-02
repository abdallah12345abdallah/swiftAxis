/**
 * HTTP client stub. Real backend (Spring) is not built yet, so today the app
 * runs on the mock layer in `@/api`. When the API is ready, configure Axios
 * here and swap the mock functions for real endpoint calls — nothing else in
 * the UI needs to change.
 *
 * Example (later):
 *   import axios from 'axios'
 *   export const http = axios.create({ baseURL: import.meta.env.VITE_API_URL })
 *   http.interceptors.request.use((c) => { ...attach bearer token... })
 */

/** Resolve a value after a short delay to mimic network latency. */
export function mockDelay(data, ms = 350) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}
