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
});
