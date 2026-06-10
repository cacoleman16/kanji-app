/**
 * StorageProvider port. Lets us swap localStorage for iCloud / file-based
 * persistence later without changing call sites.
 */
export interface StorageProvider {
  get(key: string): string | null;
  /** Returns true when the value was actually persisted. */
  set(key: string, value: string): boolean;
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
  set(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      // localStorage throws on quota exceeded or in private browsing. The
      // false return lets saveState surface a visible warning instead of
      // the user silently losing a whole session.
      return false;
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
  set(key: string, value: string): boolean {
    this.map.set(key, value);
    return true;
  }
  remove(key: string): void {
    this.map.delete(key);
  }
}
