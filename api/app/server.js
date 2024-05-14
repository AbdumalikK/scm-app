import async_redis from 'async-redis'
import path from 'path'
import fs from 'fs'
import http from 'http'
import socketIO from 'socket.io'

import app from './app'
import { PORT, REDIS_PORT, ERRORS, errors } from './config'
import logger from './utils/logs/logger'

// directories
const imagesDir = path.resolve(path.join(process.cwd() + '/uploads/images'))
const videosDir = path.resolve(path.join(process.cwd() + '/uploads/videos'))
const logsDir = path.resolve(path.join(process.cwd() + '/logs'))

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })

if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true })

if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })


// redis
const client = async_redis.createClient(REDIS_PORT)

client.on('error', function(error) {
	logger.error(`Redis error. ${error}`)

	throw new Error(error)
});

client.set(Object.keys(errors)[0], JSON.stringify(ERRORS))


// server
const server = http.createServer(app.callback())

server.listen(PORT, (err) => {
	if (err) logger.error(err);

	console.log(`Listening at http://localhost:${PORT}`);
});



// socket io
const io = socketIO(server, {
	origins: '*:*' 
})

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



io.on('connection', (socket) => {
	socket.on('join', ({ name, room }, callback) => {
	  const { error, user } = addUser({ id: socket.id, name, room });
  
	  if(error) return callback(error);
  
	  socket.join(user.room);
  
	  socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
	  socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
  
	  io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
  
	  callback();
	});
  
	socket.on('sendMessage', (message, callback) => {
	  const user = getUser(socket.id);
  
	  io.to(user.room).emit('message', { user: user.name, text: message });
  
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



export default server;

export { client, io }