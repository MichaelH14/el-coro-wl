---
name: websocket-patterns
description: Use when implementing WebSocket connections, handling reconnection logic, heartbeat, room management, or scaling persistent connections
---

## Preconditions
- `ws` package (Node) or native WebSocket (browser)
- Understand: WS is persistent TCP, not request/response

## Connection Lifecycle
```ts
wss.on('connection', (ws, req) => {
  const userId = authenticate(req); // auth on upgrade
  ws.on('message', (raw) => handleMessage(ws, JSON.parse(raw.toString())));
  ws.on('close', (code, reason) => cleanup(userId));
  ws.on('error', (err) => logger.error('ws error', err));
});
```

## Reconnection with Backoff (Client)
```ts
let delay = 1000;
function connect() {
  const ws = new WebSocket(url);
  ws.onopen = () => { delay = 1000; };
  ws.onclose = () => {
    setTimeout(connect, delay);
    delay = Math.min(delay * 2, 30_000); // cap at 30s
  };
}
```

## Heartbeat / Ping-Pong
```ts
// Server side
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30_000);
wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
});
```

## Room / Channel Management
```ts
const rooms = new Map<string, Set<WebSocket>>();
function join(ws: WebSocket, room: string) {
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room)!.add(ws);
}
function broadcast(room: string, data: unknown) {
  rooms.get(room)?.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
  });
}
```

## Message Serialization
- Use JSON with a `type` discriminator: `{ type: 'chat', payload: {...} }`
- Binary: use MessagePack or protobuf for high-throughput

## Scaling with Sticky Sessions
- Multiple server instances: use Redis pub/sub to relay messages across nodes
- Load balancer must route same client to same server (sticky sessions / IP hash)
- Alternative: use Redis adapter with Socket.IO

## Verification
- Heartbeat interval set (detect dead connections)
- Client implements reconnection with exponential backoff
- Auth happens on HTTP upgrade, not after connection
- All `.send()` calls check `readyState === OPEN`
