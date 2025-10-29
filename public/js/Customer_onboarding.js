import {onboardingSteps} from "./stepsConfig.js";

let currentStep = 0;

function renderStep(stepIndex) {
  const container = document.getElementById("process-container");
  const step = onboardingSteps[stepIndex];

  let html = `<h2>${step.title}</h2><form id="stepForm">`;

  step.fields.forEach((f) => {
    if (f.type === "select") {
      html += `<div class="form-group">
        <label>${f.label}</label>
        <select id="${f.id}" class="form-control" ${
        f.required ? "required" : ""
      }>
          <option value="">Select</option>
          ${f.options.map((o) => `<option>${o}</option>`).join("")}
        </select>
      </div>`;
    } else {
      html += `<div class="form-group">
        <label>${f.label}</label>
        <input type="${f.type}" id="${f.id}" class="form-control" ${
        f.required ? "required" : ""
      }/>
      </div>`;
    }
  });

  html += `<button type="submit" class="btn btn-primary">${
    stepIndex < onboardingSteps.length - 1 ? "Next →" : "Finish"
  }</button></form>`;

  container.innerHTML = html;

  document.getElementById("stepForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {};
    step.fields.forEach((f) => {
      if (f.type === "file") {
        formData[f.id] = document.getElementById(f.id).files[0];
      } else {
        formData[f.id] = document.getElementById(f.id).value;
      }
    });

    // Send data to backend
    //const API_URL = `${API_BASE_URL}/access`;

    const res = await fetch("/api/personal", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    console.log("DB response:", result);

    console.log(`Step ${step.id} submitted:`, formData);

    if (stepIndex < onboardingSteps.length - 1) {
      currentStep++;
      renderStep(currentStep);
    } else {
      alert("All steps completed ✅");
      window.goDashboard();
    }
  });
}

export function startOnboarding() {
  currentStep = 0;
  renderStep(currentStep);
}
