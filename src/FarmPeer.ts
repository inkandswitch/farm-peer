import { Repo, Handle } from "hypermerge/dist"
import * as Traverse from "./Traverse"
import * as HyperUrl from "./HyperUrl"
import * as FarmUrl from "./FarmUrl"

const debug = require('debug')('farm-peer')


// TODO: Inspect blocks for links rather than traversing the doc.
// We currently re-traverse documents on every update. We could instead
// check the operations in each block for links and swarm them if we've never
// seen them.
export class FarmPeer {
    repo: Repo
    handles: Map<string, Handle<any>>
    files: Set<string>

    constructor(repo: Repo) {
        this.repo = repo
        this.handles = new Map()
        this.files = new Set()
    }

    get stats() {
        return {
            documents: this.handles.size,
            files: this.files.size,
            joined: this.repo.back.joined.size
        }
    }

    swarm = (url: string) => {
        // Handle farm urls
        if (FarmUrl.isFarmUrl(url)) {
            debug(`Parsing farm url ${url}`)
            const { code, data } = FarmUrl.parse(url)
            this.swarm(code)
            this.swarm(data)
        }
        // Handle hypermerge and hyperfile urls
        else if (!this.handles.has(url) && !this.files.has(url)) {
            // Is there a better way to ensure availability besides opening?
            if (HyperUrl.isDocumentUrl(url)) {
                debug(`Opening document ${url}`)
                const handle = this.repo.open(url)
                this.handles.set(url, handle)
                // The `subscribe` callback may be invoked immediately,
                // so use setImmediate to prevent locking on deep structures.
                setImmediate(() => handle.subscribe(this.onDocumentUpdate(url)))
            } else if (HyperUrl.isHyperfileUrl(url)) {
                // We don't need to subscribe to hyperfile updates, we just need to swarm
                this.files.add(url)
                setImmediate(() => this.repo.readFile(url, (data, mimetype) => {
                    debug(`Read file ${url}`)
                }))
            }
        }
    }

    shouldSwarm = (val: any) => {
        return HyperUrl.isHyperUrl(val) || FarmUrl.isFarmUrl(val)
    }

    onDocumentUpdate = (url: string) => {
        return (doc: any) => {
            debug(`Update for ${url}`)
            const urls = Traverse.iterativeDFS<string>(doc, this.shouldSwarm)
            urls.forEach(this.swarm)
        }
    }

    isSwarming = (url: string): boolean => {
        // TODO: Shouldn't have to figure out the discovery key here, hypermerge should do it.
        const discoveryKey = HyperUrl.toDiscoveryKey(url)
        // TODO: repo should expose an interface for this.
        return this.repo.back.joined.has(discoveryKey)
    }

    close = () => {
        this.handles.forEach(handle => handle.close())
        this.handles.clear()
        this.files.clear()
    }
}