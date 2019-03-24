import { validateURL } from "hypermerge/dist/Metadata"
import { isString } from "lodash"
import * as hypercore from "hypermerge/dist/hypercore"
import * as Base58 from "bs58"


// TODO: This invokes `validateURL` twice for hyperfiles.
export const isHyperUrl = (val: any) => {
    return isString(val) && (isHypermergeUrl(val) || isHyperfileUrl(val))
}

export const isHypermergeUrl = (val: string) => {
    try {
        return validateURL(val).type == "hypermerge"
    } catch {
        return false
    }
}

export const isHyperfileUrl = (val: string) => {
    try {
        return validateURL(val).type == "hyperfile"
    } catch {
        return false
    }
}

export const toId = (val: string) => {
    return validateURL(val).id
}

export const fromId = (id: string) => {
    return `hypermerge:/${id}`
}

export const toDiscoveryKey = (url: string): string => {
    // TODO: Should not need to know how to generate a discovery key here.
    const id = toId(url)
    const dkBuffer = hypercore.discoveryKey(Base58.decode(id))
    const dk = Base58.encode(dkBuffer)
    return dk
}