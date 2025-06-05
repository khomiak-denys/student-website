const http = require('http');
const url = require('url');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function sendJSON(res, statusCode, data) {
    setCorsHeaders(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function serveStaticFile(res, filePath) {
    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
        } else {
            setCorsHeaders(res);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    if (method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }

    if (pathname.startsWith('/api/')) {
        if (pathname === '/api/connected-users' && method === 'GET') {
            handleGetConnectedUsers(res);
        } else if (pathname === '/api/rooms' && method === 'GET') {
            handleGetRooms(res);
        } else if (pathname.match(/^\/api\/rooms\/[^\/]+\/messages$/) && method === 'GET') {
            const roomId = pathname.split('/')[3];
            handleGetRoomMessages(res, roomId);
        } else {
            sendJSON(res, 404, { error: 'API endpoint not found' });
        }
        return;
    }

    let filePath;
    if (pathname === '/') {
        filePath = path.join(__dirname, 'public', 'index.html');
    } else if (pathname.startsWith('/icons/')) {
        filePath = path.join(__dirname, 'icons', pathname.substring(7));
    } else {
        filePath = path.join(__dirname, 'public', pathname);
    }

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            serveStaticFile(res, filePath);
        }
    });
});

const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

mongoose.connect('mongodb://localhost:27017/student-website').then(() => {
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
    },
    rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }]
});

const messageSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    text: {
        type: String,
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
});

const roomSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    isGeneral: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('User', userSchema);
const Room = mongoose.model('Room', roomSchema);
const Message = mongoose.model('Message', messageSchema);

async function handleGetConnectedUsers(res) {
    try {
        const users = await User.find().select('username _id rooms');
        sendJSON(res, 200, users);
    } catch (err) {
        sendJSON(res, 500, { error: err.message });
    }
}

async function handleGetRooms(res) {
    try {
        const rooms = await Room.find().select('_id');
        sendJSON(res, 200, rooms);
    } catch (err) {
        sendJSON(res, 500, { error: err.message });
    }
}

