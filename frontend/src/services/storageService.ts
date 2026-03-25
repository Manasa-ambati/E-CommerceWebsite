// src/services/storageService.ts
export const storageService = {
  set: (key: string, value: any, ttlHours?: number) => {
    const data = { value, expiry: ttlHours ? Date.now() + ttlHours * 3600 * 1000 : null };
    localStorage.setItem(key, JSON.stringify(data));
  },
  get: (key: string) => {
    const dataStr = localStorage.getItem(key);
    if (!dataStr) return null;
    try {
      const data = JSON.parse(dataStr);
      if (data.expiry && Date.now() > data.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return data.value;
    } catch {
      return null;
    }
  },
  remove: (key: string) => localStorage.removeItem(key),
};