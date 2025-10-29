const API_URL = `${API_BASE_URL}/kyc`;

document.getElementById("kycForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const employeeId = localStorage.getItem("employeeId");

  const formData = new FormData();
  formData.append("employeeId", employeeId);
  formData.append("idProof", document.getElementById("idProof").files[0]);
  formData.append(
    "addressProof",
    document.getElementById("addressProof").files[0]
  );
  formData.append(
    "incomeProof",
    document.getElementById("incomeProof").files[0]
  );

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      // Load Account Setup
      fetch("../account/account.html")
        .then((r) => r.text())
        .then((html) => {
          document.getElementById("process-container").innerHTML = html;
        });
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
});
