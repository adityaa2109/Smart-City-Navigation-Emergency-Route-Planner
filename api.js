module.exports = (() => {
  const blockedRoads = new Set();
  const routeHistory = [];

  const router = require('express').Router();

  router.get('/graph', (req, res) => {
    const { NODES, EDGES } = require('../dsa/graph');
    res.json({
      nodes: NODES,
      edges: EDGES,
      blockedRoads: [...blockedRoads],
    });
  });

  router.post('/route', (req, res) => {
    const { src, dst, emergency } = req.body;
    const { dijkstra } = require('../dsa/graph');

    if (!src || !dst) {
      return res.status(400).json({ error: 'src and dst required' });
    }

    const result = dijkstra(Number(src), Number(dst), blockedRoads, Boolean(emergency));
    routeHistory.push({
      src,
      dst,
      emergency,
      timestamp: new Date(),
      distance: result.distance,
    });

    res.json(result);
  });

  // POST /api/block — Block a road
  router.post('/block', (req, res) => {
    const { from, to } = req.body;
    const { edgeKey } = require('../dsa/graph');
    const key = edgeKey(Number(from), Number(to));
    blockedRoads.add(key);
    res.json({ blocked: true, key });
  });

  router.delete('/block', (req, res) => {
    blockedRoads.clear();
    res.json({ cleared: true, blockedRoads: [] });
  });

  router.get('/history', (req, res) => {
    res.json(routeHistory.slice(-20));
  });

  router.get('/stats', (req, res) => {
    const { NODES, EDGES } = require('../dsa/graph');
    res.json({
      totalNodes: NODES.length,
      totalEdges: EDGES.length,
      blockedRoads: blockedRoads.size,
      routeSearches: routeHistory.length,
    });
  });

  return { router, blockedRoads };
})();