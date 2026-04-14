import { Capacitor } from '@capacitor/core';

/**
 * The API Base URL depends on the platform:
 * - On Web (Dev): uses relative '/api' thanks to Vite proxy
 * - On Android (Dev): needs the computer's IP (e.g. http://192.168.68.104:3000/api)
 * - On Production: use your hosted API URL (configured in .env)
 */
const getBaseUrl = () => {
  // Check if we have a production URL in environment variables
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  // For Android development, point to your computer's IP
  if (Capacitor.getPlatform() === 'android') {
    const url = 'http://192.168.68.105:3000/api';
    console.log('[API] Android detected, using URL:', url);
    return url;
  }

  // Fallback to relative for web
  return '/api';
};

export const API_URL = getBaseUrl();

/**
 * Centralized fetch helper for the backend API
 */
export const apiClient = {
  get: async (path: string) => {
    console.log(`[API] GET ${API_URL}${path}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const response = await fetch(`${API_URL}${path}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(`[API] GET Error for ${path}:`, err);
      throw err;
    }
  },
  
  post: async (path: string, body: any) => {
    console.log(`[API] POST ${API_URL}${path}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout

    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(`[API] POST Error for ${path}:`, err);
      throw err;
    }
  }
};
