import * as HyperUrl from "./HyperUrl"
import { crc16 } from "js-crc"
import Base58 from "bs58"

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

export function createDocumentLink(type: string, url: string): string {
  if (!url.match("hypermerge:/")) {
    throw new Error("expecting a hypermerge URL as input")
  }
  if (url.match("pushpin")) {
    throw new Error(
      'so-called ID contains "pushpin". you appear to have passed a URL as an ID',
    )
  }

  const id = url.substring(12)

  if (!type) {
    throw new Error("no type when creating URL")
  }
  return withCrc(`pushpin://${type}/${id}`)
}

export const withCrc = (str: string) => `${str}/${encode(crc16(str))}`

export const encode = (str: string) => Base58.encode(hexToBuffer(str))

export const hexToBuffer = (key: string | Buffer) =>
  Buffer.isBuffer(key) ? key : Buffer.from(key, "hex")
