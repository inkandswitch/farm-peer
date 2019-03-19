import { Repo, Handle } from "hypermerge/dist"
import * as Traverse from "./Traverse"
import * as Url from "./Url"


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
        // assume a valid url
        if (!this.handles[url]) {
            // Is there a better way to ensure availability besides opening?
            console.log(`Swarming on ${url}`)
            const handle = this.repo.open(url)
            this.handles[url] = handle
            // We don't need to subscribe to hyperfile updates, we just need to swarm
            if (Url.isHypermergeUrl(url)) {
                // The `subscribe` callback may be invoked immediately,
                // so use setImmediate to prevent locking on deep structures.
                setImmediate(() => handle.subscribe(this.onDocumentUpdate))
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