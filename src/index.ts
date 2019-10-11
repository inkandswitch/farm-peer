import { Repo } from "hypermerge/dist/Repo"
//import discoverySwarm from "discovery-swarm"
//import datDefaults from "dat-swarm-defaults"
import DiscoverySwarm from "discovery-cloud-client"
import * as PushpinPeer from "./PushpinPeer"
import * as PushpinUrl from "./PushpinUrl"
import fs from "fs"
import path from "path"
import { DocUrl } from "hypermerge"

const STORAGE_PATH = process.env.REPO_ROOT || "./.data"
const REPO_PATH = path.join(STORAGE_PATH, "hypermerge")
const ROOT_DOC_PATH = path.join(STORAGE_PATH, "root")

// Program config
const program = require("commander")
program.description(
  "A cloud peer for pushpin to keep data warm while your computer is sleeping.",
)

// Repo init
// TODO: use a real location, not the repo root
const repo = new Repo({ path: REPO_PATH })
const swarm = new DiscoverySwarm({
  url: "wss://discovery-cloud.herokuapp.com",
  id: repo.swarmKey,
  stream: repo.stream,
})
// TODO: fix this any
repo.setSwarm(swarm as any)
repo.startFileServer("/tmp/storage-peer.sock")

// TODO: we already define this in Pushpin, strange to define it twice.
interface RootDoc {
  name: string
  icon: string
  storedUrls: {
    [contactId: string]: string
  }
}

interface ContactDoc {
  name: string
  color: string
  avatarDocId: string
  hypermergeUrl: string // Used by workspace
  offeredUrls?: { [url: string]: string[] } // Used by share, a map of contact id to documents offered.
  devices?: string[]
}

//const deviceUrl = getDevice(repo)
const rootDataUrl = getRootDoc(repo)

// PushpinPeer init
const pushpinPeer = new PushpinPeer.PushpinPeer(repo)
pushpinPeer.swarm(rootDataUrl)
heartbeatAll(repo, rootDataUrl)

const pushpinUrl = PushpinUrl.createDocumentLink("storage-peer", rootDataUrl)

console.log(`Storage Peer Url: ${pushpinUrl}`)

// Create necessary root documents
function getRootDoc(repo: Repo) {
  return getOrCreateFromFile(ROOT_DOC_PATH, () => {
    const url = repo.create()
    repo.change(url, (doc: any) => {
      doc.name = "Storage Peer"
      doc.icon = "cloud"
      doc.storedUrls = {}
    })
    return url
  })
}

function getOrCreateFromFile(file: string, create: Function) {
  try {
    const content = fs.readFileSync(file, { encoding: "utf-8" })
    return content
  } catch {
    const content = create()
    fs.writeFileSync(file, content)
    return content
  }
}

interface HeartbeatMessage {
  contact: string
  device: string
  heartbeat?: boolean
  departing?: boolean
  data?: any
}

function heartbeatAll(repo: Repo, rootUrl: DocUrl) {
  const interval = setInterval(() => {
    repo.doc(rootUrl, (root: RootDoc) => {
      // Heartbeat on all stored contacts
      Object.keys(root.storedUrls).forEach(contactId => {
        const msg = {
          contact: contactId,
          device: rootUrl,
          hearbeat: true,
          data: {
            [contactId]: {
              onlineStatus: {},
            },
          },
        }
        repo.message(contactId as DocUrl, msg)
      })

      // Heartbeat on pushpin-peer device.
      const message = {
        contact: rootUrl,
        device: rootUrl,
        heartbeat: true,
        data: {
          [rootUrl]: {
            onlineStatus: {},
          },
        },
      }
      repo.message(rootUrl, message)
    })
  }, 1000)
}
