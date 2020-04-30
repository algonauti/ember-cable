import { Server, WebSocket } from 'mock-socket';
import { adapters } from '@rails/actioncable';

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
      message: message.data
    }
    socket.send(JSON.stringify(payload));
  }
}

function createActionCableMockServer(url) {
  const actionCableMockServer = new Server(url);

  actionCableMockServer.on('connection', socket => {
    sendWelcomeMessage(socket);
    startPing(socket);

    socket.on('message', (data) => {
      processMessage(socket, data)
    });
  });
  adapters.WebSocket = WebSocket;
  adapters.actionCableMockServer = actionCableMockServer;
}

export default function() {
  if (adapters.actionCableMockServer) {
    adapters.actionCableMockServer.stop();
    delete adapters.actionCableMockServer;
  }
  createActionCableMockServer('ws://localhost:4200/cable');
}
