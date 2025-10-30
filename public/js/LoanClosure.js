import {loanClosureSteps} from "./loanClosureSteps.js";

let currentStep = 0;

function renderStep(stepIndex) {
  const container = document.getElementById("process-container");
  const step = loanClosureSteps[stepIndex];

  let html = `
    <div class="breadcrumb">
      Process: Loan Closure &gt; ${step.title} &gt; Step: ${step.step}
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

  // Auto-fill Customer ID from localStorage
  const custIdField = document.getElementById("customer_id");
  if (custIdField) {
    const storedId = localStorage.getItem("customerId");
    if (storedId) custIdField.value = storedId;
  }

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

    // Always attach customerId from previous steps
    formData.customer_id =
      localStorage.getItem("customerId") || formData.customer_id;

    // Business Logic: Payment Settlement & Foreclosure Penalty
    if (step.id === "payment_settlement") {
      const closureReason = document.getElementById("closure_reason")?.value;
      const principalDue = parseFloat(formData["principal_due"] || 0);
      const interestDue = parseFloat(formData["interest_due"] || 0);
      let total = principalDue + interestDue;

      if (closureReason === "Foreclosure") {
        const penalty = total * 0.02;
        formData["penalties"] = penalty;
        formData["total_payable"] = total + penalty;
        alert(`Foreclosure Penalty Applied: €${penalty}`);
      } else {
        formData["total_payable"] = total;
      }

      if (total <= 0) {
        alert("Closure not eligible: outstanding dues must be cleared.");
        return;
      }
    }

    try {
      let res;

      if (step.id === "closure_request") {
        formData.loan_account_no = formData.loan_account;
        localStorage.setItem("loanAccountNo", formData.loan_account_no); // save it

        delete formData.loan_account;
        res = await fetch("/api/loan-closure/request", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(formData),
        });
      } else if (step.id === "payment_settlement") {
        formData.loan_account_no =
          formData.loan_account_no || localStorage.getItem("loanAccountNo");

        formData.outstanding_principal = parseFloat(
          formData.outstanding_principal || 0
        );
        formData.interest_due = parseFloat(formData.interest_due || 0);
        formData.penalties = parseFloat(formData.penalties || 0);
        formData.total_payable = parseFloat(formData.total_payable || 0);

        // Read payment mode from select
        formData.payment_mode = document.getElementById("payment_mode").value;

        if (!formData.payment_mode) {
          alert("Please select a payment mode");
          return;
        }

        res = await fetch("/api/loan-closure/settlement", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(formData),
        });

        console.log("Settlement data sent:", formData);
      } else if (step.id === "finalization") {
        const data = new FormData();

        // Always get from localStorage
        const customerId = localStorage.getItem("customerId");
        const loanAccountNo = localStorage.getItem("loanAccountNo");

        data.append("customer_id", customerId);
        data.append("loan_account_no", loanAccountNo);

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
      }

      const result = await res.json();
      console.log("Backend response:", result);

      // Move to next step or finish
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
