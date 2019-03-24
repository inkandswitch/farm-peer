# farm-peer
A cloud peer for farm to keep data warm while your computer is sleeping.

## Usage
```
yarn farm-peer <data url>
```

or, for extra debug information:

```
DEBUG=farm-peer yarn farm-peer <data url>
```

### Inspect and Debug
You can also run farm-peer and attach a debugger to the process by running:
```
yarn farm-peer-inspect <data url>
```
Then, open chrome and navigate to `chrome://inspect`. You should see the node process available for inspection. `yarn farm-peer-inspect` breakpoints before any farm-peer code is run, so it will hang until you open the debugger/inspector and manually continue. This is useful for inspecting the state of farm-peer as it runs.

For example, you can determine if farm-peer is swarming a particular document or file with:
```
farmPeer.isSwarming("hypermerge:/asdfasdf")
```

## Notes
Occasionally the process will crash from a hypermerge error, usually a "Block not downloaded" error. Just restarting the process usually fixes the issue. :shrugging-man:
