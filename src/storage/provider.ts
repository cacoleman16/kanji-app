/**
 * StorageProvider port. Lets us swap localStorage for iCloud / file-based
 * persistence later without changing call sites.
 */
export interface StorageProvider {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export class LocalStorageProvider implements StorageProvider {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage can throw on quota exceeded or in private browsing.
      // Silently swallow; UI surfaces errors via the export-banner reminder.
    }
  }
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

/** In-memory provider for tests (and as a future fallback). */
export class MemoryStorageProvider implements StorageProvider {
  private map = new Map<string, string>();
  get(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  set(key: string, value: string): void {
    this.map.set(key, value);
  }
  remove(key: string): void {
    this.map.delete(key);
  }
}
