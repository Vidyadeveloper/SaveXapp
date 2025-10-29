const API_URL = `${API_BASE_URL}/compensation`;

const form = document.getElementById("compensationForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) return alert("No employeeId found.");

  const data = {
    salary: document.getElementById("salary").value,
    bonus: document.getElementById("bonus").value,
    pay_frequency: document.getElementById("pay_frequency").value,
  };

  const res = await fetch(`${API_URL}/${employeeId}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (result.success) {
    alert("Compensation info saved ✅");
    window.location.href = "compliance.html";
  } else {
    alert("Error: " + result.error);
  }
});
