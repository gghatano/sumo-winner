// Node v25 provides a built-in localStorage that lacks the clear() method
// and is a non-extensible proxy. Replace it entirely with a simple implementation.
const store = new Map<string, string>()

const mockLocalStorage: Storage = {
  getItem(key: string): string | null {
    return store.get(key) ?? null
  },
  setItem(key: string, value: string): void {
    store.set(key, value)
  },
  removeItem(key: string): void {
    store.delete(key)
  },
  clear(): void {
    store.clear()
  },
  key(index: number): string | null {
    const keys = Array.from(store.keys())
    return keys[index] ?? null
  },
  get length(): number {
    return store.size
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
})
