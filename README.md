# CityRoute — Smart Emergency Route Planner

> **DSA Project** | Node.js + Express + Socket.IO + Dijkstra's Algorithm

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
http://localhost:3000
```

For development with auto-reload:
```bash
npm run dev
```

---

## Project Structure
DSA project/
├── dsa/
│   └── graph.js          ← Moved here
├── public/
│   └── index.html        ← Moved here
├── routes/
│   └── api.js            ← Created
├── server.js
├── api.js
├── package.json
├── package-lock.json
└── node_modules/
##  DSA Concepts Implemented

| Concept | File | Usage |
|---|---|---|
| **Graph (Adjacency List)** | `dsa/graph.js` | City road network |
| **Min-Heap (Priority Queue)** | `dsa/graph.js` | Efficient Dijkstra dequeue |
| **Dijkstra's Algorithm** | `dsa/graph.js` | Shortest path finding |
| **Edge Weight Relaxation** | `dsa/graph.js` | Path cost optimization |
| **Emergency Priority** | `dsa/graph.js` | Reduced weights for hospital routes |

---

## 🌐 REST API Endpoints

### Get city graph
```
GET /api/graph
```
Returns all nodes, edges, and currently blocked roads.

### Find shortest route
```
POST /api/route
Content-Type: application/json

{ "src": 0, "dst": 13, "emergency": false }
```
Returns path, distance, step-by-step algorithm log.

### Block / unblock a road
```
POST /api/block
Content-Type: application/json

{ "from": 5, "to": 10 }
```

### Clear all blocks
```
DELETE /api/block
```

### Route history
```
GET /api/history
```

### System stats
```
GET /api/stats
```

---

##  Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `find_route` | Client → Server | Request route computation |
| `algo_step` | Server → Client | Live Dijkstra step updates |
| `route_result` | Server → All | Final route broadcast |
| `toggle_block` | Client → Server | Block/unblock a road |
| `block_update` | Server → All | Real-time block sync |
| `clear_blocks` | Client → Server | Clear all blocked roads |

---

##  Features

- **Interactive city map** — 14 nodes, 22 weighted edges
- **Dijkstra's Algorithm** — Full implementation with Min-Heap
- **Algorithm Visualizer** — Step-by-step log with speed control
- **Emergency Mode** — Priority routing for hospital routes
- **Live road blocking** — Click any edge to block/unblock
- **Real-time collaboration** — Socket.IO syncs all clients
- **REST API** — Full backend for data persistence

---


##  Team member names:
Suhani Mahapatra

Shharayu Paatil

Aditya Shinde

