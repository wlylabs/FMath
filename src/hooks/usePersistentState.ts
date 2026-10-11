import { useCallback, useEffect, useState, type SetStateAction } from 'react';

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

/**
 * useState that survives reloads on this device. The first render uses the
 * initial value so it matches the prerendered HTML; the saved value loads
 * right after mount. Storage failures are ignored.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<{ value: T; ready: boolean }>({ value: initial, ready: false });

  useEffect(() => {
    setState({ value: read(key, initial), ready: true });
    // initial is a constant default; only the key decides what to load
  }, [key]);

  useEffect(() => {
    if (!state.ready) return;
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(state.value));
    } catch {
      /* private mode or storage full: keep working in memory */
    }
  }, [key, state]);

  const setValue = useCallback((action: SetStateAction<T>) => {
    setState((s) => ({
      ready: s.ready,
      value: typeof action === 'function' ? (action as (prev: T) => T)(s.value) : action,
    }));
  }, []);

  return [state.value, setValue] as const;
}
