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

## Notes
Occasionally the process will crash from a hypermerge error, usually a "Block not downloaded" error. Just restarting the process usually fixes the issue. :shrugging-man:
