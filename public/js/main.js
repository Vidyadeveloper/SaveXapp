const API_URL = "http://localhost:5000/api/employees";

// Handle Add Employee Form
const form = document.getElementById("employeeForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newEmployee = {
      name: document.getElementById("name").value,
      department: document.getElementById("department").value,
      email: document.getElementById("email").value,
      join_date: document.getElementById("join_date").value,
      status: document.getElementById("status").value,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newEmployee),
    });

    const data = await response.json();
    alert(data.message);
    form.reset();
  });
}

// Load Employee List
const table = document.getElementById("employeeTable");
if (table) {
  fetch(API_URL)
    .then((res) => res.json())
    .then((employees) => {
      const tbody = table.querySelector("tbody");
      tbody.innerHTML = "";
      employees.forEach((emp) => {
        const row = `
          <tr>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.email}</td>
            <td>${emp.join_date}</td>
            <td>${emp.status}</td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${emp.id})">Delete</button>
            </td>
          </tr>`;
        tbody.innerHTML += row;
      });
    });
}

// Delete Employee
function deleteEmployee(id) {
  fetch(`${API_URL}/${id}`, {method: "DELETE"})
    .then((res) => res.json())
    .then((data) => {
      alert(data.message);
      location.reload();
    });
}
