const addStudentBtn = document.querySelector(".addStudent");
const tableBody = document.querySelector("tbody");

addStudentBtn.addEventListener("click", function () {
    const newStudentRow = `
        <tr>
            <td><input type="checkbox"></td>
            <td><b>PZ-23</b></td>
            <td><b>Mary Johnson</b></td>
            <td>F</td>
            <td><b>15.06.2003</b></td>
            <td><span class="status active"></span></td>
            <td class="align-middle">
                <button class="btn btn-sm btn-outline-secondary edit-btn">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary delete-btn">
                    <i class="bi bi-x-lg"></i>
                </button>
            </td>
        </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", newStudentRow);
});

tableBody.addEventListener("click", function (event) {
    // Handle edit button click
    if (event.target.closest(".edit-btn")) {
        const row = event.target.closest("tr");
        const groupCell = row.querySelector("td:nth-child(2)");
        groupCell.innerHTML = "<b>PZ-29</b>";
        
        const nameCell = row.querySelector("td:nth-child(3)");
        nameCell.innerHTML = "<b>Bombaclat</b>";
    }

    // Handle delete button click
    if (event.target.closest(".delete-btn")) {
        const row = event.target.closest("tr");
        row.remove(); 
    }
});

window.addEventListener("load", updateSidebarContent);
window.addEventListener("resize", updateSidebarContent);

function updateSidebarContent() {
    // Example of updating sidebar content on load or resize
    console.log("Sidebar content updated");
}
