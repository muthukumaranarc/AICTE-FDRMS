# Context

V1 is an internal **AICTE Security Deposit / Fixed Deposit Receipt (FDR) Management Portal** for the AICTE Regulation Bureau. Its purpose is to give AICTE officials one centralized place to maintain institution-wise security deposit and FDR records, review supporting documents, monitor each instrument throughout its lifecycle, track pending administrative actions, and maintain a reliable history of decisions and changes.

The portal focuses on the complete administrative lifecycle of security deposits and FDRs associated with applicable AICTE approval-related processes. It must improve record accuracy, reduce repetitive manual tracking, make approaching deadlines visible, and help officials identify cases that need attention.

**V1 is exclusively for internal AICTE users.** Educational institutions are records managed in the portal, not users of this V1. There must be no institution login, institution dashboard, institution self-service submission portal, bank login, or public-facing portal in this version. AICTE officials maintain the records and record information and documents received through the existing authorized channels.

The portal must support scrutiny and administrative tracking without independently making regulatory or financial decisions. Verification findings, recommendations, and case statuses must remain distinguishable from final decisions made by the competent authority. Release, discharge, or refund must be recorded only after the required conditions and authorized approval have been fulfilled.

# Target User

The target users are **authorized AICTE personnel only**, primarily members of the Regulation Bureau.

- **AICTE Regulation Bureau Officials / Case Reviewers:** Maintain institution and FDR records; review submitted information and documents; record scrutiny observations; identify missing information and discrepancies; monitor validity, maturity, renewals, and pending cases; and prepare cases for the appropriate authority.
- **Competent Authorities / Approving Officials:** Review cases requiring formal authorization; record approval or rejection decisions; and authorize eligible release, discharge, or refund actions in accordance with applicable regulations and procedures.
- **AICTE Portal Administrators:** Manage internal user accounts, role permissions, master data, configurable reminder rules, and portal-level settings; and review system activity and audit records.

Access to financial and institutional information must be limited according to each user's assigned role and permissions. Institution staff, bank staff, and members of the public are not V1 users.

# Features

## 1. AICTE Internal Dashboard

- Show a consolidated overview of all security deposits and FDRs recorded in the portal.
- Display total instruments and total recorded deposit value.
- Show counts and amounts for active, expiring soon, matured, overdue, pending verification, renewal pending, release/refund pending, released, and closed records.
- Highlight urgent cases, overdue actions, missing documents, unresolved discrepancies, and upcoming deadlines.
- Provide direct access to the records and work queues behind each dashboard metric.
- Show recent submissions/records received, recent scrutiny activity, recent decisions, and recent status changes.

## 2. Institution Registry

- Maintain a centralized profile for every institution whose security deposits or FDRs are tracked by AICTE.
- Store institution name, AICTE or other applicable reference identifiers, institution type, location, contact/reference details, and administrative notes as applicable.
- Show all security deposits, FDRs, documents, verification observations, renewal history, and release/refund cases associated with an institution.
- Support institution search, filtering, record history, and duplicate-record identification.
- Treat institution profiles as internal records only; do not provide institution login or self-service access in V1.

## 3. Security Deposit / FDR Register

- Maintain institution-wise and instrument-wise records in a centralized searchable repository.
- Record the instrument type, FDR/reference number, issuing bank and branch details, deposit amount, currency, issue date, maturity date, tenure, interest details when available, and other prescribed instrument details.
- Record whether the instrument is a new deposit, renewal, replacement, or another applicable instrument event.
- Record the applicable approval/compliance reference, current administrative status, assigned reviewer, important dates, and internal remarks.
- Display a complete instrument profile with its current status, associated institution, documents, verification history, renewal/replacement chain, and related release/refund requests.
- Support search and filters by institution, FDR/reference number, bank, amount range, issue date, maturity date, status, reviewer, and pending action.
- Identify possible duplicate FDR numbers or duplicate instrument records for official review.

## 4. Digital Document Management

- Allow authorized AICTE users to add and manage FDR copies, deposit confirmations, renewal or replacement documents, institution correspondence, verification evidence, scrutiny notes, and other prescribed supporting records.
- Associate every document with the relevant institution, FDR/instrument, and case.
- Display document name/type, received date, uploaded date, source/reference, version, and review status where applicable.
- Support secure document preview, download, replacement, and retrieval according to user permissions.
- Preserve previous document versions and document history rather than silently overwriting important records.
- Track missing, unreadable, incomplete, expired, or otherwise questionable documents for scrutiny.

## 5. Scrutiny and Verification Management

- Provide an official review workspace for examining instrument details and supporting documents.
- Show submitted/provided details separately from details independently confirmed through an authorized verification source.
- Allow officials to record the verification method, source, reference number, verification date, result, and supporting evidence.
- Support verification states such as pending, in review, verified, unable to verify, and discrepancy found.
- Allow reviewers to record structured observations, request/record additional information received through authorized channels, and assign follow-up actions.
- Flag missing fields, inconsistent dates, mismatched amounts, inconsistent institution details, duplicate references, and other review concerns.
- Do not treat document upload, automated field extraction, or a reviewer note as independent bank confirmation.
- Do not automatically declare an FDR genuine or approve a regulatory case solely from an uploaded document.

## 6. FDR Status and Lifecycle Tracking