async function handleGetRoomMessages(res, roomId) {
    try {
        const room = await Room.findById(roomId).populate({
            path: 'messages',
            populate: {
                path: 'senderId receiverId',
                select: 'username'
            }
        });

        if (!room) {
            sendJSON(res, 404, { error: 'Room not found' });
            return;
        }

        const formattedMessages = room.messages.map(msg => ({
            _id: msg._id.toString(),
            senderId: msg.senderId._id.toString(),
            senderName: msg.senderId.username,
            receiverId: msg.receiverId ? msg.receiverId._id.toString() : null,
            receiverName: msg.receiverId ? msg.receiverId.username : null,
            text: msg.text,
            createdAt: msg.createdAt
        }));

        sendJSON(res, 200, formattedMessages);
    } catch (err) {
        sendJSON(res, 500, { error: err.message });
    }
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on(' ', async ({ username }, callback) => {
        try {
            let user = await User.findOne({ username });
            let generalRoom = await Room.findOne({});

            if (!user) {
                user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    username,
                    rooms: []
                });
                await user.save();
            }

            if (!generalRoom) {
                generalRoom = new Room({
                    _id: new mongoose.Types.ObjectId(),
                    messages: []
                });
                await generalRoom.save();
            }

            if (!user.rooms.includes(generalRoom._id)) {
                user.rooms.push(generalRoom._id);
                await user.save();
            }

            socket.userId = user._id;
            socket.username = user.username;
            
            socket.join(generalRoom._id.toString());
            
            const roomUsers = await User.find({ rooms: generalRoom._id }).select('username _id');
            io.to(generalRoom._id.toString()).emit('updateMembers', {
                roomId: generalRoom._id.toString(),
                members: roomUsers.map(member => ({
                    _id: member._id.toString(),
                    username: member.username
                }))
            });

            console.log('User logged in:', socket.userId, 'Username:', socket.username);
            
            callback({
                success: true,
                userId: user._id,
                username: user.username,
                generalRoomId: generalRoom._id
            });
        } catch (err) {
            console.error('Login error:', err);
            callback({ success: false, error: err.message });
        }
    });

    socket.on('getUsers', async (callback) => {
        try {
            const users = await User.find().select('username _id rooms');
            const formattedUsers = users.map(user => ({
                _id: user._id.toString(),
                username: user.username,
                rooms: user.rooms.map(roomId => roomId.toString())
            }));
            callback(formattedUsers);
        } catch (err) {
            console.error('Get users error:', err);
            callback([]);
        }
    });

    socket.on('createPrivateChat', async ({ recipientId }, callback) => {
        try {
            console.log('Creating private chat with recipient:', recipientId, 'for user:', socket.userId);

            if (!socket.userId) {
                throw new Error('User not logged in');
            }

            const recipient = await User.findById(recipientId);
            if (!recipient) {
                throw new Error('Recipient not found');
            }

            const sender = await User.findById(socket.userId);
            const commonRooms = await Room.find({
                _id: { $in: sender.rooms.filter(roomId => recipient.rooms.includes(roomId)) }
            });

            const generalRoom = await Room.findOne({}).sort({ _id: 1 });
            const privateRoom = commonRooms.find(room => !room._id.equals(generalRoom._id));

            let room;
            if (privateRoom) {
                console.log('Found existing private room:', privateRoom._id);
                room = privateRoom;
            } else {
                room = new Room({
                    _id: new mongoose.Types.ObjectId(),
                    messages: []
                });
                await room.save();
                console.log('Created new private room:', room._id);

                sender.rooms.push(room._id);
                recipient.rooms.push(room._id);
                await sender.save();
                await recipient.save();
            }

            socket.join(room._id.toString());
            const recipientSocket = [...io.sockets.sockets.values()]
                .find(s => s.userId && s.userId.toString() === recipientId);
            if (recipientSocket) {
                recipientSocket.join(room._id.toString());
            }

            // Надсилаємо оновлення списку учасників для приватної кімнати
            const roomUsers = await User.find({ rooms: room._id }).select('username _id');
            io.to(room._id.toString()).emit('updateMembers', {
                roomId: room._id.toString(),
                members: roomUsers.map(member => ({
                    _id: member._id.toString(),
                    username: member.username
                }))
            });

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

    socket.on('sendMessage', async ({ roomId, text, receiverId }, callback) => {
        try {
            console.log('Received sendMessage:', { roomId, text, senderId: socket.userId, receiverId });

            if (!socket.userId) {
                const error = 'User not logged in';
                console.error(error);
                if (callback && typeof callback === 'function') {
                    callback({ success: false, error });
                }
                return;
            }

            const room = await Room.findById(roomId);
            if (!room) {
                const error = 'Room not found';
                console.error('Room not found for roomId:', roomId);
                if (callback && typeof callback === 'function') {
                    callback({ success: false, error });
                }
                return;
            }

            if (receiverId) {
                const recipient = await User.findById(receiverId);
                if (!recipient) {
                    const error = 'Recipient not found';
                    console.error(error);
                    if (callback && typeof callback === 'function') {
                        callback({ success: false, error });
                    }
                    return;
                }
            }

            const message = new Message({
                _id: new mongoose.Types.ObjectId(),
                text,
                senderId: socket.userId,
                receiverId: receiverId || null,
                createdAt: new Date()
            });
            await message.save();

            room.messages.push(message._id);
            await room.save();
            console.log('Message saved:', message._id, 'in room:', roomId);

            const sender = await User.findById(socket.userId);
            const receiver = receiverId ? await User.findById(receiverId) : null;

            io.to(roomId).emit('newMessage', {
                roomId,
                senderId: socket.userId,
                senderName: sender.username,
                receiverId: receiverId || null,
                receiverName: receiver ? receiver.username : null,
                text,
                createdAt: message.createdAt
            });
            console.log('Emitted newMessage to room:', roomId);

            if (callback && typeof callback === 'function') {
                callback({ success: true });
            }
        } catch (err) {
            console.error('Error sending message:', err);
            if (callback && typeof callback === 'function') {
                callback({ success: false, error: err.message });
            }
        }
    });

    socket.on('getMessages', async ({ roomId }, callback) => {
        try {
            console.log('Fetching messages for roomId:', roomId);
            const room = await Room.findById(roomId).populate({
                path: 'messages',
                populate: {
                    path: 'senderId receiverId',
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
                receiverId: msg.receiverId ? msg.receiverId._id.toString() : null,
                receiverName: msg.receiverId ? msg.receiverId.username : null,
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
        console.log('User disconnected:', socket.id, 'UserId:', socket.userId);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Node.js server running on http://localhost:${PORT}`);
});