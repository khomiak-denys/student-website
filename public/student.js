document.addEventListener("DOMContentLoaded", () => {
    const studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const tableBody = document.querySelector("tbody");
    const studentForm = document.getElementById('studentForm');
    const selectAllCheckbox = document.getElementById('selectAll');

    const addEditButtons = document.querySelectorAll(".add-edit-btn");
    addEditButtons.forEach(button => {
        button.addEventListener('click', addEditBtnClick);
    });
    const deleteButtons = tableBody.querySelectorAll(".delete-btn");
    deleteButtons.forEach(button => {
        button.addEventListener('click', deleteBtnClick);
    });

    function addEditBtnClick(event) {
        document.querySelectorAll('#studentForm .form-control, #studentForm .form-select').forEach(field => {
            field.classList.remove('error-field');
        });
        const dataId = this.getAttribute('data-id');

        if (dataId === '0') {
            studentForm.dataset.mode = 'add';
            document.getElementById('studentModalLabel').textContent = 'Add student';
            document.getElementById('studentId').value = '';
            document.getElementById('group').value = '';
            document.getElementById('firstName').value = '';
            document.getElementById('lastName').value = '';
            document.getElementById('gender').value = '';
            document.getElementById('birthday').value = '';
            document.getElementById('status').checked = false;
        } else {
            studentForm.dataset.mode = 'edit';
            studentForm.dataset.editRowId = dataId;

            const row = tableBody.querySelector(`tr[data-id="${dataId}"]`);
            if (!row.dataset.id) {
                console.error('ID рядка не знайдено');
                return;
            }
            document.getElementById('studentId').value = row.dataset.id || '';
            document.getElementById('group').value = row.dataset.groupId || '';
            document.getElementById('firstName').value = row.dataset.firstName || '';
            document.getElementById('lastName').value = row.dataset.lastName || '';
            document.getElementById('gender').value = row.dataset.genderId || '';
            document.getElementById('birthday').value = row.dataset.birthday || '';
            document.getElementById('status').checked = row.dataset.status === 'true';

            document.getElementById('studentModalLabel').textContent = 'Edit student';
        }
        studentModal.show();
    }

    function deleteBtnClick(event) {
        const dataId = this.getAttribute('data-id');
        const currentRow = tableBody.querySelector(`tr[data-id="${dataId}"]`);

        if (!deleteConfirmModal.dataset) {
            deleteConfirmModal.dataset = {};
        }
        document.querySelector('#deleteConfirmModal .student-name').textContent = currentRow.dataset.firstName + " " + currentRow.dataset.lastName;
        deleteConfirmModal.dataset.multiDelete = 'false';
        deleteConfirmModal.dataset.rowId = currentRow.dataset.id || '';
        deleteConfirmModal.show();
    }

    selectAllCheckbox.addEventListener('change', () => {
        Array.from(tableBody.querySelectorAll('input[type="checkbox"]')).map(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
            return checkbox;
        });
    });

    document.getElementById('saveStudent').addEventListener('click', () => {
        const formMode = studentForm.dataset.mode;

        const studentData = {
            groupId: document.getElementById('group').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            genderId: document.getElementById('gender').value,
            birthday: document.getElementById('birthday').value,
            status: document.getElementById('status').checked
        };
        

        if (formMode === 'edit') {
            studentData.id = document.getElementById('studentId').value;
        }

        const formData = new URLSearchParams();
        formData.append('data', JSON.stringify(studentData));

        console.log('Sent to server:', Object.fromEntries(formData));

        fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            if (data.error) {
                const fieldMap = {
                    'field groupid required': 'group',
                    'field firstname required': 'firstName',
                    'field lastname required': 'lastName',
                    'field genderid required': 'gender',
                    'field birthday required': 'birthday',
                    'field status required': 'status',
                    'invalid group id': 'group',
                    'invalid first name': 'firstName',
                    'invalid last name': 'lastName',
                    'invalid gender': 'gender',
                    'invalid birthday': 'birthday',
                    'invalid status': 'status',
                    'invalid student id': 'studentId',
                    'student not found': 'studentId'
                };
                const fieldId = fieldMap[data.error.toLowerCase()];
                if (fieldId) {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.classList.add('error-field');
                    }
                }
            } else {
                if (formMode === 'edit') {
                    const rowToUpdate = tableBody.querySelector(`tr[data-id="${studentForm.dataset.editRowId}"]`);
                    if (rowToUpdate) {
                        updateRowSelective(rowToUpdate, data.data);
                        saveToCache(data.data);
                    }
                } else {
                    addNewRow(data.data);
                    saveToCache(data.data);
                }
                studentModal.hide();
            }
        })
        .catch(error => {
            console.error('Data send error:', error);
        });
    });

    document.getElementById('confirmDelete').addEventListener('click', () => {
        const rowId = deleteConfirmModal.dataset.rowId;
        if (!rowId) {
            console.error('ID not selected');
            return;
        }

        const formData = new URLSearchParams();
        formData.append('action', 'delete');
        formData.append('id', rowId);

        console.log('Sent for deletion:', Object.fromEntries(formData));

        fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            if (data.error) {
                console.error('Delete error:', data.error);
            } else {
                const rowToDelete = document.querySelector(`tr[data-id="${rowId}"]`);
                if (rowToDelete) {
                    rowToDelete.remove();
                }
                if('caches' in window){
                    caches.open('student-data-v1').then(cache => {
                        cache.delete(`/student-data/${rowId}`).then(() => {
                        });
                    }).catch(error => {
                    });
                }
                deleteConfirmModal.hide();
            }
        })
        .catch(error => {
            console.log('Delete error:', error);
        });
    });

        function addNewRow(data) {
            const newRow = document.createElement('tr');
            newRow.dataset.id = data.id;
            newRow.dataset.groupId = data.groupId;
            newRow.dataset.genderId = data.genderId;
            newRow.dataset.birthday = data.birthday;
            newRow.dataset.status = String(data.status);
            newRow.dataset.firstName = data.firstName;
            newRow.dataset.lastName = data.lastName;

            const groupText = document.querySelector(`#group option[value="${data.groupId}"]`)?.textContent || '';
            const genderText = document.querySelector(`#gender option[value="${data.genderId}"]`)?.textContent || '';
            const formattedDate = data.birthday ?
                new Date(data.birthday).toLocaleDateString('uk-UA', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).replace(/\//g, '.') : '';

            newRow.innerHTML = `
                <td><input type="checkbox"></td>
                <td><b>${groupText}</b></td>
                <td><b>${data.firstName} ${data.lastName}</b></td>
                <td><b>${genderText}</b></td>
                <td><b>${formattedDate}</b></td>
                <td><span class="status ${data.status === true ? 'active' : ''}"></span></td>
                <td class="align-middle">
                    <button class="btn btn-sm btn-outline-primary add-edit-btn" data-id="${data.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary delete-btn" data-id="${data.id}">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(newRow);

            newRow.querySelector('.add-edit-btn').addEventListener('click', addEditBtnClick);
            newRow.querySelector('.delete-btn').addEventListener('click', deleteBtnClick);
        }

    function updateRowSelective(row, newData) {
        row.dataset.id = newData.id;
        row.dataset.groupId = newData.groupId;
        row.dataset.genderId = newData.genderId;
        row.dataset.birthday = newData.birthday;
        row.dataset.status = String(newData.status);
        row.dataset.firstName = newData.firstName;
        row.dataset.lastName = newData.lastName;

        const formattedDate = newData.birthday ?
            new Date(newData.birthday).toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '.') : '';

        const genderText = document.querySelector(`#gender option[value="${newData.genderId}"]`)?.textContent || '';
        const genderDisplay = genderText === 'Male' ? 'M' : genderText === 'Female' ? 'F' : genderText;

        row.cells[1].innerHTML = `<b>${document.querySelector(`#group option[value="${newData.groupId}"]`)?.textContent || ''}</b>`;
        row.cells[2].innerHTML = `<b>${newData.firstName} ${newData.lastName}</b>`;
        row.cells[3].innerHTML = `<b>${genderDisplay}</b>`;
        row.cells[4].innerHTML = `<b>${formattedDate}</b>`;
        row.cells[5].innerHTML = `<span class="status ${newData.status === true ? 'active' : ''}"></span>`;
    }

    function saveToCache(data) {
        if ('caches' in window) {
            caches.open('student-data-v1').then(cache => {
                const response = new Response(JSON.stringify(data));
                cache.put(`/student-data/${data.id}`, response);
            }).catch(error => {
                console.error('Cache error:', error);
            });
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