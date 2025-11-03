import {onboardingSteps} from "./stepsConfig.js";

let currentStep = 0;

function renderStep(stepIndex) {
  const container = document.getElementById("process-container");
  const step = onboardingSteps[stepIndex];

  const processName = "Customer Onboarding";

  let html = `
    <div class="breadcrumb">
    <h1>  Process: ${processName} > ${step.title} > Step: ${step.step}</h1>
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
    } else {
      html += `
      <div class="form-group">
        <label>${f.label}</label>
        <input type="${f.type}" id="${f.id}" class="form-control"
         ${f.required ? "required" : ""} ${f.readonly ? "readonly" : ""}/>
      </div>`;
    }
  });

  html += `<button type="submit" class="btn btn-primary">${
    stepIndex < onboardingSteps.length - 1 ? "Next →" : "Finish"
  }</button></form>`;

  container.innerHTML = html;

  // Auto-fill stored Customer ID in step-3
  if (step.id === "account") {
    document.getElementById("customer_id").value =
      localStorage.getItem("customerId") || "";
  }

  document.getElementById("stepForm").addEventListener("submit", handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();

  const step = onboardingSteps[currentStep];

  const formData = {};
  step.fields.forEach((f) => {
    if (f.type === "file") {
      formData[f.id] = document.getElementById(f.id).files[0];
    } else {
      formData[f.id] = document.getElementById(f.id).value.trim();
    }
  });

  let API_URL = "";
  let requestOptions = {};

  if (step.id === "personal") {
    // ✅ Business Rule: Age Validation
    const dob = new Date(formData.dob);
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 18) return alert("Applicant must be 18 or older!");

    API_URL = "/api/personal";
    requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(formData),
    };
  }

  if (step.id === "kyc") {
    API_URL = "/api/personal/kyc";
    const data = new FormData();

    const storedId = localStorage.getItem("customerId");
    data.append("customerId", storedId);
    data.append("process_id", localStorage.getItem("processId"));

    step.fields.forEach((f) => {
      if (f.type === "file") {
        if (!formData[f.id]) return alert("All documents must be uploaded!");
        data.append(f.id, formData[f.id]);
      } else {
        data.append(f.id, formData[f.id]);
      }
    });

    requestOptions = {method: "POST", body: data};
  }

  if (step.id === "account") {
    API_URL = "/api/personal/account";
    formData.customerId = localStorage.getItem("customerId");
    formData.process_id = localStorage.getItem("processId");

    requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(formData),
    };
  }

  try {
    const res = await fetch(API_URL, requestOptions);
    const result = await res.json();
    console.log("Backend:", result);

    // ✅ Save processId + customerId after step1
    if (step.id === "personal") {
      if (result.customerId) {
        localStorage.setItem("customerId", result.customerId);
      }
      if (result.processId) {
        localStorage.setItem("processId", result.processId);
      }
    }

    if (currentStep < onboardingSteps.length - 1) {
      currentStep++;
      renderStep(currentStep);
    } else {
      alert("Customer Onboarding Completed ✅");
      if (window.goDashboard) window.goDashboard();
    }
  } catch (err) {
    console.error(err);
    alert("Network/Server Issue");
  }
}

export function startOnboarding() {
  currentStep = 0;
  renderStep(currentStep);
}