- Track each instrument from initial record creation through scrutiny, active monitoring, maturity, renewal/replacement, and eligible release or closure.
- Provide clear, consistent statuses for the instrument and separate statuses for its verification and administrative case.
- Distinguish active, expiring soon, matured, overdue, renewal pending, renewed, replaced, release/refund requested, under review, approved, released/discharged, rejected, and closed states as applicable.
- Show a chronological timeline of submissions, document updates, scrutiny observations, verification outcomes, status changes, decisions, and actions.
- Preserve links between an original instrument and its renewed or replacement instrument.
- Prevent a status change from erasing or hiding the instrument's previous history.

## 7. Maturity, Validity, and Renewal Monitoring

- Monitor issue dates, maturity dates, validity periods, and other configured deadlines.
- Identify instruments approaching maturity and instruments that have matured or passed a required action date.
- Support configurable advance reminder periods and escalation thresholds.
- Show upcoming, due, overdue, and unresolved renewal/replacement actions in dedicated work queues.
- Record renewal or replacement submissions and associate them with the previous instrument.
- Maintain the full renewal/replacement history, including previous and new reference numbers, dates, amounts, documents, review outcomes, and status.
- Allow authorized officials to record the outcome of each renewal review.

## 8. Release, Discharge, and Refund Case Management

- Maintain internal records of release, discharge, or refund requests relating to an institution's security deposit/FDR.
- Link each request to the institution, relevant instrument, applicable approval/compliance reference, and supporting documents.
- Track request receipt, scrutiny, missing information, observations, recommendation, competent-authority decision, and final administrative outcome.
- Provide separate work queues for requests awaiting review, requiring additional scrutiny, awaiting competent-authority decision, approved, rejected, and completed cases.
- Record the decision-maker, decision date, decision, remarks, and supporting evidence.
- Record release/discharge/refund completion details only when the applicable authorization and completion evidence are available.
- Keep the financial instrument's lifecycle history and the release/refund case history linked and auditable.
- Do not initiate bank transfers or move funds through the portal.

## 9. Notifications, Reminders, and Escalations

- Provide an internal notification centre for assigned reviewers, approving officials, and administrators.
- Generate reminders for upcoming maturity dates, renewal deadlines, pending verification, missing documents, unresolved discrepancies, and cases awaiting decisions.
- Highlight overdue and unassigned cases.
- Support configurable reminder schedules, escalation rules, recipient roles, and notification categories.
- Show notification history, delivery/processing status where available, and the related record or case.
- Prevent repeated unnecessary alerts for actions that have already been completed or resolved.

## 10. Work Queues and Case Assignment

- Provide consolidated queues for pending verification, discrepancies, missing documents, upcoming expiries, overdue renewals, release/refund scrutiny, and cases awaiting approval.
- Allow authorized users to assign or reassign records and cases to officials.
- Display case priority, due date, age, current owner, current status, and next required action.
- Support filtering, sorting, and quick navigation from a queue to the relevant instrument or case.
- Show workload and pending-case summaries for authorized supervisors.

## 11. Reports and Management Views

- Provide reports for institution-wise and instrument-wise holdings, active deposits, upcoming maturities, matured/overdue instruments, pending verifications, discrepancies, renewals/replacements, and release/refund cases.
- Support date-range, institution, bank, status, and reviewer filters.
- Show summary totals and provide access to the underlying records supporting each total.
- Support export of authorized reports for official review and administrative use.
- Make report data traceable to the underlying instrument and case records.

## 12. Audit Trail and Record History

- Record who created, viewed where required, uploaded, edited, assigned, reviewed, verified, approved, rejected, or changed a record or case.
- Capture the action, user, date/time, affected record, and relevant before/after values for important changes.
- Preserve verification evidence, scrutiny observations, decisions, and document history.
- Make audit records searchable by institution, FDR/reference number, case, user, action, and date range.
- Restrict audit-log modification and deletion to protect accountability and record integrity.

## 13. Internal User and Role Management

- Support internal AICTE user accounts and role-based permissions.
- Distinguish permissions for portal administration, record management, scrutiny/review, and competent-authority decisions.
- Restrict sensitive records and approval actions to authorized roles.
- Support user activation/deactivation and assignment to relevant work areas.
- Record important user and permission changes in the audit trail.

## 14. Master Data and Configuration

- Maintain configurable reference data such as banks, institution categories, instrument types, administrative statuses, document types, and applicable workflow categories.
- Allow authorized administrators to configure reminder periods, escalation thresholds, and internal workflow assignments.
- Maintain configuration change history and restrict configuration changes to authorized roles.

## 15. Security and Data Protection

- Protect institutional and financial information through role-based access and controlled document access.
- Maintain secure authentication and session handling for internal users.
- Protect stored documents and sensitive record data against unauthorized access or alteration.
- Maintain auditability for access to sensitive records and important administrative actions.
- Ensure that users can access only the institutions, records, documents, queues, reports, and actions permitted by their roles.

## 16. V1 Scope Boundaries

- V1 is an AICTE internal administrative portal only.
- There is no institution-facing login, dashboard, self-service submission workflow, or institution user account in V1.
- There is no bank-facing login or bank user account in V1.
- There is no public-facing portal.
- Institution information and documents are maintained by authorized AICTE users based on information received through authorized channels.
- Bank verification results must be recorded separately from institution-provided information. Any independent verification must be based on an authorized source and available evidence.
- The portal supports administrative tracking and decision records; it does not independently make regulatory decisions or transfer/refund money.
