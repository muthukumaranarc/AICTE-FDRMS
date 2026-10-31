export type UserRole = 'ROLE_REVIEWER' | 'ROLE_APPROVER' | 'ROLE_ADMIN';

export type InstrumentType = 'FDR' | 'BANK_GUARANTEE' | 'JOINT_TERM_DEPOSIT' | 'ESCROW_DEPOSIT';

export type InstrumentStatus =
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'MATURED'
  | 'OVERDUE'
  | 'RENEWAL_PENDING'
  | 'RENEWED'
  | 'REPLACED'
  | 'RELEASE_PENDING'
  | 'RELEASED'
  | 'CLOSED';

export type VerificationStatus =
  | 'PENDING_SCRUTINY'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'DISCREPANCY_FOUND'
  | 'UNABLE_TO_VERIFY';

export type CaseStatus =
  | 'AWAITING_SCRUTINY'
  | 'SCRUTINY_IN_PROGRESS'
  | 'DISCREPANCY_NOTED'
  | 'RECOMMENDED_FOR_APPROVAL'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export type DocumentType =
  | 'FDR_ORIGINAL_COPY'
  | 'BANK_CONFIRMATION_LETTER'
  | 'JOINT_LIEN_UNDERTAKING'
  | 'RENEWAL_RECEIPT'
  | 'INSTITUTION_COVER_LETTER'
  | 'SCRUTINY_SHEET'
  | 'SANCTION_ORDER'
  | 'RELEASE_DISCHARGE_ORDER'
  | 'LEGAL_AFFIDAVIT'
  | 'OTHER';

export type DocumentStatus = 'PENDING_REVIEW' | 'ACCEPTED' | 'QUESTIONABLE' | 'REJECTED';

export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ScrutinySeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface InternalUser {
  id: string;
  name: string;
  designation: string;
  email: string;
  role: UserRole;
  bureau: string;
  phone: string;
  status: string;
  assignedCasesCount: number;
}

export interface Institution {
  id: string;
  aictePermanentId: string;
  currentApplicationId: string;
  name: string;
  institutionType: string;
  state: string;
  district: string;
  pincode: string;
  address: string;
  headName: string;
  headDesignation: string;
  headEmail: string;
  headPhone: string;
  registrarEmail: string;
  approvalStatus: string;
  administrativeNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FdrInstrument {
  id: string;
  fdrNumber: string;
  institutionId: string;
  institutionName: string;
  institutionAicteId: string;
  instrumentType: InstrumentType;
  bankName: string;
  branchName: string;
  branchIfsc: string;
  amount: number;
  currency: string;
  issueDate: string;
  maturityDate: string;
  tenureMonths: number;
  interestRate: number;
  interestType: string;
  maturityAmount: number;
  jointLienMarked: boolean;
  jointHolderName: string;
  instrumentEvent: string;
  complianceReference: string;
  instrumentStatus: InstrumentStatus;
  verificationStatus: VerificationStatus;
  assignedReviewerId: string;
  assignedReviewerName: string;
  priority: Priority;
  previousFdrId?: string;
  nextFdrId?: string;
  remarks: string;
  flagMissingDocuments: boolean;
  flagDiscrepancy: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  fdrId: string;
  institutionId: string;
  caseId?: string;
  documentType: DocumentType;
  title: string;
  fileName: string;
  fileSize: string;
  fileContentType: string;
  fileContent?: string;
  receivedDate: string;
  uploadedDate: string;
  uploadedBy: string;
  sourceReference: string;
  version: number;
  status: DocumentStatus;
  scrutinyFlags: string[];
  notes?: string;
}

export interface ScrutinyVerificationRecord {
  id: string;
  fdrId: string;
  institutionId: string;
  verificationMethod: string;
  verificationSource: string;
  referenceNumber: string;
  verificationDate: string;
  result: string;
  verifiedBy: string;
  supportingDocumentId?: string;
  confirmedAmount: number;
  confirmedMaturityDate: string;
  confirmedLienStatus: boolean;
  discrepancyDetails?: string;
  remarks?: string;
  createdAt: string;
}

export interface ScrutinyObservation {
  id: string;
  fdrId: string;
  institutionId: string;
  category: string;
  severity: ScrutinySeverity;
  observation: string;
  followUpRequired: boolean;
  actionRequired?: string;
  recordedBy: string;
  recordedAt: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface ReleaseRefundCase {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionAicteId: string;
  fdrId: string;
  fdrNumber: string;
  amount: number;
  requestReason: string;
  requestDate: string;
  institutionLetterRef: string;
  caseStatus: CaseStatus;
  assignedReviewer: string;
  complianceChecklist: Record<string, boolean>;
  scrutinyRecommendation?: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  authorityDecision: string;
  decisionDate?: string;
  sanctionOrderNumber?: string;
  authorityRemarks?: string;
  authorizedBy?: string;
  releaseCompletionDate?: string;
  dischargeCertificateNo?: string;
  dispatchReference?: string;
  completionRemarks?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  category: string;
  title: string;
  message: string;
  severity: string;
  targetRole: string;
  targetUser?: string;
  relatedEntityType: string;
  relatedEntityId: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditTrailEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  userRole: string;
  timestamp: string;
  details: string;
  beforeValue?: string;
  afterValue?: string;
  ipAddress?: string;
}

export interface BankMaster {
  id: string;
  bankName: string;
  bankCategory: string;
  ifscPrefix: string;
  active: boolean;
}

export interface MasterConfiguration {
  advanceReminderDays: number[];
  escalationThresholdDays: number;
  scrutinyDueDays: number;
  authorizedBanks: BankMaster[];
  institutionCategories: string[];
  instrumentTypes: string[];
  documentTypes: string[];
  lastUpdated?: string;
  updatedBy?: string;
}

export interface DashboardStats {
  totalInstruments: number;
  totalDepositAmount: number;
  activeCount: number;
  activeAmount: number;
  expiringSoonCount: number;
  expiringSoonAmount: number;
  maturedCount: number;
  maturedAmount: number;
  overdueCount: number;
  overdueAmount: number;
  pendingVerificationCount: number;
  pendingVerificationAmount: number;
  renewalPendingCount: number;
  renewalPendingAmount: number;
  releasePendingCount: number;
  releasePendingAmount: number;
  releasedCount: number;
  releasedAmount: number;
  closedCount: number;
  closedAmount: number;
  urgentCasesCount: number;
  missingDocumentsCount: number;
  unresolvedDiscrepanciesCount: number;
  recentActivities: AuditTrailEntry[];
  urgentCases: FdrInstrument[];
  bankConcentration: Record<string, number>;
}

export interface QueueItem {
  instrument: FdrInstrument;
  ageDays: number;
  daysToMaturity: number;
  nextRequiredAction: string;
}
