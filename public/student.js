document.addEventListener("DOMContentLoaded", () => {
    const studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const tableBody = document.querySelector("tbody");
    const studentForm = document.getElementById('studentForm');
    const addButton = document.querySelector(".add-btn");
    const selectAllCheckbox = document.getElementById('selectAll');
    
    let isEditing = false;
    let currentRow = null;
    let lastFocusedButton = null;

    if (tableBody) {
        addButton.addEventListener("click", () => {
            isEditing = false;
            studentForm.reset();
            document.getElementById('studentId').value = '';
            document.getElementById('studentModalLabel').textContent = 'Add student';
            lastFocusedButton = addButton;
            studentModal.show();
        });

        // Вибір усіх чекбоксів
        selectAllCheckbox.addEventListener('change', () => {
            const checkboxes = tableBody.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });

        tableBody.addEventListener("click", (event) => {
            const target = event.target.closest("button");
            if (!target) return;

            currentRow = target.closest("tr");
            
            if (target.classList.contains("edit-btn")) {
                isEditing = true;
                fillFormFromRow(currentRow);
                document.getElementById('studentModalLabel').textContent = 'Edit student';
                lastFocusedButton = target;
                studentModal.show();
            }
            
            if (target.classList.contains("delete-btn")) {
                const selectedRows = getSelectedRows();
                if (selectedRows.length > 0) {
                    const names = selectedRows.map(row => row.cells[2].textContent).join(', ');
                    document.querySelector('#deleteConfirmModal .student-name').textContent = names;
                    deleteConfirmModal.show();
                } else {
                    const studentName = currentRow.cells[2].textContent;
                    document.querySelector('#deleteConfirmModal .student-name').textContent = studentName;
                    lastFocusedButton = target;
                    deleteConfirmModal.show();
                }
            }
        });

        // Збереження даних з формуванням рядка для сервера
        document.getElementById('saveStudent').addEventListener('click', () => {
            const studentData = {
                id: document.getElementById('studentId').value || Date.now().toString(),
                group: document.getElementById('group').value,
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
                gender: document.getElementById('gender').value,
                birthday: document.getElementById('birthday').value,
                status: document.getElementById('status').checked ? 'active' : 'inactive'
            };

            // Формування рядка даних для відправки на сервер
            const serverData = JSON.stringify(studentData);
            console.log('Дані для відправки на сервер:', serverData);

            // Імітація відправки на сервер (можна замінити на реальний fetch-запит)
            sendToServer(serverData)
                .then(response => {
                    console.log('Відповідь сервера:', response);
                    if (isEditing && currentRow) {
                        updateRowSelective(currentRow, studentData);
                    } else {
                        addNewRow(studentData);
                    }
                    studentModal.hide();
                    saveToCache(studentData); // Кешування після успішного збереження
                })
                .catch(error => {
                    console.error('Помилка відправки на сервер:', error);
                });
        });

        // Підтвердження видалення
        document.getElementById('confirmDelete').addEventListener('click', () => {
            const selectedRows = getSelectedRows();
            if (selectedRows.length > 0) {
                selectedRows.forEach(row => row.remove());
                selectAllCheckbox.checked = false;
            } else if (currentRow) {
                currentRow.remove();
            }
            deleteConfirmModal.hide();
        });

        // Управління фокусом після закриття модальних вікон
        document.getElementById('studentModal').addEventListener('hidden.bs.modal', () => {
            if (lastFocusedButton) {
                lastFocusedButton.focus();
            }
        });

        document.getElementById('deleteConfirmModal').addEventListener('hidden.bs.modal', () => {
            if (lastFocusedButton) {
                lastFocusedButton.focus();
            }
        });
    }

    // Імітація відправки на сервер
    function sendToServer(data) {
        return new Promise((resolve) => {
            // Тут можна замінити на реальний fetch-запит, наприклад:
            // return fetch('/api/students', { method: 'POST', body: data, headers: { 'Content-Type': 'application/json' } });
            setTimeout(() => resolve({ success: true, message: 'Дані збережено' }), 500);
        });
    }

    // Допоміжна функція для отримання вибраних рядків
    function getSelectedRows() {
        return Array.from(tableBody.querySelectorAll('tr')).filter(row => 
            row.querySelector('input[type="checkbox"]').checked
        );
    }

    // Заповнення форми для редагування
    function fillFormFromRow(row) {
        const [firstName, lastName] = row.cells[2].textContent.split(' ');
        document.getElementById('studentId').value = row.dataset.id || '';
        document.getElementById('group').value = row.cells[1].textContent;
        document.getElementById('firstName').value = firstName || '';
        document.getElementById('lastName').value = lastName || '';
        document.getElementById('gender').value = row.cells[3].textContent;
        document.getElementById('birthday').value = row.cells[4].textContent.split('.').reverse().join('-');
        document.getElementById('status').checked = row.cells[5].querySelector('.status').classList.contains('active');
    }

    // Додавання нового рядка
    function addNewRow(data) {
        const newRow = document.createElement('tr');
        newRow.dataset.id = data.id;
        newRow.innerHTML = `
            <td><input type="checkbox"></td>
            <td><b>${data.group}</b></td>
            <td><b>${data.name}</b></td>
            <td>${data.gender}</td>
            <td><b>${formatDateForDisplay(data.birthday)}</b></td>
            <td><span class="status ${data.status}"></span></td>
            <td class="align-middle">
                <button class="btn btn-sm btn-outline-secondary action-btn edit-btn">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary delete-btn">
                    <i class="bi bi-x-lg"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(newRow);
    }

    // Оновлення тільки змінених даних
    function updateRowSelective(row, newData) {
        const oldData = {
            group: row.cells[1].textContent,
            name: row.cells[2].textContent,
            gender: row.cells[3].textContent,
            birthday: row.cells[4].textContent,
            status: row.cells[5].querySelector('.status').classList.contains('active') ? 'active' : 'inactive'
        };

        if (oldData.group !== newData.group) row.cells[1].innerHTML = `<b>${newData.group}</b>`;
        if (oldData.name !== newData.name) row.cells[2].innerHTML = `<b>${newData.name}</b>`;
        if (oldData.gender !== newData.gender) row.cells[3].textContent = newData.gender;
        if (oldData.birthday !== formatDateForDisplay(newData.birthday)) {
            row.cells[4].innerHTML = `<b>${formatDateForDisplay(newData.birthday)}</b>`;
        }
        if (oldData.status !== newData.status) {
            row.cells[5].innerHTML = `<span class="status ${newData.status}"></span>`;
        }
    }

    // Форматування дати
    function formatDateForDisplay(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${day}.${month}.${year}`;
    }

    // PWA кешування
    function saveToCache(data) {
        if ('caches' in window) {
            caches.open('student-data-v1').then(cache => {
                const response = new Response(JSON.stringify(data));
                cache.put(`/student-data/${data.id}`, response); // Унікальний ключ для кожного студента
            });
        }
    }

    // Адаптивність
    const profileWrapper = document.querySelector('.profile-wrapper');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const offcanvasHeader = document.querySelector('.offcanvas-header');
    const offcanvasBody = document.querySelector('.offcanvas-body');
    const navbarContainer = document.querySelector('.navbar .container-fluid');
    const sidebar = document.querySelector('.sidebar');

    function moveElements() {
        if (window.innerWidth < 992) {
            offcanvasHeader.insertBefore(profileWrapper, offcanvasHeader.querySelector('.btn-close'));
            profileWrapper.style.display = 'flex';
            offcanvasBody.appendChild(sidebarNav);
            sidebarNav.style.display = 'flex';
        } else {
            navbarContainer.appendChild(profileWrapper);
            profileWrapper.style.display = 'flex';
            sidebar.appendChild(sidebarNav);
            sidebarNav.style.display = 'flex';
        }
    }

    window.addEventListener("load", moveElements);
    window.addEventListener("resize", moveElements);
    moveElements();
});