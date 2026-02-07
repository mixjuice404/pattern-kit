export function deepCleanJson<T = any>(input: T): T | null {
  const isPlainObject = (v: any) =>
    v != null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)

  const clean = (v: any): any => {
    if (v == null) return undefined

    if (typeof v === 'string') {
      const trimmed = v.trim()
      if (!trimmed) return undefined
      return v
    }

    if (typeof v === 'number' || typeof v === 'boolean') return v
    if (v instanceof Date) return v

    if (Array.isArray(v)) {
      const next = v
        .map((item) => clean(item))
        .filter((item) => item !== undefined)
      return next.length ? next : undefined
    }

    if (isPlainObject(v)) {
      const obj: any = {}
      for (const [k, val] of Object.entries(v)) {
        const cleaned = clean(val)
        if (cleaned !== undefined) obj[k] = cleaned
      }
      return Object.keys(obj).length ? obj : undefined
    }

    return v
  }

  const cleaned = clean(input)
  return cleaned === undefined ? null : cleaned
}