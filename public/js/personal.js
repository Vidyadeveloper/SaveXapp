const API_URL = `${API_BASE_URL}/personal`;

const form = document.getElementById("personalForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const employee = {
    name: document.getElementById("name").value,
    gender: document.getElementById("gender").value,
    dob: document.getElementById("dob").value,
    nationality: document.getElementById("nationality").value,
    marital_status: document.getElementById("marital_status").value,
    contact: document.getElementById("contact").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(employee),
  });

  const data = await res.json();
  if (data.success) {
    alert("Personal Info Saved ✅");
    localStorage.setItem("employeeId", data.employeeId); // store employeeId temporarily
    window.location.href = "job.html"; // go to next step
  } else {
    alert("Error saving data: " + data.message);
  }
});
