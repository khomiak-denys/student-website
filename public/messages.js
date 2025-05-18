document.addEventListener("DOMContentLoaded", () => {

    const chatListItems = document.querySelectorAll('.chat-list .list-group-item');
    const chatHeader = document.querySelector('.chat-header h5');
    const messageInput = document.querySelector('.message-input-section input');
    const messageForm = document.querySelector('.message-input-section form');
    const chatMessages = document.querySelector('.chat-messages');

    // Обробник кліку на елементи списку чатів
    chatListItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Виділення активного чату
            chatListItems.forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            
            // Оновлення заголовка чату
            const chatName = this.querySelector('span').textContent;
            chatHeader.textContent = 'Chat room ' + chatName;
            
        });
    });

    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const messageText = messageInput.value.trim();
        if (messageText) {
            // Додавання нового повідомлення в чат
            addMessage(messageText, 'me');
            messageInput.value = '';
        }
    });

    function addMessage(text, sender) {
        const messageRow = document.createElement('div');
        messageRow.className = sender === 'me' ? 
            'message-row d-flex mb-3 justify-content-end' : 
            'message-row d-flex mb-3';
        
        if (sender === 'me') {
            messageRow.innerHTML = `
                <div class="message-content bg-primary text-white p-2 rounded">
                    <div class="message-text">${text}</div>
                </div>
                <div class="avatar-wrapper bg-secondary text-white ms-2">
                    <i class="bi bi-person"></i>
                </div>
                <div class="message-sender small text-end">Me</div>
            `;
        } else {
            messageRow.innerHTML = `
                <div class="avatar-wrapper bg-secondary text-white me-2">
                    <i class="bi bi-person"></i>
                </div>
                <div class="message-content bg-light p-2 rounded">
                    <div class="message-sender small">${sender}</div>
                    <div class="message-text">${text}</div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageRow);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    const notificationWrapper = document.querySelector('.notification-wrapper');
    if (notificationWrapper) {
        // CSS для показу dropdown при наведенні вже повинен бути доданий у стилі
        
        // Додавання посилання на сторінку повідомлень при кліку на дзвоник
        const bellIcon = notificationWrapper.querySelector('.nav-link');
        if (bellIcon) {
            bellIcon.setAttribute('href', 'messages.html');
            
            // Запобігання закриттю dropdown при кліку на його елементи
            const dropdownMenu = notificationWrapper.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }
        }
    }

    const profileWrapper = document.querySelector('.profile-wrapper');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const offcanvasHeader = document.querySelector('.offcanvas-header');
    const offcanvasBody = document.querySelector('.offcanvas-body');
    const navbarContainer = document.querySelector('.navbar .container-fluid');
    const sidebar = document.querySelector('.sidebar');

    function moveElements() {
        if (!profileWrapper || !sidebarNav || !navbarContainer || !sidebar || !offcanvasHeader || !offcanvasBody) {
            return; // Перериваємо виконання, якщо елементи відсутні
        }

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

    window.addEventListener("load", moveElements);
    window.addEventListener("resize", moveElements);
    moveElements();
});

