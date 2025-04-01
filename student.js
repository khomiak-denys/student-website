document.addEventListener("DOMContentLoaded", () => {
    // Логіка для таблиці (виконується тільки якщо таблиця є)
    const tableBody = document.querySelector("tbody");
    if (tableBody) {
        const actionButtons = document.querySelectorAll(".action-btn");

        // Логіка для кнопки "Додати"
        actionButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                const target = event.currentTarget;
                if (target.classList.contains("add-btn")) {
                    const newStudentRow = `
                        <tr>
                            <td><input type="checkbox"></td>
                            <td><b>PZ-23</b></td>
                            <td><b>Mary Johnson</b></td>
                            <td>F</td>
                            <td><b>15.06.2003</b></td>
                            <td><span class="status active"></span></td>
                            <td class="align-middle">
                                <button class="btn btn-sm btn-outline-secondary action-btn edit-btn">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-secondary delete-btn">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML("beforeend", newStudentRow);
                }
            });
        });

        // Делегування подій для кнопок редагування та видалення
        tableBody.addEventListener("click", (event) => {
            const target = event.target.closest("button");
            if (!target) return;
            if (target.classList.contains("edit-btn")) {
                const row = target.closest("tr");
                const groupCell = row.querySelector("td:nth-child(2)");
                groupCell.innerHTML = "<b>PZ-29</b>";
                const nameCell = row.querySelector("td:nth-child(3)");
                nameCell.innerHTML = "<b>Bombaclat</b>";
            }
            if (target.classList.contains("delete-btn")) {
                const row = target.closest("tr");
                row.remove();
            }
        });
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
        console.log("Sidebar content updated");
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