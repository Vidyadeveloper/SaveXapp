export const complaintSteps = [
  {
    id: "registration",
    title: "Stage 1: Complaint Registration",
    step: "Capture Complaint",
    fields: [
      {
        label: "Complaint ID",
        type: "text",
        id: "complaint_id",
        required: true,
      }, // auto-generated
      {
        label: "Customer ID",
        type: "text",
        id: "customer_id",
        required: true,
      },
      {
        label: "Category",
        type: "select",
        id: "category",
        options: ["Loan", "Service", "Staff", "Technical"],
      },
      {label: "Description", type: "text", id: "description", required: true},
      {
        label: "Date Received",
        type: "date",
        id: "date_received",
      },
      {
        label: "Priority",
        type: "select",
        id: "priority",
        options: ["Low", "Medium", "High"],
      },
    ],
  },
  {
    id: "investigation",
    title: "Stage 2: Investigation",
    step: "Assign and Analyze",
    fields: [
      {label: "Customer ID", type: "text", id: "customer_id", required: true},
      {
        label: "Assigned Department",
        type: "text",
        id: "assigned_dept",
      },
      {
        label: "Assigned Officer",
        type: "text",
        id: "assigned_officer",
      },
      {
        label: "Investigation Notes",
        type: "text",
        id: "investigation_notes",
        required: false,
      },
      {
        label: "Supporting Evidence",
        type: "file",
        id: "supporting_evidence",
        required: false,
      },
    ],
  },
  {
    id: "resolution",
    title: "Stage 3: Resolution",
    step: "Provide Resolution",
    fields: [
      {label: "Customer ID", type: "text", id: "customer_id", required: true},
      {
        label: "Complaint ID",
        type: "text",
        id: "complaint_id",
        required: true,
      },
      {
        label: "Resolution Type",
        type: "select",
        id: "resolution_type",
        options: ["Refund", "Apology", "Explanation", "Escalation"],
      },
      {
        label: "Resolution Summary",
        type: "text",
        id: "resolution_summary",
      },
      {
        label: "Resolution Date",
        type: "date",
        id: "resolution_date",
      },
      {
        label: "Customer Acknowledgement",
        type: "select",
        id: "customer_ack",
        options: ["Yes", "No"],
      },
    ],
  },
];
