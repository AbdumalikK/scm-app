import { io } from '../../../server'
import { Chat } from '../models';

const users = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find((user) => user.room === room && user.name === name);

  if(!name || !room) return { error: 'Username and room are required.' };
  if(existingUser) return { error: 'Username is taken.' };

  const user = { id, name, room };

  users.push(user);

  return { user };
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1) return users.splice(index, 1)[0];
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

export const init = () => {
  io.use((socket, next) => {
    console.log('socket id', socket.id)
    if (socket.request) {
      next();
    } else {
      next(new Error("invalid"));
    }
  });

  io.on('connect', (socket) => {
    socket.on('join', async ({ senderId, recipientId }, callback) => {
      console.log(`senderId=${senderId}, recipientId=${recipientId}`)

      let chat = await Chat.findOne({ senderId, recipientId })

      if(!chat){
        chat = await Chat.create({ senderId, recipientId, creatorId: senderId })
      }
      // senderId: 6645b5de344bc0c9aab565d1
      // recipientId: 6645b73afae344ca67ab6327

      // if(true) return callback({ error: 'Username is taken.' });

      socket.join(chat._id);

      console.log('chatId', chat._id)
      socket.emit('message', { user: 'admin', text: `${test1}, welcome to room ${chat._id}.`});
      socket.broadcast.to(chat._id).emit('message', { user: 'admin', text: `${test2} has joined!` });

      // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

      callback();
    });

    socket.on('sendMessage', (message, callback) => {
      const user = getUser(socket.id);

      io.to('').emit('message', { user: user.name, text: message });

      callback();
    });

    socket.on('disconnect', () => {
      const user = removeUser(socket.id);

      if(user) {
        io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
      }
    })
  });  
}