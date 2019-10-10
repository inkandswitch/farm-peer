import { Repo } from "hypermerge/dist/Repo"
//import discoverySwarm from "discovery-swarm"
//import datDefaults from "dat-swarm-defaults"
import DiscoverySwarm from "discovery-cloud-client"
import * as PushpinPeer from "./PushpinPeer"
import * as PushpinUrl from "./PushpinUrl"
import fs from "fs"
import path from "path"

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

interface StorageDoc {
  name: string
  device: string
  archivedUrls: {
    [contactId: string]: string
  }
}

// TODO: we already define this in Pushpin, strange to define it twice.
interface DeviceDoc {
  name: string
  icon: string
}

//const deviceUrl = getDevice(repo)
const rootDataUrl = getRootDoc(repo)

// PushpinPeer init
const pushpinPeer = new PushpinPeer.PushpinPeer(repo)
pushpinPeer.swarm(rootDataUrl)

const pushpinUrl = PushpinUrl.createDocumentLink("storage-peer", rootDataUrl)

console.log(`Storage Peer Url: ${pushpinUrl}`)

// Create necessary root documents
function getRootDoc(repo: Repo) {
  return getOrCreateFromFile(ROOT_DOC_PATH, () => {
    const device = createDevice()
    return repo.create((doc: StorageDoc) => {
      doc.name = "Storage Peer"
      doc.device = device
      doc.archivedUrls = {}
    })
  })
}

function createDevice() {
  return repo.create((doc: DeviceDoc) => {
    doc.name = "Storage Peer"
    doc.icon = "fa-desktop"
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
