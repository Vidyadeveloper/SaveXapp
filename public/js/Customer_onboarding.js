import {onboardingSteps} from "./stepsConfig.js";

let currentStep = 0;

function renderStep(stepIndex) {
  const container = document.getElementById("process-container");
  const step = onboardingSteps[stepIndex];

  // Breadcrumb / header
  const processName = "Customer Onboarding";
  const stageName = step.title;

  let html = `
    <div class="breadcrumb">
      Process: ${processName} &gt; ${stageName} &gt; Step: ${step.step}
    </div>
    <form id="stepForm">
  `;

  step.fields.forEach((f) => {
    if (f.type === "select") {
      html += `<div class="form-group">
        <label>${f.label}</label>
        <select id="${f.id}" class="form-control" ${
        f.required ? "required" : ""
      }>
          <option value="">Select</option>
          ${f.options.map((o) => `<option value="${o}">${o}</option>`).join("")}
        </select>
      </div>`;
    } else {
      html += `<div class="form-group">
        <label>${f.label}</label>
        <input type="${f.type}" id="${f.id}" class="form-control" ${
        f.required ? "required" : ""
      } ${f.readonly ? "readonly" : ""}/>
      </div>`;
    }
  });

  html += `<button type="submit" class="btn btn-primary">${
    stepIndex < onboardingSteps.length - 1 ? "Next →" : "Finish"
  }</button></form>`;

  container.innerHTML = html;

  // Auto-fill Customer ID in Step-3
  if (step.id === "account") {
    const storedId = localStorage.getItem("customerId");
    if (storedId) {
      document.getElementById("customer_id").value = storedId;
    }
  }

  document.getElementById("stepForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = {};
    step.fields.forEach((f) => {
      if (f.type === "file") {
        formData[f.id] = document.getElementById(f.id).files[0];
      } else {
        formData[f.id] = document.getElementById(f.id).value;
      }
    });

    // Determine API URL
    let API_URL = "";
    if (step.id === "personal") API_URL = "/api/personal";
    if (step.id === "kyc") API_URL = "/api/kyc";
    if (step.id === "account") API_URL = "/api/account";

    try {
      let options;

      // KYC Step uses FormData for files
      if (step.id === "kyc") {
        const data = new FormData();

        // Add all fields + customerId
        step.fields.forEach((f) => {
          if (f.type === "file") {
            data.append(f.id, formData[f.id]);
          } else {
            data.append(f.id, formData[f.id]);
          }
        });

        const storedId = localStorage.getItem("customerId");
        if (storedId) data.append("customerId", storedId);

        options = {method: "POST", body: data};
      } else {
        // Personal & Account steps send JSON
        if (step.id === "account") {
          formData.customerId = localStorage.getItem("customerId");
          delete formData.customer_id; // remove old field if present
        }
        options = {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(formData),
        };
      }

      const res = await fetch(API_URL, options);
      const result = await res.json();
      console.log("DB response:", result);

      // Save customerId after personal step
      if (step.id === "personal" && result.customerId) {
        localStorage.setItem("customerId", result.customerId);
      }

      // Move to next step or finish
      if (stepIndex < onboardingSteps.length - 1) {
        currentStep++;
        renderStep(currentStep);
      } else {
        alert("All steps completed ✅");
        if (window.goDashboard) window.goDashboard();
      }
    } catch (err) {
      console.error(err);
      alert("Network or server error. Check console.");
    }
  });
}

export function startOnboarding() {
  currentStep = 0;
  renderStep(currentStep);
}
