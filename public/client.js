(() => {
  const socket = io();

  const statusEl = document.getElementById('status');
  const messagesEl = document.getElementById('messages');
  const formEl = document.getElementById('form');
  const nameEl = document.getElementById('name');
  const messageEl = document.getElementById('message');

  function formatTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;') // Corregido el reemplazo para que escape bien visualmente
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || '?';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (first + last).toUpperCase();
  }

  function addMessage({ name, text, ts }) {
    const div = document.createElement('div');
    
    // --- NUEVA LÓGICA DE ALINEACIÓN ---
    // Compara el nombre del mensaje con el nombre actual en tu input
    const miNombre = (nameEl.value || '').trim();
    if (name === miNombre && miNombre !== '') {
      div.className = 'msg msg-me';       // Tus mensajes (Derecha)
    } else {
      div.className = 'msg msg-others';   // Mensajes de otros (Izquierda)
    }
    // ----------------------------------

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = initials(name);

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const meta = document.createElement('div');
    meta.className = 'meta';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = name;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'time';
    timeSpan.textContent = formatTime(ts);

    meta.appendChild(nameSpan);
    meta.appendChild(timeSpan);

    const textDiv = document.createElement('div');
    textDiv.className = 'text';
    textDiv.innerHTML = escapeHtml(text);

    bubble.appendChild(meta);
    bubble.appendChild(textDiv);

    div.appendChild(avatar);
    div.appendChild(bubble);

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  socket.on('connect', () => {
    statusEl.textContent = 'Conectado ✅';
  });

  socket.on('disconnect', () => {
    statusEl.textContent = 'Desconectado ❌';
  });

  socket.on('message:new', (payload) => {
    addMessage(payload);
  });

  socket.on('history', (history) => {
    messagesEl.innerHTML = '';
    for (const item of history) addMessage(item);
  });

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (nameEl.value || '').trim();
    const text = (messageEl.value || '').trim();

    if (!name || !text) return;

    socket.emit('message:new', { name, text });
    messageEl.value = '';
    messageEl.focus();
  });
})();