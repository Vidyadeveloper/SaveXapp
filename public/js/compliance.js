const API_URL = `${API_BASE_URL}/compliance`;

const form = document.getElementById("complianceForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) return alert("No employeeId found.");

  const data = {
    tax_id: document.getElementById("tax_id").value,
    ssn: document.getElementById("ssn").value,
    policy_agreement: document.getElementById("policy_agreement").value,
  };

  const res = await fetch(`${API_URL}/${employeeId}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (result.success) {
    alert("Compliance info saved ✅");
    window.location.href = "access.html";
  } else {
    alert("Error: " + result.error);
  }
});
