import { Repo, Handle } from "hypermerge/dist"
import * as Traverse from "./Traverse"
import * as Url from "./Url"

const debug = require('debug')('farm-peer')


// TODO: Inspect blocks for links rather than traversing the doc.
// We currently re-traverse documents on every update. We could instead
// check the operations in each block for links and swarm them if we've never
// seen them.
export class FarmPeer {
    repo: Repo
    handles: { [url: string]: Handle<any> }

    constructor(repo: Repo) {
        this.repo = repo
        this.handles = {}
    }

    ensureDocumentIsSwarmed = (url: string) => {
        if (!this.handles[url]) {
            // Is there a better way to ensure availability besides opening?
            if (Url.isHypermergeUrl(url)) {
                debug(`Swarming on ${url}`)
                const handle = this.repo.open(url)
                this.handles[url] = handle
                // The `subscribe` callback may be invoked immediately,
                // so use setImmediate to prevent locking on deep structures.
                setImmediate(() => handle.subscribe(this.onDocumentUpdate))
            } else if (Url.isHyperfileUrl(url)) {
                // TODO: `readFile`?
                // We don't need to subscribe to hyperfile updates, we just need to swarm
                debug(`Passing over hyperfile ${url}`)
            }
        }
    }

    onDocumentUpdate = (doc: any) => {
        const urls = Traverse.iterativeDFS<string>(doc, Url.isUrl)
        urls.forEach(this.ensureDocumentIsSwarmed)
    }

    close = () => {
        Object.values(this.handles).forEach(handle => handle.close())
    }
}