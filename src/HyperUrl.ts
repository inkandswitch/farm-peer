import { isString } from "lodash"
import * as hypercore from "hypermerge/dist/hypercore"
import * as Base58 from "bs58"
import * as URL from "url"

// TODO: All of this logic should be in hypermerge


export const isHyperUrl = (val: any) => {
    return isString(val) && (isDocumentUrl(val) || isHyperfileUrl(val))
}

export const isDocumentUrl = (val: string) => {
    try {
        const url = new URL.URL(val)
        return url.protocol == 'hypermerge:'
    } catch {
        return false
    }
}

export const isHyperfileUrl = (val: string) => {
    try {
        const url = new URL.URL(val)
        return url.protocol == 'hyperfile:'
    } catch {
        return false
    }
}

// Assumes valid hyper url, document or file.
export const toId = (val: string) => {
    const url = new URL.URL(val)
    return url.pathname.slice(1)
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