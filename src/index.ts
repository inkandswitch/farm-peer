const program = require("commander")

let rootDataUrl

program
    .description("A cloud peer for farm to keep data warm while your computer is sleeping.")
    .arguments('<rootDataUrl>')
    .action((dataUrl?: String) => {
        rootDataUrl = dataUrl
    })
    .parse(process.argv)

// TODO: validate hypermerge url
if (typeof rootDataUrl === "undefined") {
    console.error("Must provide a valid root data url")
    process.exit(1)
}

console.log(rootDataUrl)
