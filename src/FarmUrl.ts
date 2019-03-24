import { isString } from "lodash"
import * as HyperUrl from "./HyperUrl"


const urlPattern = /farm:\/\/(\w+)\/(\w+)/

export interface Pair {
    code: string
    data: string
}

export function isFarmUrl(val: any) {
    try {
        parse(val)
        return true
    } catch {
        return false
    }
}

export function create({ code, data }: Pair) {
    const codeId = HyperUrl.toId(code)
    const dataId = HyperUrl.toId(data)
    return `farm://${codeId}/${dataId}`
}

export function parse(url: string): Pair {
    const [,code, data]: Array<string | undefined> = url.match(urlPattern) || []
    if (!code || !data) {
        throw new Error(`Invalid farm url: ${url}`)
    }
    return {
        code: HyperUrl.fromId(code),
        data: HyperUrl.fromId(data)
    }
}