const API_URL = `${API_BASE_URL}/access`;

const form = document.getElementById("accessForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) return alert("No employeeId found.");

  const data = {
    email_access: document.getElementById("email_access").value,
    system_access: document.getElementById("system_access").value,
  };

  const res = await fetch(`${API_URL}/${employeeId}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (result.success) {
    alert("Access info saved ✅");
    window.location.href = "training.html";
  } else {
    alert("Error: " + result.error);
  }
});
