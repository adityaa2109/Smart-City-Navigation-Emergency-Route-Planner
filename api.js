const express = require('express');
const router = express.Router();
const { NODES, EDGES, dijkstra, edgeKey } = require('../dsa/graph');

let blockedRoads = new Set();
let routeHistory = [];

router.get('/graph', (req, res) => {
  res.json({
    nodes: NODES,
    edges: EDGES.map(([a, b, w]) => ({ from: a, to: b, weight: w, key: edgeKey(a, b) })),
    blockedRoads: [...blockedRoads],
  });
});

router.post('/route', (req, res) => {
  const { src, dst, emergency = false } = req.body;

  if (src === undefined || dst === undefined)
    return res.status(400).json({ error: 'src and dst are required' });

  if (src < 0 || src >= NODES.length || dst < 0 || dst >= NODES.length)
    return res.status(400).json({ error: 'Invalid node IDs' });

  if (src === dst)
    return res.status(400).json({ error: 'Source and destination must be different' });

  const result = dijkstra(Number(src), Number(dst), blockedRoads, emergency);

  const entry = {
    id: Date.now(),
    src: NODES[src].name,
    dst: NODES[dst].name,
    emergency,
    distance: result.distance,
    path: result.pathNames,
    found: result.found,
    timestamp: new Date().toISOString(),
  };
  routeHistory.unshift(entry);
  if (routeHistory.length > 20) routeHistory.pop(); // keep last 20

  res.json({
    ...result,
    blockedRoads: [...blockedRoads],
    meta: { nodesExplored: result.steps.filter(s => s.type === 'visit').length },
  });
});

router.post('/block', (req, res) => {
  const { from, to } = req.body;
  if (from === undefined || to === undefined)
    return res.status(400).json({ error: 'from and to are required' });

  const key = edgeKey(Number(from), Number(to));
  let action;
  if (blockedRoads.has(key)) {
    blockedRoads.delete(key);
    action = 'unblocked';
  } else {
    blockedRoads.add(key);
    action = 'blocked';
  }

  res.json({ key, action, blockedRoads: [...blockedRoads] });
});

router.delete('/block', (req, res) => {
  blockedRoads.clear();
  res.json({ message: 'All roads cleared', blockedRoads: [] });
});

router.get('/history', (req, res) => {
  res.json({ history: routeHistory });
});

router.get('/stats', (req, res) => {
  res.json({
    totalNodes: NODES.length,
    totalEdges: EDGES.length,
    blockedRoads: blockedRoads.size,
    routesComputed: routeHistory.length,
    emergencyRoutes: routeHistory.filter(r => r.emergency).length,
  });
});

module.exports = { router, blockedRoads };