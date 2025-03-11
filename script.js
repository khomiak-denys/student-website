document.addEventListener("DOMContentLoaded", function () {
    const menuItems = document.querySelectorAll(".sidebar p");

    menuItems.forEach(item => {
        item.addEventListener("click", function () {
            // Видаляємо клас activeBtn у всіх кнопок
            menuItems.forEach(el => el.classList.remove("activeBtn"));
            // Додаємо activeBtn до натиснутої кнопки
            this.classList.add("activeBtn");
        });
    });

    const bellIcon = document.querySelector(".notification");
    const notificationsDropdown = document.querySelector(".notifications-dropdown");

    bellIcon.addEventListener("click", function (event) {
        event.stopPropagation(); 
        notificationsDropdown.style.display = (notificationsDropdown.style.display === "block") ? "none" : "block";
    });

    document.addEventListener("click", function () {
        notificationsDropdown.style.display = "none";
    });

    notificationsDropdown.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    document.querySelectorAll(".notification-item").forEach(item => {
        item.addEventListener("click", function () {
            this.classList.remove("unread");
            this.querySelector(".username").style.fontStyle = "normal";
        });
    });
});



// Додаємо обробник подій після завантаження DOM
document.addEventListener("DOMContentLoaded", function () {
    const addStudentBtn = document.querySelector(".addStudentBtn");
    const tableBody = document.querySelector("tbody");

    // 1. Додавання нового студента
    addStudentBtn.addEventListener("click", function () {
        const newStudentRow = `
            <tr>
                <td><input type="checkbox"></td>
                <td><b>KN-23</b></td>
                <td><b>Mary Johnson</b></td>
                <td>F</td>
                <td><b>15.06.2003</b></td>
                <td><span class="status active"></span></td>
                <td>
                    <button class="btn edit-btn">
                        <img src="edit-icon.svg" alt="Edit">
                    </button>
                    <button class="btn delete-btn">
                        <img src="remove-icon.svg" alt="Delete">
                    </button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", newStudentRow);
    });

    // 2. Обробка подій для редагування і видалення
    tableBody.addEventListener("click", function (event) {
        // Перевіряємо, чи був натиснутий сам елемент кнопки, навіть якщо всередині є зображення
        if (event.target.closest(".edit-btn")) {
            const row = event.target.closest("tr");
            const groupCell = row.querySelector("td:nth-child(2)");
            groupCell.innerHTML = "<b>KN-29</b>";
        }

        if (event.target.closest(".delete-btn")) {
            const row = event.target.closest("tr");
            row.remove();
        }
    });
});
