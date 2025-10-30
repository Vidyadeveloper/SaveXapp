export const loanClosureSteps = [
  {
    id: "closure_request",
    title: "Stage 1: Closure Request",
    step: "Initiate Closure",
    fields: [
      {
        label: "Customer ID",
        type: "text",
        id: "customer_id",
        required: true,
        readonly: true,
      },
      {
        label: "Loan Account Number",
        type: "text",
        id: "loan_account",
        required: true,
      },
      {
        label: "Closure Reason",
        type: "select",
        id: "closure_reason",
        options: ["Full Repayment", "Foreclosure", "Refinance"],
        required: true,
      },
      {
        label: "Requested Date",
        type: "date",
        id: "requested_date",
        required: true,
      },
    ],
  },
  {
    id: "payment_settlement",
    title: "Stage 2: Payment Settlement",
    step: "Calculate Dues",
    fields: [
      {
        label: "Customer ID",
        type: "text",
        id: "customer_id",
        required: true,
        readonly: true,
      },
      {
        label: "Outstanding Principal (€)",
        type: "number",
        id: "outstanding_principal",
        required: true,
      },
      {
        label: "Interest Due (€)",
        type: "number",
        id: "interest_due",
        required: true,
      },
      {
        label: "Penalties (€)",
        type: "number",
        id: "penalties",
        required: false,
      },
      {
        label: "Total Payable (€)",
        type: "number",
        id: "total_payable",
        required: true,
      },
      {
        label: "Payment Mode",
        type: "select",
        id: "payment_mode",
        options: ["Bank Transfer", "Debit"],
        required: true,
      },
    ],
  },
  {
    id: "finalization",
    title: "Stage 3: Finalization",
    step: "Confirm Closure",
    fields: [
      {
        label: "Customer ID",
        type: "text",
        id: "customer_id",
        required: true,
        readonly: true,
      },
      {
        label: "Closure Confirmation Date",
        type: "date",
        id: "closure_confirmation_date",
        required: true,
      },
      {
        label: "Closure Certificate",
        type: "file",
        id: "closure_certificate",
        required: true,
      },
      {
        label: "Lien Release Date",
        type: "date",
        id: "lien_release_date",
        required: true,
      },
      {
        label: "Confirmation Sent To (Email ID)",
        type: "email",
        id: "confirmation_sent_to",
        required: true,
      },
    ],
  },
];
