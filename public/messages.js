document.addEventListener("DOMContentLoaded", () => {

    const serverUrl = typeof nodeServerUrl !== 'undefined' ? nodeServerUrl : 'http://localhost:3000';
    const socket = io(serverUrl);
    
    let currentUserId = null;
    let currentRoomId = null;
    let currentUsername = null;

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

    const savedUsername = localStorage.getItem('chatUsername');
    
    if (savedUsername) {
        usernameInput.value = savedUsername;
    }
    
    loginModal.show();

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem('chatUsername', username);
            
            socket.emit('login', { username }, (response) => {
                if (response.success) {
                    currentUserId = response.userId;
                    currentUsername = response.username;
                    currentRoomId = response.generalRoomId;
                    profileUsername.textContent = currentUsername;
                    loginModal.hide();
                    loadUsers();
                    loadMessages(currentRoomId);
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

                console.log('Chat clicked, roomId:', roomId, 'userId:', userId);

                if (roomId) {
                    currentRoomId = roomId;
                    chatHeader.textContent = this.querySelector('span').textContent === 'General' 
                        ? 'Chat room General' 
                        : `Chat with ${this.querySelector('span').textContent}`;
                    loadMessages(currentRoomId);
                } else {
                    socket.emit('createPrivateChat', { recipientId: userId }, (response) => {
                        if (response.success) {
                            currentRoomId = response.roomId;
                            chatHeader.textContent = `Chat with ${response.recipientName}`;
                            this.dataset.room = response.roomId;
                            
                            delete this.dataset.userId;
                            console.log('Private chat created, roomId:', response.roomId);
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
            // Прокручування вниз до останнього повідомлення
            chatMessages.scrollTop = chatMessages.scrollHeight;
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
            socket.emit('sendMessage', { roomId: currentRoomId, text });
            messageInput.value = '';
        } else {
            console.log('Cannot send message: text or roomId missing', { text, currentRoomId });
        }
    });

    socket.on('newMessage', ({ roomId, senderId, senderName, text }) => {
        if (roomId === currentRoomId) {
            addMessage(text, senderName, senderId === currentUserId);
        } else {
            const chatItem = document.querySelector(`.chat-list .list-group-item[data-room="${roomId}"]`) ||
                             document.querySelector(`.chat-list .list-group-item[data-user-id="${senderId}"]`);
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
            membersList.innerHTML = members
                .map(() => `
                    <div class="avatar-wrapper bg-secondary text-white me-2">
                        <i class="bi bi-person"></i>
                    </div>
                `)
                .join('');
        }
    });

    const profileWrapper = document.querySelector('.profile-wrapper');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const offcanvasHeader = document.querySelector('.offcanvas-header');
    const offcanvasBody = document.querySelector('.offcanvas-body');
    const navbarContainer = document.querySelector('.navbar .container-fluid');
    const sidebar = document.querySelector('.sidebar');

    function moveElements() {
        if (!profileWrapper || !sidebarNav || !navbarContainer || !sidebar || !offcanvasHeader || !offcanvasBody) return;
        if (window.innerWidth < 992) {
            const closeBtn = offcanvasHeader.querySelector('.btn-close');
            if (closeBtn && !offcanvasHeader.contains(profileWrapper)) {
                offcanvasHeader.insertBefore(profileWrapper, closeBtn);
                profileWrapper.style.display = 'flex';
            }
            if (!offcanvasBody.contains(sidebarNav)) {
                offcanvasBody.appendChild(sidebarNav);
                sidebarNav.style.display = 'flex';
            }
        } else {
            if (!navbarContainer.contains(profileWrapper)) {
                navbarContainer.appendChild(profileWrapper);
                profileWrapper.style.display = 'flex';
            }
            if (!sidebar.contains(sidebarNav)) {
                sidebar.appendChild(sidebarNav);
                sidebarNav.style.display = 'flex';
            }
        }
    }

    window.addEventListener('load', moveElements);
    window.addEventListener('resize', moveElements);
    moveElements();
});