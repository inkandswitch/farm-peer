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
    files: Set<string>

    constructor(repo: Repo) {
        this.repo = repo
        this.handles = {}
        this.files = new Set()
    }

    ensureDocumentIsSwarmed = (url: string) => {
        if (!this.handles[url] && !this.files.has(url)) {
            // Is there a better way to ensure availability besides opening?
            if (Url.isHypermergeUrl(url)) {
                debug(`Opening document ${url}`)
                const handle = this.repo.open(url)
                this.handles[url] = handle
                // The `subscribe` callback may be invoked immediately,
                // so use setImmediate to prevent locking on deep structures.
                setImmediate(() => handle.subscribe(this.onDocumentUpdate))
            } else if (Url.isHyperfileUrl(url)) {
                // We don't need to subscribe to hyperfile updates, we just need to swarm
                this.files.add(url)
                setImmediate(() => this.repo.readFile(url, (data, mimetype) => {
                    debug(`Read file ${url}`)
                }))
            }
        }
    }

    onDocumentUpdate = (doc: any) => {
        const urls = Traverse.iterativeDFS<string>(doc, Url.isUrl)
        urls.forEach(this.ensureDocumentIsSwarmed)
    }

    isSwarming = (url: string): boolean => {
        // TODO: Shouldn't have to figure out the discovery key here, hypermerge should do it.
        const discoveryKey = Url.toDiscoveryKey(url)
        // TODO: repo should expose an interface for this.
        return this.repo.back.joined.has(discoveryKey)
    }

    close = () => {
        Object.values(this.handles).forEach(handle => handle.close())
    }
}