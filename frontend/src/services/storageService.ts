export const storageService = {
  set: (key: string, value: any, ttlInMinutes?: number) => {
    const item = { value, expiry: ttlInMinutes ? Date.now() + ttlInMinutes * 60000 : null };
    localStorage.setItem(key, JSON.stringify(item));
  },
  get: (key: string) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    try {
      const item = JSON.parse(itemStr);
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch { return null; }
  },
  remove: (key: string) => localStorage.removeItem(key),
};