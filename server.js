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


function parseRequestBody(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const parsedBody = body ? JSON.parse(body) : {};
            callback(null, parsedBody);
        } catch (err) {
            callback(err, null);
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

    // API Routes
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

    // Check if file exists and serve it
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

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/student-website', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// MongoDB Schemas
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

// API Handlers
async function handleGetConnectedUsers(res) {
    try {
        const users = await User.find().select('username _id');
        sendJSON(res, 200, users);
    } catch (err) {
        sendJSON(res, 500, { error: err.message });
    }
}

async function handleGetRooms(res) {
    try {
        const rooms = await Room.find().select('name _id');
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
                path: 'senderId',
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
    console.log(`Node.js server running on http://localhost:${PORT}`);
});