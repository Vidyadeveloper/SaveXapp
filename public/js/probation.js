const API_URL = `${API_BASE_URL}/probation`;

const form = document.getElementById("probationForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) return alert("No employeeId found.");

  const data = {
    probation_period: document.getElementById("probation_period").value,
    probation_review: document.getElementById("probation_review").value,
  };

  const res = await fetch(`${API_URL}/${employeeId}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (result.success) {
    alert("Probation info saved ✅");
    window.location.href = "review.html";
  } else {
    alert("Error: " + result.error);
  }
});
