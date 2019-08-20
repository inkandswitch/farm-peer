import * as HyperUrl from "./HyperUrl"

const urlPattern = /pushpin:\/\/(\w+)\/(\w+)/

export interface Parts {
  contentType: string
  docId: string
}

export function isPushpinUrl(val: any) {
  try {
    parts(val)
    return true
  } catch {
    return false
  }
}

export function parts(url: string): Parts {
  const [, contentType, docId]: Array<string | undefined> =
    url.match(urlPattern) || []
  if (!docId) {
    throw new Error(`Invalid pushpin url: ${url}`)
  }
  return { contentType, docId }
}
