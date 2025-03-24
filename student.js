document.addEventListener("DOMContentLoaded", () => {
    // Знаходимо tbody для додавання нових рядків
    const tableBody = document.querySelector("tbody");

    const actionButtons = document.querySelectorAll(".action-btn");

    actionButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const target = event.currentTarget;

            // Логіка для кнопки додавання студента
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
                            <button class="btn btn-sm btn-outline-secondary action-btn action-btn edit-btn">
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

    // Один слухач для tableBody, який обробляє редагування та видалення
    tableBody.addEventListener("click", (event) => {
        const target = event.target.closest("button");

        if (!target) return; // Якщо клік не по кнопці, виходимо

        // Логіка для кнопки редагування
        if (target.classList.contains("edit-btn")) {
            const row = target.closest("tr");
            const groupCell = row.querySelector("td:nth-child(2)");
            groupCell.innerHTML = "<b>PZ-29</b>";

            const nameCell = row.querySelector("td:nth-child(3)");
            nameCell.innerHTML = "<b>Bombaclat</b>";
        }

        // Логіка для кнопки видалення
        if (target.classList.contains("delete-btn")) {
            const row = target.closest("tr");
            row.remove();
        }
    });

    // Оновлення вмісту бокової панелі при завантаженні та зміні розміру
    window.addEventListener("load", updateSidebarContent);
    window.addEventListener("resize", updateSidebarContent);

    function updateSidebarContent() {
        console.log("Sidebar content updated");
    }
});