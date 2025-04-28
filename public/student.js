document.addEventListener("DOMContentLoaded", () => {
    const studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const tableBody = document.querySelector("tbody");
    const studentForm = document.getElementById('studentForm');
    const selectAllCheckbox = document.getElementById('selectAll');

    let studentIdCounter = 0;
    const getUserId = document.querySelector("table#list-students tbody tr:last-child"); 
    if (getUserId) studentIdCounter += +getUserId.dataset.id;  
        
    const addEditButtons = document.querySelectorAll(".add-edit-btn");
    addEditButtons.forEach(button => { 
        button.addEventListener('click', addEditBtnClick);
    });
    const deleteButtons = tableBody.querySelectorAll(".delete-btn");
    deleteButtons.forEach(button => {
        button.addEventListener('click', deleteBtnClick);
    })

    function addEditBtnClick(event) {
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
    
    function deleteBtnClick(event){
        const dataId = this.getAttribute('data-id');
            const currentRow = tableBody.querySelector(`tr[data-id="${dataId}"]`);
            const selectedRows = getSelectedRows();

            if (!deleteConfirmModal.dataset) {
                deleteConfirmModal.dataset = {};
            }
            if (selectedRows.length > 0) {
                const names = selectedRows.map(row => row.cells[2].textContent).join(', ');
                document.querySelector('#deleteConfirmModal .student-name').textContent = names;
                deleteConfirmModal.dataset.multiDelete = 'true';
            } else {
                document.querySelector('#deleteConfirmModal .student-name').textContent = currentRow.dataset.firstName + " " + currentRow.dataset.lastName;
                deleteConfirmModal.dataset.multiDelete = 'false';
                deleteConfirmModal.dataset.rowId = currentRow.dataset.id || '';
            }
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
        const getUserId = document.querySelector("table#list-students tbody tr:last-child"); 
        if (getUserId) studentIdCounter += +getUserId.dataset.id;  
    });

    function getSelectedRows() {
        return Array.from(tableBody.querySelectorAll('tr')).filter(row => 
            row.querySelector('input[type="checkbox"]').checked
        );
    }

    function addNewRow(data) {
        const newRow = document.createElement('tr');
        newRow.dataset.id = data.id;
        newRow.dataset.groupId = data.groupId;
        newRow.dataset.genderId = data.genderId;
        newRow.dataset.birthday = data.birthday;
        newRow.dataset.status = data.status;
        newRow.dataset.firstName = data.firstName;
        newRow.dataset.lastName = data.lastName;
    
        const genderShort = data.genderId === '1' ? 'M' : 'F';
        const groupText = document.querySelector(`#group option[value="${data.groupId}"]`).textContent;
    
        newRow.innerHTML = `
            <td><input type="checkbox"></td>
            <td><b>${groupText}</b></td>
            <td><b>${data.firstName} ${data.lastName}</b></td>
            <td>${genderShort}</td>
            <td><b>${data.birthday ? data.birthday.slice(8,10)+'.'+data.birthday.slice(5,7)+'.'+data.birthday.slice(0,4) : ''}</b></td>
            <td><span class="status ${data.status ? 'active' : ''}"></span></td>
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
        row.dataset.status = newData.status;
        row.dataset.firstName = newData.firstName; 
        row.dataset.lastName = newData.lastName;   
            
        row.cells[1].innerHTML = `<b>${document.querySelector(`#group option[value="${newData.groupId}"]`).textContent}</b>`;
        row.cells[2].innerHTML = `<b>${newData.firstName} ${newData.lastName}</b>`;
        row.cells[3].textContent = newData.genderId === '1' ? 'M' : 'F';
        row.cells[4].innerHTML = `<b>${newData.birthday ? newData.birthday.slice(8,10)+'.'+newData.birthday.slice(5,7)+'.'+newData.birthday.slice(0,4) : ''}</b>`;
        row.cells[5].innerHTML = `<span class="status ${newData.status ? 'active' : ''}"></span>`;
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
