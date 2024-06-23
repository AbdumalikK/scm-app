import { io } from '../../../server'
import { Chat } from '../models'
import { Message } from '../../message/models'
import { User } from '../../user/models';

export const init = () => {
  io.use((socket, next) => {
    if (socket.request) {
      next();
    } else {
      next(new Error("invalid"));
    }
  });

  io.on('connect', (socket) => {
    socket.on('join', async ({ senderId, recipientId }, callback) => {
      console.log(`senderId=${senderId}, recipientId=${recipientId}`)

      const chat = await Chat.findOne({ $or: [{ senderId, recipientId }, { senderId: recipientId, recipientId: senderId }] })

      if(!chat){
        chat = await Chat.create({ senderId, recipientId, creatorId: senderId })
      }
      // senderId: 664d9de76bf5734214fc966d
      // recipientId: 664d9de86bf5734214fc9678
      
      socket.join(chat._id.toString())
      const sender = await User.findById(senderId)
      const recipient = await User.findById(recipientId)

      io.to(chat._id.toString()).emit('roomData', { room: chat._id, users: [sender, recipient] });

      callback();
    });

    socket.on('message', async ({ message, senderId, recipientId = null}, callback) => {
      const chat = await Chat.findOne({ $or: [{ senderId, recipientId }, { senderId: recipientId, recipientId: senderId }] })

      if(!chat){
        chat = await Chat.create({ senderId, recipientId, creatorId: senderId })
      }

      await Message.create({ senderId, recipientId, chatId: chat._id, 'message.payload': message, creatorId: senderId })

      const sender = await User.findById(senderId)
      io.to(chat._id.toString()).emit('message', { user: sender.username, text: message });

      callback();
    });

    socket.on('disconnect', () => {
      // socket.id

      // if(user) {
      //   io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      //   io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
      // }
    })

    setInterval(async () => {
      const { senderId } = socket.data 

      const messagesUnreadCount = await Message.countDocuments({ senderId, active: true, deletedAt: { $eq: null }  }).exec()
      
      socket.emit('messages', { messagesUnreadCount });
    }, 10000);

    setInterval(async () => {
      const { senderId } = socket.data 

      const messagesUnreadCount = await Message.countDocuments({ senderId, active: true, deletedAt: { $eq: null }  }).exec()
      
      socket.emit('messages', { messagesUnreadCount });
    }, 10000);
  });
}