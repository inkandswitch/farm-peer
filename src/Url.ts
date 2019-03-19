import { validateURL } from "hypermerge/dist/Metadata"
import { isString } from "lodash"


// TODO: This invokes `validateURL` twice for hyperfiles.
export const isUrl = (val: any) => {
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