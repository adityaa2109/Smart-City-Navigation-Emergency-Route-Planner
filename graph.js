class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent][0] <= this.heap[i][0]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
      if (r < n && this.heap[r][0] < this.heap[smallest][0]) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

const NODES = [
  { id: 0,  name: 'City Hall',   type: 'gov'      },
  { id: 1,  name: 'Hospital A',  type: 'hospital'  },
  { id: 2,  name: 'Market St',   type: 'road'      },
  { id: 3,  name: 'Airport',     type: 'airport'   },
  { id: 4,  name: 'University',  type: 'uni'       },
  { id: 5,  name: 'Downtown',    type: 'road'      },
  { id: 6,  name: 'Park North',  type: 'park'      },
  { id: 7,  name: 'Station',     type: 'station'   },
  { id: 8,  name: 'Hospital B',  type: 'hospital'  },
  { id: 9,  name: 'Westside',    type: 'road'      },
  { id: 10, name: 'Central Sq',  type: 'road'      },
  { id: 11, name: 'Eastgate',    type: 'road'      },
  { id: 12, name: 'South Mall',  type: 'road'      },
  { id: 13, name: 'Suburbs',     type: 'road'      },
];

const EDGES = [
  [0, 1, 4],  [0, 6, 5],  [1, 2, 3],  [1, 6, 4],
  [2, 3, 6],  [2, 5, 4],  [3, 4, 3],  [4, 7, 5],
  [4, 8, 7],  [5, 6, 3],  [5, 7, 4],  [5, 10, 5],
  [6, 9, 6],  [7, 8, 5],  [7, 11, 4], [8, 11, 6],
  [9, 10, 4], [9, 12, 7], [10, 11, 6],[10, 12, 5],
  [11, 13, 5],[12, 13, 6],
];

function edgeKey(a, b) {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

// Build adjacency list
function buildAdjList() {
  const adj = Array.from({ length: NODES.length }, () => []);
  for (const [a, b, w] of EDGES) {
    adj[a].push({ to: b, weight: w });
    adj[b].push({ to: a, weight: w });
  }
  return adj;
}

function dijkstra(src, dst, blockedSet = new Set(), emergency = false) {
  const n = NODES.length;
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const visited = new Array(n).fill(false);
  const steps = [];
  const adj = buildAdjList();

  dist[src] = 0;
  const pq = new MinHeap();
  pq.push([0, src]);

  steps.push({ type: 'init', msg: `Dijkstra started: src=${NODES[src].name}, dst=${NODES[dst].name}` });

  while (!pq.isEmpty()) {
    const [d, u] = pq.pop();
    if (visited[u]) continue;
    visited[u] = true;

    steps.push({ type: 'visit', node: u, dist: d, msg: `Dequeue: ${NODES[u].name} (cost=${d})` });
    if (u === dst) { steps.push({ type: 'found', msg: `Destination reached!` }); break; }

    for (const { to: v, weight } of adj[u]) {
      const key = edgeKey(u, v);
      if (blockedSet.has(key)) {
        steps.push({ type: 'blocked', from: u, to: v, msg: `  Skip: ${NODES[u].name}→${NODES[v].name} (BLOCKED)` });
        continue;
      }

      // Emergency mode: prioritize hospital-connected roads
      let effectiveWeight = weight;
      if (emergency && (NODES[v].type === 'hospital' || NODES[u].type === 'hospital')) {
        effectiveWeight = Math.max(1, weight - 2);
        steps.push({ type: 'priority', msg: `  Priority boost: ${NODES[u].name}→${NODES[v].name}` });
      }

      const newDist = d + effectiveWeight;
      if (newDist < dist[v]) {
        dist[v] = newDist;
        prev[v] = u;
        pq.push([newDist, v]);
        steps.push({ type: 'relax', from: u, to: v, newDist, msg: `  Relax: ${NODES[u].name}→${NODES[v].name} = ${newDist}` });
      }
    }
  }

  // Reconstruct path
  const path = [];
  let cur = dst;
  while (cur !== -1) { path.unshift(cur); cur = prev[cur]; }
  if (path[0] !== src) return { path: [], distance: Infinity, steps, found: false };

  const pathNames = path.map(i => NODES[i].name);
  return { path, pathNames, distance: dist[dst], steps, found: true };
}

module.exports = { NODES, EDGES, dijkstra, edgeKey };