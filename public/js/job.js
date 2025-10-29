const API_URL = `${API_BASE_URL}/job`;

const form = document.getElementById("jobForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const employeeId = localStorage.getItem("employeeId");
  if (!employeeId)
    return alert("No employeeId found. Start from Personal Info.");

  const jobData = {
    job_title: document.getElementById("job_title").value,
    department: document.getElementById("department").value,
    manager: document.getElementById("manager").value,
    employment_type: document.getElementById("employment_type").value,
    join_date: document.getElementById("join_date").value,
  };

  const res = await fetch(`${API_URL}/${employeeId}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(jobData),
  });

  const data = await res.json();
  if (data.success) {
    alert("Job Info Saved ✅");
    window.location.href = "compensation.html"; // go to next step
  } else {
    alert("Error saving data: " + data.error);
  }
});
