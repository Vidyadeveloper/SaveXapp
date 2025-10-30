import {loanApplicationSteps} from "./loanApplicationSteps.js";

let currentStep = 0;

function renderStep(stepIndex) {
  const container = document.getElementById("process-container");
  const step = loanApplicationSteps[stepIndex];

  let html = `
    <div class="breadcrumb">
      Process: Loan Application &gt; ${step.title} &gt; Step: ${step.step}
    </div>
    <form id="stepForm">
  `;

  step.fields.forEach((f) => {
    if (f.type === "select") {
      html += `
      <div class="form-group">
        <label>${f.label}</label>
        <select id="${f.id}" class="form-control" ${
        f.required ? "required" : ""
      }>
          <option value="">Select</option>
          ${f.options.map((o) => `<option value="${o}">${o}</option>`).join("")}
        </select>
      </div>`;
    } else if (f.type === "file") {
      html += `
      <div class="form-group">
        <label>${f.label}</label>
        <input type="file" id="${f.id}" class="form-control" ${
        f.required ? "required" : ""
      }/>
      </div>`;
    } else {
      html += `
      <div class="form-group">
        <label>${f.label}</label>
        <input type="${f.type}" id="${f.id}" class="form-control"
          ${f.required ? "required" : ""} ${f.readonly ? "readonly" : ""}/>
      </div>`;
    }
  });

  html += `<button type="submit" class="btn btn-primary">
    ${stepIndex < loanApplicationSteps.length - 1 ? "Next →" : "Finish"}
  </button></form>`;

  container.innerHTML = html;

  // Auto fill Customer ID
  const custId = localStorage.getItem("customerId");
  const custField = document.getElementById("customer_id");
  if (custField && custId) custField.value = custId;

  document.getElementById("stepForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {};
    step.fields.forEach((f) => {
      if (f.type === "file") {
        const file = document.getElementById(f.id).files[0];
        if (file) formData[f.id] = file;
      } else {
        formData[f.id] = document.getElementById(f.id).value;
      }
    });

    // ✅ Application ID added for next steps
    const applicationId = localStorage.getItem("applicationId");
    if (applicationId && step.id !== "loan_request") {
      formData.application_id = applicationId;
    }

    // ✅ Business Rules Checks
    if (step.id === "loan_request") {
      const loanAmount = parseFloat(formData["loan_amount"]);
      const propertyValue = parseFloat(formData["property_value"]);
      if (loanAmount / propertyValue > 0.8) {
        alert("Loan-to-Value > 80% – Requires review.");
      }
    }

    if (step.id === "evaluation") {
      const dti = parseFloat(formData["dti_ratio"]);
      if (dti > 50) {
        alert("DTI > 50% – Not eligible.");
      }
    }

    // ✅ API Endpoint
    const API_URL = `/api/loan/${step.id}`;

    let options = {method: "POST"};

    if (step.id === "document_collection") {
      // ✅ FormData for files
      const fd = new FormData();
      Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
      options.body = fd;
    } else {
      // ✅ JSON for all other steps
      options.headers = {"Content-Type": "application/json"};
      options.body = JSON.stringify(formData);
    }

    const res = await fetch(API_URL, options);

    if (!res.ok) {
      const msg = await res.text();
      alert(`❌ Error: ${msg}`);
      return;
    }

    const result = await res.json();

    // ✅ Save Application ID from Step 1
    if (step.id === "loan_request" && result.applicationId) {
      localStorage.setItem("applicationId", result.applicationId);
    }

    // ✅ Move forward normally
    if (stepIndex < loanApplicationSteps.length - 1) {
      alert("✅ Data saved successfully");
      currentStep++;
      renderStep(currentStep);
    } else {
      alert("🎉 Loan Application Completed Successfully!");
      localStorage.removeItem("applicationId");
      if (window.goDashboard) window.goDashboard();
    }
  });
}

export function startLoanApplication() {
  currentStep = 0;
  renderStep(currentStep);
}
