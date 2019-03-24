import { Repo } from "hypermerge/dist/Repo"
import raf from "random-access-file"
//import discoverySwarm from "discovery-swarm"
//import datDefaults from "dat-swarm-defaults
import discoveryCloud from "discovery-cloud-client"
import * as FarmPeer from "./FarmPeer"
import * as HyperUrl from "./HyperUrl"

let rootDataUrl: string | undefined

// Program config
const program = require("commander")
program
    .description("A cloud peer for farm to keep data warm while your computer is sleeping.")
    .arguments('<rootDataUrl>')
    .action((dataUrl?: string) => {
        rootDataUrl = dataUrl
    })
    .parse(process.argv)


// TODO: validate hypermerge url
// typeof check to satisfy Typescript.
if (typeof rootDataUrl === "undefined" || !HyperUrl.isHyperUrl(rootDataUrl)) {
    throw new Error("Must provide a valid root data url")
}


// Repo init
const storagePath = process.env.REPO_ROOT || "./.data"
const repo = new Repo({ storage: raf, path: storagePath })
repo.replicate(
    /*discoverySwarm(
      datDefaults({
        port: 0,
        id: repo.id,
        stream: repo.stream,
      }),
    ),*/
    new discoveryCloud({url: "wss://discovery-cloud.herokuapp.com", id: repo.id, stream: repo.stream})
)


// FarmPeer init

const farmPeer = new FarmPeer.FarmPeer(repo)
farmPeer.swarm(rootDataUrl)
