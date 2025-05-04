document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("tbody");
        
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

            let studentIdCounter = 0;
            const getUserId = document.querySelector("table#list-students tbody tr:last-child"); 
            if (getUserId) studentIdCounter += +getUserId.dataset.id;

            const newRow = document.createElement('tr');
            newRow.setAttribute('data-id', ++studentIdCounter);
            newRow.setAttribute('data-group-id', '3');
            newRow.setAttribute('data-first-name', 'John');
            newRow.setAttribute('data-last-name', 'Doe');
            newRow.setAttribute('data-gender-id', '1');
            newRow.setAttribute('data-birthday', '1001-01-01');
            newRow.setAttribute('data-status', 'false');
            newRow.innerHTML = `
                <td><input type="checkbox"></td>
                <td><b>PZ-23</b></td>
                <td><b>John Doe</b></td>
                <td>M</td>
                <td><b>01.01.1001</b></td>
                <td><span class="status inactive"></span></td>
                <td class="align-middle">
                    <button class="btn btn-sm btn-outline-primary add-edit-btn" data-id="${studentIdCounter}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary delete-btn" data-id="${studentIdCounter}">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(newRow);
            newRow.querySelector('.add-edit-btn').addEventListener('click', addEditBtnClick);
            newRow.querySelector('.delete-btn').addEventListener('click', deleteBtnClick); 
        } else {
            const row = tableBody.querySelector(`tr[data-id="${dataId}"]`);

            row.dataset.firstName = "Jane"; 
            row.dataset.lastName = "Doe"; 
            row.dataset.birthday = "2005-06-15"; 
            row.dataset.genderId = "2";
            row.dataset.status = "false"; 

            const groupCell = row.querySelector("td:nth-child(2)");
            groupCell.innerHTML = `<b>PZ-23</b>`; // Група (можна оновити, якщо є дані)
            const nameCell = row.querySelector("td:nth-child(3)");
            nameCell.innerHTML = `<b>${row.dataset.firstName} ${row.dataset.lastName}</b>`;
            const genderCell = row.querySelector("td:nth-child(4)");
            genderCell.textContent = row.dataset.genderId === "1" ? "M" : "F";
            const birthdayCell = row.querySelector("td:nth-child(5)");
            const formattedDate = new Date(row.dataset.birthday).toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '.');
            birthdayCell.innerHTML = `<b>${formattedDate}</b>`;
            const statusCell = row.querySelector("td:nth-child(6)");
            statusCell.innerHTML = `<span class="status ${row.dataset.status === 'true' ? 'active' : 'inactive'}"></span>`
            
        }
    
    }
    
    function deleteBtnClick(event){
        const dataId = this.getAttribute('data-id');  
        const currentRow = tableBody.querySelector(`tr[data-id="${dataId}"]`);
        currentRow.remove();
    }

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

    function updateSidebarContent() {
        moveElements();
    }

    window.addEventListener("load", () => {
        updateSidebarContent();
    });

    window.addEventListener("resize", () => {
        updateSidebarContent();
    });

    moveElements();
});