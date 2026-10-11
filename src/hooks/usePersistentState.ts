import { useEffect, useState } from 'react';

const PREFIX = 'fmath:';

function read<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return initial;
    const parsed = JSON.parse(raw) as unknown;
    if (initial && typeof initial === 'object' && !Array.isArray(initial)) {
      return parsed && typeof parsed === 'object' ? { ...initial, ...(parsed as object) } : initial;
    }
    return typeof parsed === typeof initial ? (parsed as T) : initial;
  } catch {
    return initial;
  }
}

/** useState that survives reloads on this device. Storage failures are ignored. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial));
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* private mode or storage full: keep working in memory */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
