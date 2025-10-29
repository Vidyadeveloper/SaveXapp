const API_URL = `${API_BASE_URL}/account`;

document.getElementById("accountForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const employeeId = localStorage.getItem("employeeId");

  const accountData = {
    employeeId,
    accountType: document.getElementById("accountType").value,
    commMode: document.getElementById("commMode").value,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(accountData),
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ Onboarding Complete");
      localStorage.removeItem("employeeId");
      window.location.href = "../../index.html"; // back to dashboard
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
});
