import {complaintSteps} from "./complaintSteps.js";

let currentStep = 0;

function renderStep(stepIndex) {
  const container = document.getElementById("process-container");
  const step = complaintSteps[stepIndex];

  let html = `
    <div class="breadcrumb">
      <h1>Process: Complaint Management &gt; ${step.title} &gt; Step: ${step.step}</h1>
    </div>
    <form id="stepForm">
  `;

  // Render all fields
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
    stepIndex < complaintSteps.length - 1 ? "Next →" : "Finish"
  }</button></form>`;
  container.innerHTML = html;

  // Auto-generate complaint ID in registration step
  if (step.id === "registration") {
    const complaintField = document.getElementById("complaint_id");
    if (complaintField) {
      const complaintId = `CMP-${Date.now()}`;
      complaintField.value = complaintId;
      localStorage.setItem("complaintId", complaintId);
    }
  }

  document.getElementById("stepForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Prepare form data
    const formData = {};
    step.fields.forEach((f) => {
      if (f.type === "file") {
        formData[f.id] = document.getElementById(f.id).files[0];
      } else {
        // Take Customer ID from input field (user typed value)
        formData[f.id] = document.getElementById(f.id).value;
      }
    });

    try {
      let res;

      if (step.id === "registration" || step.id === "resolution") {
        if (step.id === "resolution") {
          formData.process_id = localStorage.getItem("processId") || "";
          formData.complaint_id = localStorage.getItem("complaintId") || "";
        }

        res = await fetch(`/api/complaint/${step.id}`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(formData),
        });

        const result = await res.json();

        if (
          step.id === "registration" &&
          result.complaintId &&
          result.processId
        ) {
          localStorage.setItem("complaintId", result.complaintId);
          localStorage.setItem("processId", result.processId);
        }

        console.log("Backend response:", result);
      } else if (step.id === "investigation") {
        const data = new FormData();
        Object.keys(formData).forEach((key) => data.append(key, formData[key]));
        data.append("complaint_id", localStorage.getItem("complaintId") || "");
        data.append("process_id", localStorage.getItem("processId") || "");

        res = await fetch(`/api/complaint/investigation`, {
          method: "POST",
          body: data,
        });

        const result = await res.json();
        console.log("Backend response:", result);
      }

      if (stepIndex < complaintSteps.length - 1) {
        currentStep++;
        renderStep(currentStep);
      } else {
        alert("Complaint Process Completed ✅");
        if (window.goDashboard) window.goDashboard();
        localStorage.removeItem("complaintId");
        localStorage.removeItem("processId");
      }
    } catch (err) {
      console.error(err);
      alert("Network or server error. Check console.");
    }
  });
}

export function startComplaintProcess() {
  currentStep = 0;
  renderStep(currentStep);
}
