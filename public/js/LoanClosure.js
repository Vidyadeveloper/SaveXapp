import {loanClosureSteps} from "./loanClosureSteps.js";

let currentStep = 0;

function renderStep(stepIndex) {
  const container = document.getElementById("process-container");
  const step = loanClosureSteps[stepIndex];

  let html = `
    <div class="breadcrumb">
      <h1>Process: Loan Closure &gt; ${step.title} &gt; Step: ${step.step}</h1>
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
    stepIndex < loanClosureSteps.length - 1 ? "Next →" : "Finish"
  }</button></form>`;
  container.innerHTML = html;

  document.getElementById("stepForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {};

    // Collect values from the form (editable)
    step.fields.forEach((f) => {
      if (f.type === "file") {
        formData[f.id] = document.getElementById(f.id).files[0];
      } else {
        formData[f.id] = document.getElementById(f.id).value.trim();
      }
    });

    // Ensure customer_id is always from input field
    if (!formData.customer_id) {
      alert("Customer ID is required");
      return;
    }

    try {
      let res, result;

      if (step.id === "closure_request") {
        formData.loan_account_no = formData.loan_account;
        delete formData.loan_account;

        // POST request for step 1
        res = await fetch("/api/loan-closure/request", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(formData),
        });

        result = await res.json(); // parse JSON

        if (result.success && result.processId) {
          // store processId for subsequent steps
          localStorage.setItem("processId", result.processId);
          localStorage.setItem("loanAccountNo", formData.loan_account_no);
        } else {
          alert("Error creating closure request: " + result.error);
          return;
        }
      } else if (step.id === "payment_settlement") {
        // get processId from localStorage
        formData.process_id = localStorage.getItem("processId") || "";
        formData.loan_account_no = localStorage.getItem("loanAccountNo");

        formData.outstanding_principal = parseFloat(
          formData.outstanding_principal || 0
        );
        formData.interest_due = parseFloat(formData.interest_due || 0);
        formData.penalties = parseFloat(formData.penalties || 0);
        formData.total_payable = parseFloat(formData.total_payable || 0);

        formData.payment_mode =
          document.getElementById("payment_mode")?.value || "";
        if (!formData.payment_mode) {
          alert("Please select a payment mode");
          return;
        }

        res = await fetch("/api/loan-closure/settlement", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(formData),
        });

        result = await res.json();

        if (!result.success) {
          alert("Error in payment settlement: " + result.error);
          return;
        }
      } else if (step.id === "finalization") {
        const data = new FormData();
        data.append("customer_id", formData.customer_id);
        data.append("loan_account_no", localStorage.getItem("loanAccountNo"));
        data.append("process_id", localStorage.getItem("processId"));

        data.append(
          "closure_confirmation_date",
          formData.closure_confirmation_date
        );
        data.append("lien_release_date", formData.lien_release_date);
        data.append("confirmation_email", formData.confirmation_sent_to);

        if (formData.closure_certificate) {
          data.append("closure_certificate", formData.closure_certificate);
        }

        res = await fetch("/api/loan-closure/finalize", {
          method: "POST",
          body: data,
        });

        result = await res.json();

        if (!result.success) {
          alert("Error in finalization: " + result.error);
          return;
        }
      }

      console.log("Backend response:", result);

      if (stepIndex < loanClosureSteps.length - 1) {
        currentStep++;
        renderStep(currentStep);
      } else {
        alert("Loan Closure Completed ✅");
        if (window.goDashboard) window.goDashboard();
      }
    } catch (err) {
      console.error(err);
      alert("Network or server error. Check console.");
    }
  });
}

export function startLoanClosure() {
  currentStep = 0;
  renderStep(currentStep);
}
