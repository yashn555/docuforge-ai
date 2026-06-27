// Get API URL from environment
// Cast import.meta to any to avoid TypeScript error when ImportMeta types are not declared
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export const api = {
  upload: `${API_URL}/api/upload`,
  parse: `${API_URL}/api/parse`,
  generate: `${API_URL}/api/generate`,
  compose: `${API_URL}/api/compose`,
  session: `${API_URL}/api/session`,
};