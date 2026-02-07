export type FlattenedTextItem = {
  path: string
  text: string
}

type FlattenOptions = {
  includeKeys?: string[]
  excludeKeys?: string[]
  includePaths?: string[]
  maxDepth?: number
  allowEmpty?: boolean
}

const toText = (v: any) => (v == null ? '' : String(v))

const normalizeKeySet = (keys?: string[]) =>
  Array.isArray(keys)
    ? new Set(keys.map((k) => String(k).trim()).filter(Boolean))
    : null

const normalizePathList = (paths?: string[]) =>
  Array.isArray(paths)
    ? paths.map((p) => String(p).trim()).filter(Boolean)
    : []

const matchesPathPrefix = (path: string, prefix: string) =>
  path === prefix || path.startsWith(prefix + '.') || path.startsWith(prefix + '[')

const shouldIncludeKey = (key: string, include?: Set<string> | null, exclude?: Set<string> | null) => {
  if (exclude?.has(key)) return false
  if (include && !include.has(key)) return false
  return true
}

export function flattenForTranslation(
  input: any,
  opts: FlattenOptions = {}
): FlattenedTextItem[] {
  const include = normalizeKeySet(opts.includeKeys)
  const exclude = normalizeKeySet(opts.excludeKeys)
  const includePaths = normalizePathList(opts.includePaths)
  const maxDepth = typeof opts.maxDepth === 'number' ? opts.maxDepth : 50
  const allowEmpty = !!opts.allowEmpty

  const out: FlattenedTextItem[] = []

  const shouldTraverse = (path: string) => {
    if (!includePaths.length) return true
    if (!path) return true
    return includePaths.some((p) => matchesPathPrefix(p, path) || matchesPathPrefix(path, p))
  }

  const shouldEmit = (path: string) => {
    if (!includePaths.length) return true
    return includePaths.some((p) => matchesPathPrefix(path, p))
  }

  const walk = (node: any, path: string, depth: number) => {
    if (depth > maxDepth) return
    if (!shouldTraverse(path)) return

    if (typeof node === 'string') {
      const text = node
      if ((text || allowEmpty) && shouldEmit(path)) out.push({ path, text })
      return
    }

    if (node == null) return

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        walk(node[i], `${path}[${i}]`, depth + 1)
      }
      return
    }

    if (typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        if (!shouldIncludeKey(k, include, exclude)) continue
        const nextPath = path ? `${path}.${k}` : k
        walk(v, nextPath, depth + 1)
      }
    }
  }

  walk(input, '', 0)
  return out
}

const parsePath = (path: string) => {
  const tokens: Array<string | number> = []
  const re = /([^[.\]]+)|\[(\d+)\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(path))) {
    if (m[1] != null) tokens.push(m[1])
    else if (m[2] != null) tokens.push(Number(m[2]))
  }
  return tokens
}

export function setByPath<T>(base: T, path: string, value: any): T {
  const p = toText(path).trim()
  if (!p) return base

  const tokens = parsePath(p)
  if (!tokens.length) return base

  const root: any = Array.isArray(base)
    ? [...(base as any)]
    : base != null && typeof base === 'object'
      ? { ...(base as any) }
      : {}

  let cur: any = root

  for (let i = 0; i < tokens.length; i++) {
    const key = tokens[i]
    const isLast = i === tokens.length - 1

    if (isLast) {
      cur[key as any] = value
      break
    }

    const nextKey = tokens[i + 1]
    const nextIsIndex = typeof nextKey === 'number'
    const nextVal = cur[key as any]

    const nextObj =
      nextVal != null && typeof nextVal === 'object'
        ? Array.isArray(nextVal)
          ? [...nextVal]
          : { ...nextVal }
        : nextIsIndex
          ? []
          : {}

    cur[key as any] = nextObj
    cur = nextObj
  }

  return root as T
}

export function applyTranslations<T extends object>(
  base: T,
  items: FlattenedTextItem[]
): T {
  let root: any = base

  for (const it of items) {
    const path = toText(it?.path).trim()
    if (!path) continue
    root = setByPath(root, path, toText(it?.text))
  }

  return root as T
}

export function normalizeFlattenInput(input: any): FlattenedTextItem[] {
  if (Array.isArray(input)) {
    return input
      .map((it) => ({
        path: toText(it?.path).trim(),
        text: toText(it?.text),
      }))
      .filter((it) => it.path)
  }
  return []
}