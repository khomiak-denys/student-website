document.addEventListener("DOMContentLoaded", () => {
    const studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const tableBody = document.querySelector("tbody");
    const studentForm = document.getElementById('studentForm');
    const selectAllCheckbox = document.getElementById('selectAll');
    let studentIdCounter = 0;

   const tRow =  document.querySelector('tbody').lastElementChild.dataset;
   console.log(tRow);

    Array.from(document.querySelectorAll('tr[data-id]')).map(row => {
        const id = parseInt(row.dataset.id);
        if (!isNaN(id) && id > studentIdCounter) {
            studentIdCounter = id;
        }
        return row;
    });

    Array.from(document.querySelectorAll('.edit-btn')).map((btn, index) => {
        btn.classList.add('form-opener');
        btn.dataset.action = 'edit';
        btn.id = `edit-student-${index}`;
        const row = btn.parentElement.closest('tr');
        if (!row.dataset.id) {
            row.dataset.id = String(++studentIdCounter);
        }
        return btn;
    });

    Array.from(document.querySelectorAll('.delete-btn')).map((btn, index) => {
        btn.id = `delete-student-${index}`;
        return btn;
    });

    document.addEventListener("click", (event) => {
        const formOpener = event.target.closest(".form-opener");
        if (formOpener) {
            if (formOpener.dataset.action === 'add') {
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
                const currentRow = formOpener.parentElement.closest("tr");
                studentForm.dataset.editRowId = currentRow.dataset.id;
                fillFormFromRow(currentRow);
                document.getElementById('studentModalLabel').textContent = 'Edit student';
            }
            
            studentForm.dataset.lastFocused = formOpener.id || '';
            studentModal.show();
        }
        
        const deleteBtn = event.target.closest(".delete-btn");
        if (deleteBtn) {
            const currentRow = deleteBtn.parentElement.closest("tr");
            const selectedRows = getSelectedRows();
            
            if (!deleteConfirmModal.dataset) {
                deleteConfirmModal.dataset = {};
            }
            
            if (selectedRows.length > 0) {
                const names = selectedRows.map(row => row.cells[2].textContent).join(', ');
                document.querySelector('#deleteConfirmModal .student-name').textContent = names;
                deleteConfirmModal.dataset.multiDelete = 'true';
            } else {
                const studentName = currentRow.cells[2].textContent;
                document.querySelector('#deleteConfirmModal .student-name').textContent = studentName;
                deleteConfirmModal.dataset.multiDelete = 'false';
                deleteConfirmModal.dataset.rowId = currentRow.dataset.id || '';
            }
            
            deleteConfirmModal.dataset.lastFocused = deleteBtn.id || '';
            deleteConfirmModal.show();
        }
    });

    selectAllCheckbox.addEventListener('change', () => {
        Array.from(tableBody.querySelectorAll('input[type="checkbox"]')).map(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
            return checkbox;
        });
    });

    document.getElementById('saveStudent').addEventListener('click', () => {
        const formMode = studentForm.dataset.mode;
        
        const studentData = {
            id: formMode === 'add' ? String(studentIdCounter === 0 ? 1 : ++studentIdCounter) : document.getElementById('studentId').value,
            groupId: document.getElementById('group').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            genderId: document.getElementById('gender').value,
            birthday: document.getElementById('birthday').value,
            status: document.getElementById('status').checked
        };

        const serverData = JSON.stringify(studentData);
        console.log(serverData);

        sendToServer(serverData)
                if (formMode === 'edit') {
                    const rowToUpdate = tableBody.querySelector(`tr[data-id="${studentForm.dataset.editRowId}"]`);
                    if (rowToUpdate) {
                        updateRowSelective(rowToUpdate, studentData);
                    }
                } else {
                    addNewRow(studentData);
                }
                studentModal.hide();
                saveToCache(studentData);
    });

    document.getElementById('confirmDelete').addEventListener('click', () => {
        if (deleteConfirmModal.dataset.multiDelete === 'true') {
            getSelectedRows().map(row => row.remove());
            selectAllCheckbox.checked = false;
        } else {
            const rowId = deleteConfirmModal.dataset.rowId;
            if (rowId) {
                const rowToDelete = document.querySelector(`tr[data-id="${rowId}"]`);
                if (rowToDelete) {
                    rowToDelete.remove();
                }
            }
        }
        deleteConfirmModal.hide();
        studentIdCounter = 0;
        Array.from(document.querySelectorAll('tr[data-id]')).map(row => {
            const id = parseInt(row.dataset.id);
            if (!isNaN(id) && id > studentIdCounter) {
                studentIdCounter = id;
            }
            return row;
        });
    });

    document.getElementById('studentModal').addEventListener('hidden.bs.modal', () => {
        const lastFocusedId = studentForm.dataset.lastFocused;
        if (lastFocusedId) {
            const element = document.getElementById(lastFocusedId);
            if (element) element.focus();
        }
    });

    document.getElementById('deleteConfirmModal').addEventListener('hidden.bs.modal', () => {
        const lastFocusedId = deleteConfirmModal.dataset.lastFocused;
        if (lastFocusedId) {
            const element = document.getElementById(lastFocusedId);
            if (element) element.focus();
        }
    });

    function sendToServer(data) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true, message: 'Data saved' }), 500);
        });
    }

    function getSelectedRows() {
        return Array.from(tableBody.querySelectorAll('tr')).filter(row => 
            row.querySelector('input[type="checkbox"]').checked
        );
    }

    function fillFormFromRow(row) {
        const fullName = row.cells[2].textContent.trim();
        const nameParts = fullName.split(' ').filter(part => part.length > 0);
        const firstName = nameParts.slice(0, -1).join(' ');
        const lastName = nameParts[nameParts.length - 1];
        
        document.getElementById('studentId').value = row.dataset.id || '';
        document.getElementById('group').value = row.dataset.groupId || getGroupValueByText(row.cells[1].textContent);
        document.getElementById('firstName').value = firstName || '';
        document.getElementById('lastName').value = lastName || '';
        document.getElementById('gender').value = row.dataset.genderId || getGenderValueByText(row.cells[3].textContent);
        document.getElementById('birthday').value = row.dataset.birthday || convertDateFormat(row.cells[4].textContent);
        document.getElementById('status').checked = row.dataset.status === 'true';
    }

    function getGroupValueByText(text) {
        const cleanText = text.trim();
        const options = Array.from(document.getElementById('group').options);
        const option = options.find(opt => opt.textContent.trim() === cleanText);
        return option ? option.value : options[0].value;
    }

    function getGenderValueByText(text) {
        const cleanText = text.trim();
        return cleanText === 'M' ? '1' : (cleanText === 'F' ? '2' : '1');
    }

    function convertDateFormat(dateStr) {
        if (!dateStr || !dateStr.includes('.')) return '';
        const [day, month, year] = dateStr.split('.');
        return `${year}-${month}-${day}`;
    }

    function addNewRow(data) {
        const newRow = document.createElement('tr');
        newRow.dataset.id = data.id;
        newRow.dataset.groupId = data.groupId;
        newRow.dataset.genderId = data.genderId;
        newRow.dataset.birthday = data.birthday;
        newRow.dataset.status = data.status;
        
        const genderShort = data.genderId === '1' ? 'M' : 'F';
        const groupText = document.querySelector(`#group option[value="${data.groupId}"]`).textContent;
        
        const buttonId = `edit-${data.id}`;
        const deleteId = `delete-${data.id}`;
        
        newRow.innerHTML = `
            <td><input type="checkbox"></td>
            <td><b>${groupText}</b></td>
            <td><b>${data.firstName} ${data.lastName}</b></td>
            <td>${genderShort}</td>
            <td><b>${formatDateForDisplay(data.birthday)}</b></td>
            <td><span class="status ${data.status ? 'active' : ''}"></span></td>
            <td class="align-middle">
                <button id="${buttonId}" class="btn btn-sm btn-outline-secondary azione-btn edit-btn form-opener" data-action="edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button id="${deleteId}" class="btn btn-sm btn-outline-secondary delete-btn">
                    <i class="bi bi-x-lg"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(newRow);
    }

    function updateRowSelective(row, newData) {
        row.dataset.id = newData.id;
        row.dataset.groupId = newData.groupId;
        row.dataset.genderId = newData.genderId;
        row.dataset.birthday = newData.birthday;
        row.dataset.status = newData.status;
        
        const genderShort = newData.genderId === '1' ? 'M' : 'F';
        const groupText = document.querySelector(`#group option[value="${newData.groupId}"]`).textContent;
        
        row.cells[1].innerHTML = `<b>${groupText}</b>`;
        row.cells[2].innerHTML = `<b>${newData.firstName} ${newData.lastName}</b>`;
        row.cells[3].textContent = genderShort;
        row.cells[4].innerHTML = `<b>${formatDateForDisplay(newData.birthday)}</b>`;
        row.cells[5].innerHTML = `<span class="status ${newData.status ? 'active' : ''}"></span>`;
    }

    function formatDateForDisplay(dateStr) {
        if (!dateStr || !dateStr.includes('-')) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}.${month}.${year}`;
    }

    function saveToCache(data) {
        if ('caches' in window) {
            caches.open('student-data-v1').then(cache => {
                const response = new Response(JSON.stringify(data));
                cache.put(`/student-data/${data.id}`, response);
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
        if (window.innerWidth < 992) {
            if (offcanvasHeader && profileWrapper) {
                const closeBtn = offcanvasHeader.querySelector('.btn-close');
                if (closeBtn) {
                    offcanvasHeader.insertBefore(profileWrapper, closeBtn);
                    profileWrapper.style.display = 'flex';
                }
            }
            if (offcanvasBody && sidebarNav) {
                offcanvasBody.appendChild(sidebarNav);
                sidebarNav.style.display = 'flex';
            }
        } else {
            if (navbarContainer && profileWrapper) {
                navbarContainer.appendChild(profileWrapper);
                profileWrapper.style.display = 'flex';
            }
            if (sidebar && sidebarNav) {
                sidebar.appendChild(sidebarNav);
                sidebarNav.style.display = 'flex';
            }
        }
    }

    window.addEventListener("load", moveElements);
    window.addEventListener("resize", moveElements);
    moveElements();
}); 
