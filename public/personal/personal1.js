const API_URL = `${API_BASE_URL}/personal`;

document
  .getElementById("personalForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const employee = {
      name: document.getElementById("name").value,
      gender: document.getElementById("gender").value,
      dob: document.getElementById("dob").value,
      email: document.getElementById("email").value,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(employee),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("customer_id", data.customerId);
        // Load KYC step dynamically
        fetch("../kyc/kyc.html")
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
