const API_URL = `${API_BASE_URL}/review`;

const form = document.getElementById("reviewForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId) return alert("No employeeId found.");

  const data = {
    review_status: document.getElementById("review_status").value,
    comments: document.getElementById("comments").value,
  };

  const res = await fetch(`${API_URL}/${employeeId}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (result.success) {
    alert("Review completed ✅");
    window.location.href = "list.html";
  } else {
    alert("Error: " + result.error);
  }
});
