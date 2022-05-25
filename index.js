import { Server } from 'socket.io';

const PORT = 8080;

const server = new Server({
  cors: {
    origin: '*'
  }
});
const sockets = new Map();

server.on('connection', (socket) => {
  // refuse third connection
  if (sockets.size === 2) {
    socket.disconnect();
  } else {
    // connect
    sockets.set(socket.id, socket);
    console.log(`socket(${socket.id}) connect`);
    // disconnect
    socket.on('disconnect', (reason) => {
      console.log(`socket(${socket.id}) disconnect: ${reason}`);
      sockets.delete(socket.id);
    });
    // transfer signaling message
    socket.on('msg', (data) => {
      // find another socket
      const socketIdList = sockets.keys();
      let anotherSocketId = '';
      for (const sid of socketIdList)
        if (sid !== socket.id) {
          anotherSocketId = sid;
          break;
        }
      // send to another socket
      if (anotherSocketId !== '') {
        console.log(
          `socket(${socket.id}) => socket(${anotherSocketId}): ${JSON.stringify(
            data
          )}`
        );
        sockets.get(anotherSocketId).emit('msg', data);
      }
    });
  }
});

server.listen(PORT);

console.log(`signaling server listen on http://localhost:${PORT}`);
