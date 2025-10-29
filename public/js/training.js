const API_URL = `${API_BASE_URL}/training`;

const form = document.getElementById("trainingForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) return alert("No employeeId found.");

  const data = {
    training_assigned: document.getElementById("training_assigned").value,
    training_completion: document.getElementById("training_completion").value,
  };

  const res = await fetch(`${API_URL}/${employeeId}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (result.success) {
    alert("Training info saved ✅");
    window.location.href = "probation.html";
  } else {
    alert("Error: " + result.error);
  }
});
