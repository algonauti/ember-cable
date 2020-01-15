import { Server } from 'mock-socket';

function startPing(socket) {
  setTimeout(() => {
    socket.send(JSON.stringify({ type: 'ping', message: new Date().getTime() }));
    startPing(socket)
  }, 3000);
}

function sendWelcomeMessage(socket) {
  socket.send(JSON.stringify({ type: "welcome" }));
}

function processMessage(socket, data) {
  let message = JSON.parse(data);

  if (message.command == 'subscribe') {
    let payload = {
      identifier: message.identifier,
      type: "confirm_subscription"
    }
    socket.send(JSON.stringify(payload));
  } else if (message.command == 'message') {
    let payload = {
      identifier: message.identifier,
      message: { action: 'pong' }
    }
    socket.send(JSON.stringify(payload));
  }
}

export default function() {
  const mockServer = new Server('ws://localhost:4200/cable');

  mockServer.on('connection', socket => {
    sendWelcomeMessage(socket);
    startPing(socket);

    socket.on('message', (data) => {
      processMessage(socket, data)
    });
  });
}