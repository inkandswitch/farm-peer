import { isString } from "lodash"
import * as hypercore from "hypermerge/dist/hypercore"
import * as Base58 from "bs58"
import { DocUrl } from "hypermerge"

// TODO: All of this logic should be in hypermerge
const documentRegex = /^hypermerge:\/(\w+)$/
const hyperfileRegex = /^hyperfile:\/(?:\/\/)?(\w+)$/

export const isHyperUrl = (val: any) => {
  return isString(val) && (isDocumentUrl(val) || isHyperfileUrl(val))
}

export function isDocumentUrl(val: string): val is DocUrl {
  return documentRegex.test(val)
}

export const isHyperfileUrl = (val: string) => {
  return hyperfileRegex.test(val)
}

// Assumes valid hyper url, hypermerge: or hyperfile:.
export const toId = (val: string) => {
  const regex = isDocumentUrl(val) ? documentRegex : hyperfileRegex
  const [, id]: Array<string | undefined> = val.match(regex) || []
  return id
}

export const fromDocumentId = (id: string) => {
  return `hypermerge:/${id}`
}

export const fromFileId = (id: string) => {
  return `hyperfile:/${id}`
}

export const toDiscoveryKey = (url: string): string => {
  // TODO: Should not need to know how to generate a discovery key here.
  const id = toId(url)
  const dkBuffer = hypercore.discoveryKey(Base58.decode(id))
  const dk = Base58.encode(dkBuffer)
  return dk
}
