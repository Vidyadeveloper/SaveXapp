import {complaintSteps} from "./complaintSteps.js";

let currentStep = 0;

function renderStep(stepIndex) {
  const container = document.getElementById("process-container");
  const step = complaintSteps[stepIndex];

  let html = `
    <div class="breadcrumb">
      Process: Complaint Management &gt; ${step.title} &gt; Step: ${step.step}
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
    stepIndex < complaintSteps.length - 1 ? "Next →" : "Finish"
  }</button></form>`;
  container.innerHTML = html;

  const storedCustomerId = localStorage.getItem("customerId");
  const custIdField = document.getElementById("customer_id");
  if (custIdField && storedCustomerId) {
    custIdField.value = storedCustomerId;
  }

  // Auto-generate Complaint ID for registration step
  if (step.id === "registration") {
    const complaintField = document.getElementById("complaint_id");
    if (complaintField) {
      const complaintId = `CMP-${Date.now()}`;
      complaintField.value = complaintId;

      // ✅ Save complaint_id in localStorage immediately
      localStorage.setItem("complaintId", complaintId);
    }
  }

  document.getElementById("stepForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {};
    step.fields.forEach((f) => {
      if (f.type === "file") {
        formData[f.id] = document.getElementById(f.id).files[0];
      } else {
        // Always ensure customer_id is sent
        if (f.id === "customer_id") {
          formData[f.id] = storedCustomerId || "";
        } else {
          formData[f.id] = document.getElementById(f.id).value;
        }
      }
    });

    try {
      let res;

      if (step.id === "registration" || step.id === "resolution") {
        res = await fetch(`/api/complaint/${step.id}`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(formData),
        });

        // ✅ Save complaint_id from backend response (if you want)
        const result = await res.json();
        if (step.id === "registration" && result.complaintId) {
          localStorage.setItem("complaintId", result.complaintId);
        }
        console.log("Backend response:", result);
      } else if (step.id === "investigation") {
        // FormData for file upload
        const data = new FormData();
        Object.keys(formData).forEach((key) => data.append(key, formData[key]));

        // ✅ Append complaint_id from localStorage
        data.append("complaint_id", localStorage.getItem("complaintId") || "");

        res = await fetch(`/api/complaint/investigation`, {
          method: "POST",
          body: data,
        });

        const result = await res.json();
        console.log("Backend response:", result);
      }

      // Move to next step or finish
      if (stepIndex < complaintSteps.length - 1) {
        currentStep++;
        renderStep(currentStep);
      } else {
        alert("Complaint Process Completed ✅");
        if (window.goDashboard) window.goDashboard();
        // Cleanup localStorage
        localStorage.removeItem("complaintId");
        localStorage.removeItem("customerId");
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
