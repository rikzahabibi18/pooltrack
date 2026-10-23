import { useEffect, useState } from 'react'

/** Nilai yang baru diperbarui setelah `delayMs` tanpa perubahan (untuk kolom pencarian). */
export function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
