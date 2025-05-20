const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost:27017/student-website', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: true,
        unique: true
    }
});

const messageSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    text: {
        type: String,
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const roomSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
});

const User = mongoose.model('User', userSchema);
const Room = mongoose.model('Room', roomSchema);
const Message = mongoose.model('Message', messageSchema);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/icons', express.static(path.join(__dirname, 'icons')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'messages.html'));
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('login', async ({ username }, callback) => {
        try {
            let user = await User.findOne({ username });
            let generalRoom = await Room.findOne({ name: 'General' });
            
            if (!user) {
                user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    username
                });
                await user.save();
            }
            
            if (!generalRoom) {
                generalRoom = new Room({
                    _id: new mongoose.Types.ObjectId(),
                    name: 'General',
                    participants: [],
                    messages: []
                });
                await generalRoom.save();
            }
            
            if (!generalRoom.participants.includes(user._id)) {
                generalRoom.participants.push(user._id);
                await generalRoom.save();
            }
            
            socket.userId = user._id;
            socket.join(generalRoom._id.toString());
            callback({ 
                success: true, 
                userId: user._id, 
                username: user.username,
                generalRoomId: generalRoom._id 
            });
        } catch (err) {
            callback({ success: false, error: err.message });
        }
    });

    socket.on('getUsers', async (callback) => {
        try {
            const users = await User.find({ _id: { $ne: socket.userId } }).select('username _id');
            callback(users);
        } catch (err) {
            callback([]);
        }
    });

    socket.on('createPrivateChat', async ({ recipientId }, callback) => {
    try {
        console.log('Creating private chat with recipient:', recipientId, 'for user:', socket.userId);
        
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            throw new Error('Recipient not found');
        }

        let room = await Room.findOne({
            name: null, 
            participants: { 
                $all: [socket.userId, recipientId], 
                $size: 2 
            }
        });

        if (!room) {
            room = new Room({
                _id: new mongoose.Types.ObjectId(),
                name: null, 
                participants: [socket.userId, recipientId],
                messages: []
            });
            await room.save();
            console.log('Created new private room:', room._id);
        } else {
            console.log('Found existing private room:', room._id);
        }

        socket.join(room._id.toString());
        
        const recipientSocket = [...io.sockets.sockets.values()]
            .find(s => s.userId && s.userId.toString() === recipientId);
        if (recipientSocket) {
            recipientSocket.join(room._id.toString());
        }

        callback({ 
            success: true, 
            roomId: room._id.toString(),
            recipientName: recipient.username 
        });
    } catch (err) {
        console.error('Error creating private chat:', err);
        callback({ success: false, error: err.message });
    }
});

    socket.on('sendMessage', async ({ roomId, text }) => {
        try {
            console.log('Received sendMessage:', { roomId, text, senderId: socket.userId });
            const room = await Room.findById(roomId);
            if (!room) {
                console.error('Room not found for roomId:', roomId);
                throw new Error('Room not found');
            }
            const message = new Message({
                _id: new mongoose.Types.ObjectId(),
                text,
                senderId: socket.userId,
                createdAt: new Date()
            });
            await message.save();
            room.messages.push(message._id);
            await room.save();
            console.log('Message saved:', message._id, 'in room:', roomId);

            const sender = await User.findById(socket.userId);
            io.to(roomId).emit('newMessage', {
                roomId,
                senderId: socket.userId,
                senderName: sender.username,
                text,
                createdAt: message.createdAt
            });
            console.log('Emitted newMessage to room:', roomId);
        } catch (err) {
            console.error('Error sending message:', err);
        }
    });

    socket.on('getMessages', async ({ roomId }, callback) => {
    try {
        console.log('Fetching messages for roomId:', roomId);
        const room = await Room.findById(roomId).populate({
            path: 'messages',
            populate: {
                path: 'senderId',
                select: 'username'
            }
        });
        
        if (!room) {
            console.error('Room not found for roomId:', roomId);
            return callback([]);
        }
        
        console.log('Found messages:', room.messages.length, 'for roomId:', roomId);
        
        const formattedMessages = room.messages.map(msg => ({
            _id: msg._id.toString(),
            senderId: msg.senderId._id.toString(),
            senderName: msg.senderId.username,
            text: msg.text,
            createdAt: msg.createdAt
        }));
        
        callback(formattedMessages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        callback([]);
    }
});

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});