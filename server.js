const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.static(path.join(__dirname, 'public')));

// Estado en memoria (simple)
const history = [];
const MAX_HISTORY = 200;

io.on('connection', (socket) => {
  // Enviar historial actual al entrar
  socket.emit('history', history);

  socket.on('message:new', (payload) => {
    const name = String(payload?.name ?? '').trim();
    const text = String(payload?.text ?? '').trim();

    if (!name || !text) return;

    const msg = {
      name,
      text,
      ts: Date.now(),
    };

    history.push(msg);
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);

    io.emit('message:new', msg);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

