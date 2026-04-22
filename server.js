const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { router: apiRouter, blockedRoads } = require('./routes/api');
const { NODES, EDGES, dijkstra, edgeKey } = require('./dsa/graph');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime().toFixed(1) + 's' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  socket.emit('state', {
    blockedRoads: [...blockedRoads],
    nodes: NODES,
    edges: EDGES,
  });

  socket.on('find_route', ({ src, dst, emergency }) => {
    const result = dijkstra(Number(src), Number(dst), blockedRoads, Boolean(emergency));
    // Emit step-by-step to requester
    result.steps.forEach((step, i) => {
      setTimeout(() => socket.emit('algo_step', step), i * 80);
    });
    setTimeout(() => {
      io.emit('route_result', {
        ...result,
        requestedBy: socket.id.slice(0, 6),
        emergency,
      });
    }, result.steps.length * 80 + 100);
  });

  socket.on('toggle_block', ({ from, to }) => {
    const key = edgeKey(Number(from), Number(to));
    if (blockedRoads.has(key)) blockedRoads.delete(key);
    else blockedRoads.add(key);

    io.emit('block_update', {
      key,
      blocked: blockedRoads.has(key),
      blockedRoads: [...blockedRoads],
      updatedBy: socket.id.slice(0, 6),
    });
    console.log(`[BLOCK] ${key} → ${blockedRoads.has(key) ? 'BLOCKED' : 'OPEN'}`);
  });

  socket.on('clear_blocks', () => {
    blockedRoads.clear();
    io.emit('block_update', { blockedRoads: [], cleared: true });
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  🏙  CityRoute Emergency Planner — Backend');
  console.log(`  ✅  Server running at http://localhost:${PORT}`);
  console.log(`  📡  Socket.IO ready for real-time updates`);
  console.log(`  🗺   REST API: http://localhost:${PORT}/api`);
  console.log('');
  console.log('  API Endpoints:');
  console.log('  GET  /api/graph          — City graph data');
  console.log('  POST /api/route          — Find shortest path');
  console.log('  POST /api/block          — Block/unblock a road');
  console.log('  DELETE /api/block        — Clear all blocks');
  console.log('  GET  /api/history        — Last 20 route searches');
  console.log('  GET  /api/stats          — System stats');
  console.log('');
});
