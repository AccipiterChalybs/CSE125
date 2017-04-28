# CSE125 2017
Link to our Website:
http://cse125.ucsd.edu/2017/cse125g4/

### Running Client Locally Without Server
Within `scripts/engine/Debug.js` set:
```
Debug.clientUpdate = true;
```
to enable running client code locally without server.

### Running Client Locally With Remote Server
Within `scripts/engine/Networking.js @ createClientSocket` set:
```
  let url = 'http://162.243.136.237:3000/' ;
```

### Disclaimer
Do not replace existing cannon.min.js.
It has been modified to not require `window` for server use.
