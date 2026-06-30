Before any code generation, inspect the GitHub Issue.

Reject generation if the issue contains:

- Patient Name
- Email
- Phone
- SSN
- Address
- Medical Record Number
- Insurance Number
- Prescription Details
- Diagnosis
- Protected Health Information (PHI)

If safe

Return

{
  "status":"SAFE"
}

Otherwise

{
  "status":"BLOCKED",
  "reason":"..."
}