// js/stepsConfig.js

export const onboardingSteps = [
  {
    id: "personal",
    title: "Step 1: Customer Identification",
    fields: [
      {label: "First Name", type: "text", id: "first_name", required: true},
      {label: "Last Name", type: "text", id: "last_name", required: true},
      {label: "Date of Birth", type: "date", id: "dob", required: true},
      {
        label: "National ID / BSN",
        type: "text",
        id: "national_id",
        required: true,
      },
      {label: "Phone Number", type: "text", id: "phone", required: false},
      {label: "Email", type: "email", id: "email", required: true},
      {label: "Street", type: "text", id: "street", required: false},
      {label: "City", type: "text", id: "city", required: false},
      {label: "Postal Code", type: "text", id: "postal_code", required: false},
      {label: "Country", type: "text", id: "country", required: false},
    ],
  },
  {
    id: "kyc",
    title: "Step 2: KYC Verification",
    fields: [
      {label: "ID Proof", type: "file", id: "idProof", required: true},
      {
        label: "Address Proof",
        type: "file",
        id: "addressProof",
        required: true,
      },
      {label: "Income Proof", type: "file", id: "incomeProof", required: true},
    ],
  },
  {
    id: "account",
    title: "Step 3: Account Setup",
    fields: [
      {
        label: "Account Type",
        type: "select",
        id: "accountType",
        options: ["Savings", "Current"],
        required: true,
      },
      {
        label: "Preferred Communication",
        type: "select",
        id: "communication",
        options: ["Email", "Phone", "Post"],
        required: true,
      },
    ],
  },
];
