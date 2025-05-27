document.addEventListener("DOMContentLoaded", () => {
    const socket = io('http://localhost:3000');

    let currentUserId = null;
    let currentRoomId = null;
    let currentUsername = null;
    let currentRecipientId = null;

    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const chatList = document.querySelector('.chat-list');
    const chatHeader = document.querySelector('#chat-room-title');
    const messageInput = document.getElementById('message-input');
    const messageForm = document.getElementById('message-form');
    const chatMessages = document.querySelector('.chat-messages');
    const membersList = document.getElementById('members-list');
    const profileUsername = document.getElementById('profile-username');

    loginModal.show();

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            socket.emit('login', { username }, (response) => {
                if (response.success) {
                    currentUserId = response.userId;
                    currentUsername = response.username;
                    currentRoomId = response.generalRoomId;
                    profileUsername.textContent = currentUsername;
                    loginModal.hide();
                    loadUsers();
                    loadMessages(currentRoomId);
                    console.log('Logged in successfully:', { currentUserId, currentUsername, currentRoomId });
                } else {
                    alert('Error: ' + response.error);
                }
            });
        }
    });

    function loadUsers() {
        socket.emit('getUsers', (users) => {
            chatList.innerHTML = `
                <a href="#" class="list-group-item list-group-item-action active bg-dark d-flex align-items-center" data-room="${currentRoomId}">
                    <div class="avatar-wrapper bg-dark text-white me-2">
                        <i class="bi bi-people"></i>
                    </div>
                    <span>General</span>
                    <span class="badge bg-danger ms-auto notification-badge d-none">0</span>
                </a>
            `;
            users.forEach((user) => {
                if (user._id !== currentUserId) {
                    const userItem = document.createElement('a');
                    userItem.href = '#';
                    userItem.className = 'list-group-item list-group-item-action bg-dark d-flex align-items-center';
                    userItem.dataset.userId = user._id;
                    userItem.innerHTML = `
                        <div class="avatar-wrapper bg-dark text-white me-2">
                            <i class="bi bi-person"></i>
                        </div>
                        <span>${user.username}</span>
                        <span class="badge bg-danger ms-auto notification-badge d-none">0</span>
                    `;
                    chatList.appendChild(userItem);
                }
            });
            addChatListListeners();
        });
    }

    function addChatListListeners() {
        const chatListItems = document.querySelectorAll('.chat-list .list-group-item');
        chatListItems.forEach((item) => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                chatListItems.forEach((el) => el.classList.remove('active'));
                this.classList.add('active');

                const roomId = this.dataset.room;
                const userId = this.dataset.userId;

                if (roomId) {
                    currentRoomId = roomId;
                    currentRecipientId = null;
                    chatHeader.textContent = 'Chat room General';
                    loadMessages(currentRoomId);
                } else if (userId) {
                    currentRecipientId = userId;
                    socket.emit('createPrivateChat', { recipientId: userId }, (response) => {
                        if (response.success) {
                            currentRoomId = response.roomId;
                            chatHeader.textContent = `Chat with ${response.recipientName}`;
                            this.dataset.room = response.roomId;
                            loadMessages(currentRoomId);
                        } else {
                            alert('Error: ' + response.error);
                        }
                    });
                }

                const badge = this.querySelector('.notification-badge');
                if (badge) {
                    badge.textContent = '0';
                    badge.classList.add('d-none');
                }
            });
        });
    }

    function loadMessages(roomId) {
        chatMessages.innerHTML = '';
        socket.emit('getMessages', { roomId }, (messages) => {
            messages.forEach((msg) => {
                addMessage(msg.text, msg.senderName, msg.senderId === currentUserId);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });

        socket.emit('getUsers', (users) => {
            const roomMembers = users.filter(user => user.rooms.includes(roomId));
            membersList.innerHTML = roomMembers.map(member =>
            `<div class="d-flex flex-column align-items-center mb-1">
                <div class="avatar-wrapper bg-dark text-white mb-1">
                    <i class="bi bi-person"></i>
                </div>
                <span>${member.username}</span>
            </div>`
        ).join('');
        });
    }

    function addMessage(text, sender, isMe) {
        const messageRow = document.createElement('div');
        messageRow.className = isMe
            ? 'message-row d-flex mb-3 justify-content-end'
            : 'message-row d-flex mb-3';
        messageRow.innerHTML = isMe
            ? `
                <div class="message-content bg-dark text-white p-2 rounded">
                    <div class="message-text">${text}</div>
                </div>
                <div class="avatar-wrapper bg-dark text-white ms-2">
                    <i class="bi bi-person"></i>
                </div>
                <div class="message-sender small text-end">Me</div>
            `
            : `
                <div class="avatar-wrapper bg-secondary text-white me-2">
                    <i class="bi bi-person"></i>
                </div>
                <div class="message-sender small text-center me-2">${sender}</div>
                <div class="message-content bg-light p-2 rounded">
                    <div class="message-text">${text}</div>
                </div>
            `;
        chatMessages.appendChild(messageRow);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (text && currentRoomId) {
            const messageData = {
                roomId: currentRoomId,
                text
            };

            if (currentRecipientId) {
                messageData.receiverId = currentRecipientId;
            }

            console.log('Sending message:', messageData);

            socket.emit('sendMessage', messageData, (response) => {
                if (response && !response.success) {
                    console.error('Error sending message:', response.error);
                    alert('Error sending message: ' + response.error);
                }
            });
            messageInput.value = '';
        }
    });

    socket.on('newMessage', ({ roomId, senderId, senderName, text }) => {
        console.log('Received newMessage:', { roomId, senderId, senderName, text });

        if (roomId === currentRoomId) {
            addMessage(text, senderName, senderId === currentUserId);
        } else {
            let chatItem = document.querySelector(`.chat-list .list-group-item[data-room="${roomId}"]`);
            if (!chatItem) {
                chatItem = document.querySelector(`.chat-list .list-group-item[data-user-id="${senderId}"]`);
            }

            if (chatItem) {
                const badge = chatItem.querySelector('.notification-badge');
                let count = parseInt(badge.textContent) || 0;
                badge.textContent = count + 1;
                badge.classList.remove('d-none');
            }
        }
    });

    socket.on('updateMembers', ({ roomId, members }) => {
        if (roomId === currentRoomId) {
            membersList.innerHTML = members.map(member =>
            `<div class="d-flex flex-column align-items-center mb-1">
                <div class="avatar-wrapper bg-dark text-white mb-1">
                    <i class="bi bi-person"></i>
                </div>
                <span>${member.username}</span>
            </div>`
        ).join('');
        }
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        alert('Помилка з\'єднання з сервером. Перевірте підключення.');
    });

    socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
    });
});