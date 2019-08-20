# pushpin-peer

A cloud peer for [pushpin](https://github.com/inkandswitch/pushpin) to keep data warm while your computer is sleeping.

## Usage

```
yarn start <data url>
```

or, for extra debug information:

```
DEBUG=pushpin-peer yarn start <data url>
```

### Inspect and Debug

You can also run pushpin-peer and attach a debugger to the process by running:

```
yarn start:inspect <data url>
```

Then, open chrome and navigate to `chrome://inspect`. You should see the node process available for inspection. `yarn pushpin-peer-inspect` breakpoints before any pushpin-peer code is run, so it will hang until you open the debugger/inspector and manually continue. This is useful for inspecting the state of pushpin-peer as it runs.

For example, you can determine if pushpin-peer is swarming a particular document or file with:

```
pushpinPeer.isSwarming("hypermerge:/asdfasdf")
```

## Notes

Occasionally the process will crash from a hypermerge error, usually a "Block not downloaded" error. Just restarting the process usually fixes the issue. :shrugging-man:
