import {
  AuditTrailEntry,
  DashboardStats,
  DocumentRecord,
  DocumentStatus,
  FdrInstrument,
  Institution,
  InternalUser,
  MasterConfiguration,
  Notification,
  QueueItem,
  ReleaseRefundCase,
  ScrutinyObservation,
  ScrutinyVerificationRecord
} from '../types';
import {
  fallbackStats,
  fallbackInstitutions,
  fallbackFdrs,
  fallbackDocuments,
  fallbackReleaseCases,
  fallbackUsers,
  fallbackNotifications,
  fallbackAuditEntries,
  fallbackMasterConfig
} from './fallbackData';

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' ? localStorage.getItem('aicte_api_base_url') : null) ||
  '/api';

export const getApiBaseUrl = (): string => API_BASE;
export const setCustomApiBaseUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    if (url) {
      localStorage.setItem('aicte_api_base_url', url.replace(/\/+$/, ''));
    } else {
      localStorage.removeItem('aicte_api_base_url');
    }
  }
};

// Current active simulated user for internal AICTE RBAC testing
let currentUser: InternalUser = {
  id: 'USR-002',
  name: 'Smt. Ananya Sen',
  designation: 'Deputy Director (Case Scrutiny)',
  email: 'sen.a@aicte-india.org',
  role: 'ROLE_REVIEWER',
  bureau: 'Regulation Bureau, Scrutiny Cell',
  phone: '+91 11 2958 1042',
  status: 'ACTIVE',
  assignedCasesCount: 6
};

export const getCurrentUser = (): InternalUser => currentUser;

export const setCurrentUser = (user: InternalUser) => {
  currentUser = user;
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-User-Email': currentUser.email,
  'X-User-Role': currentUser.role
});

export const api = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return await res.json();
    } catch {
      return fallbackStats;
    }
  },

  // Institutions
  getInstitutions: async (params?: { query?: string; state?: string; type?: string }): Promise<Institution[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.append('query', params.query);
      if (params?.state) searchParams.append('state', params.state);
      if (params?.type) searchParams.append('type', params.type);
      const res = await fetch(`${API_BASE}/institutions?${searchParams.toString()}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch institutions');
      return await res.json();
    } catch {
      let filtered = [...fallbackInstitutions];
      if (params?.query) {
        const q = params.query.toLowerCase();
        filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.aictePermanentId.includes(q));
      }
      if (params?.state) filtered = filtered.filter(i => i.state.toLowerCase() === params.state!.toLowerCase());
      if (params?.type) filtered = filtered.filter(i => i.institutionType.toLowerCase() === params.type!.toLowerCase());
      return filtered;
    }
  },

  getInstitutionById: async (id: string): Promise<Institution> => {
    const res = await fetch(`${API_BASE}/institutions/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch institution');
    return res.json();
  },

  getInstitutionDetails: async (id: string): Promise<{ institution: Institution; fdrs: FdrInstrument[]; documents: DocumentRecord[]; releaseCases: ReleaseRefundCase[]; totalDepositAmount: number }> => {
    const res = await fetch(`${API_BASE}/institutions/${id}/details`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch institution details');
    return res.json();
  },

  checkInstitutionDuplicates: async (name?: string, aicteId?: string, excludeId?: string): Promise<Institution[]> => {
    const searchParams = new URLSearchParams();
    if (name) searchParams.append('name', name);
    if (aicteId) searchParams.append('aicteId', aicteId);
    if (excludeId) searchParams.append('excludeId', excludeId);
    const res = await fetch(`${API_BASE}/institutions/check-duplicates?${searchParams.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to check institution duplicates');
    return res.json();
  },

  createInstitution: async (data: Partial<Institution>): Promise<Institution> => {
    const res = await fetch(`${API_BASE}/institutions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create institution');
    return res.json();
  },

  updateInstitution: async (id: string, data: Partial<Institution>): Promise<Institution> => {
    const res = await fetch(`${API_BASE}/institutions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update institution');
    return res.json();
  },

  // FDRs
  getFdrs: async (params?: {
    query?: string;
    institutionId?: string;
    bank?: string;
    status?: string;
    verifStatus?: string;
    minAmount?: number;
    maxAmount?: number;
    reviewer?: string;
  }): Promise<FdrInstrument[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.append('query', params.query);
      if (params?.institutionId) searchParams.append('institutionId', params.institutionId);
      if (params?.bank) searchParams.append('bank', params.bank);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.verifStatus) searchParams.append('verifStatus', params.verifStatus);
      if (params?.minAmount) searchParams.append('minAmount', params.minAmount.toString());
      if (params?.maxAmount) searchParams.append('maxAmount', params.maxAmount.toString());
      if (params?.reviewer) searchParams.append('reviewer', params.reviewer);
      const res = await fetch(`${API_BASE}/fdrs?${searchParams.toString()}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch FDRs');
      return await res.json();
    } catch {
      let filtered = [...fallbackFdrs];
      if (params?.query) {
        const q = params.query.toLowerCase();
        filtered = filtered.filter(f => f.fdrNumber.toLowerCase().includes(q) || f.institutionName.toLowerCase().includes(q));
      }
      if (params?.institutionId) filtered = filtered.filter(f => f.institutionId === params.institutionId);
      if (params?.bank) filtered = filtered.filter(f => f.bankName === params.bank);
      if (params?.status) filtered = filtered.filter(f => f.instrumentStatus === params.status);
      if (params?.verifStatus) filtered = filtered.filter(f => f.verificationStatus === params.verifStatus);
      return filtered;
    }
  },

  getFdrById: async (id: string): Promise<FdrInstrument> => {
    const res = await fetch(`${API_BASE}/fdrs/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch FDR');
    return res.json();
  },

  checkFdrDuplicates: async (fdrNumber: string, excludeId?: string): Promise<FdrInstrument[]> => {
    const searchParams = new URLSearchParams();
    searchParams.append('fdrNumber', fdrNumber);
    if (excludeId) searchParams.append('excludeId', excludeId);
    const res = await fetch(`${API_BASE}/fdrs/check-duplicates?${searchParams.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to check FDR duplicates');
    return res.json();
  },

  createFdr: async (fdr: Partial<FdrInstrument>): Promise<FdrInstrument> => {
    const res = await fetch(`${API_BASE}/fdrs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(fdr)
    });
    if (!res.ok) throw new Error('Failed to create FDR');
    return res.json();
  },

  updateFdr: async (id: string, fdr: Partial<FdrInstrument>): Promise<FdrInstrument> => {
    const res = await fetch(`${API_BASE}/fdrs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(fdr)
    });
    if (!res.ok) throw new Error('Failed to update FDR');
    return res.json();
  },

  recordRenewal: async (renewalData: any): Promise<FdrInstrument> => {
    const res = await fetch(`${API_BASE}/fdrs/renew`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...renewalData, performedBy: currentUser.email })
    });
    if (!res.ok) throw new Error('Failed to record renewal');
    return res.json();
  },

  assignFdrReviewer: async (fdrId: string, reviewerId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/fdrs/${fdrId}/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reviewerId })
    });
    if (!res.ok) throw new Error('Failed to assign reviewer');
  },

  // Documents
  getDocuments: async (params?: { fdrId?: string; institutionId?: string; caseId?: string }): Promise<DocumentRecord[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.fdrId) searchParams.append('fdrId', params.fdrId);
      if (params?.institutionId) searchParams.append('institutionId', params.institutionId);
      if (params?.caseId) searchParams.append('caseId', params.caseId);
      const res = await fetch(`${API_BASE}/documents?${searchParams.toString()}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch documents');
      return await res.json();
    } catch {
      let filtered = [...fallbackDocuments];
      if (params?.fdrId) filtered = filtered.filter(d => d.fdrId === params.fdrId);
      if (params?.institutionId) filtered = filtered.filter(d => d.institutionId === params.institutionId);
      return filtered;
    }
  },

  addDocument: async (doc: Partial<DocumentRecord>): Promise<DocumentRecord> => {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(doc)
    });
    if (!res.ok) throw new Error('Failed to add document');
    return res.json();
  },

  updateDocumentStatus: async (
    id: string,
    status: DocumentStatus,
    flags: string[],
    notes?: string
  ): Promise<DocumentRecord> => {
    const res = await fetch(`${API_BASE}/documents/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, flags, notes })
    });
    if (!res.ok) throw new Error('Failed to update document status');
    return res.json();
  },

  // Scrutiny & Verification
  getVerifications: async (fdrId: string): Promise<ScrutinyVerificationRecord[]> => {
    const res = await fetch(`${API_BASE}/scrutiny/verifications?fdrId=${fdrId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch verifications');
    return res.json();
  },

  getObservations: async (fdrId: string): Promise<ScrutinyObservation[]> => {
    const res = await fetch(`${API_BASE}/scrutiny/observations?fdrId=${fdrId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch observations');
    return res.json();
  },

  recordVerification: async (data: any): Promise<ScrutinyVerificationRecord> => {
    const res = await fetch(`${API_BASE}/scrutiny/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record verification');
    return res.json();
  },

  recordObservation: async (data: any): Promise<ScrutinyObservation> => {
    const res = await fetch(`${API_BASE}/scrutiny/observations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...data, recordedBy: currentUser.email })
    });
    if (!res.ok) throw new Error('Failed to record observation');
    return res.json();
  },

  resolveObservation: async (id: string, resolutionNotes: string): Promise<ScrutinyObservation> => {
    const res = await fetch(`${API_BASE}/scrutiny/observations/${id}/resolve`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ resolutionNotes })
    });
    if (!res.ok) throw new Error('Failed to resolve observation');
    return res.json();
  },

  // Release & Refund Cases
  getReleaseCases: async (status?: string, institutionId?: string): Promise<ReleaseRefundCase[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (status) searchParams.append('status', status);
      if (institutionId) searchParams.append('institutionId', institutionId);
      const res = await fetch(`${API_BASE}/release-cases?${searchParams.toString()}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch release cases');
      return await res.json();
    } catch {
      let filtered = [...fallbackReleaseCases];
      if (status) filtered = filtered.filter(c => c.caseStatus === status);
      if (institutionId) filtered = filtered.filter(c => c.institutionId === institutionId);
      return filtered;
    }
  },

  getReleaseCaseById: async (id: string): Promise<ReleaseRefundCase> => {
    const res = await fetch(`${API_BASE}/release-cases/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch release case');
    return res.json();
  },

  createReleaseCase: async (data: Partial<ReleaseRefundCase>): Promise<ReleaseRefundCase> => {
    const res = await fetch(`${API_BASE}/release-cases`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create release case');
    return res.json();
  },

  updateReleaseScrutiny: async (
    id: string,
    checklist: Record<string, boolean>,
    recommendation: string,
    reviewerNotes: string
  ): Promise<ReleaseRefundCase> => {
    const res = await fetch(`${API_BASE}/release-cases/${id}/scrutiny`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ checklist, recommendation, reviewerNotes })
    });
    if (!res.ok) throw new Error('Failed to update scrutiny');
    return res.json();
  },

  recordAuthorityDecision: async (
    caseId: string,
    decision: string,
    sanctionOrderNumber: string,
    authorityRemarks: string,
    decisionDate?: string
  ): Promise<ReleaseRefundCase> => {
    const res = await fetch(`${API_BASE}/release-cases/${caseId}/decision`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        decision,
        sanctionOrderNumber,
        authorityRemarks,
        decisionDate,
        authorizedBy: currentUser.email
      })
    });
    if (!res.ok) throw new Error('Failed to record authority decision');
    return res.json();
  },

  recordReleaseCompletion: async (
    caseId: string,
    dischargeCertificateNo: string,
    dispatchReference: string,
    completionRemarks: string,
    releaseCompletionDate?: string
  ): Promise<ReleaseRefundCase> => {
    const res = await fetch(`${API_BASE}/release-cases/${caseId}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        dischargeCertificateNo,
        dispatchReference,
        completionRemarks,
        releaseCompletionDate,
        completedBy: currentUser.email
      })
    });
    if (!res.ok) throw new Error('Failed to record release completion');
    return res.json();
  },

  // Work Queues
  getQueueSummary: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/queues/summary`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch queue summary');
    return res.json();
  },

  getPendingVerificationQueue: async (): Promise<QueueItem[]> => {
    const res = await fetch(`${API_BASE}/queues/pending-verification`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch pending verification queue');
    return res.json();
  },

  getDiscrepanciesQueue: async (): Promise<QueueItem[]> => {
    const res = await fetch(`${API_BASE}/queues/discrepancies`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch discrepancies queue');
    return res.json();
  },

  getMissingDocumentsQueue: async (): Promise<QueueItem[]> => {
    const res = await fetch(`${API_BASE}/queues/missing-documents`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch missing documents queue');
    return res.json();
  },

  getUpcomingExpiriesQueue: async (): Promise<QueueItem[]> => {
    const res = await fetch(`${API_BASE}/queues/upcoming-expiries`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch upcoming expiries queue');
    return res.json();
  },

  getOverdueRenewalsQueue: async (): Promise<QueueItem[]> => {
    const res = await fetch(`${API_BASE}/queues/overdue-renewals`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch overdue renewals queue');
    return res.json();
  },

  getReleaseScrutinyQueue: async (): Promise<ReleaseRefundCase[]> => {
    const res = await fetch(`${API_BASE}/queues/release-scrutiny`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch release scrutiny queue');
    return res.json();
  },

  getAuthorityApprovalQueue: async (): Promise<ReleaseRefundCase[]> => {
    const res = await fetch(`${API_BASE}/queues/authority-approval`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch authority approval queue');
    return res.json();
  },

  // Notifications
  getNotifications: async (category?: string): Promise<Notification[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (category) searchParams.append('category', category);
      const res = await fetch(`${API_BASE}/notifications?${searchParams.toString()}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return await res.json();
    } catch {
      return fallbackNotifications;
    }
  },

  getUnreadNotifCount: async (): Promise<number> => {
    try {
      const res = await fetch(`${API_BASE}/notifications/unread-count`, { headers: getHeaders() });
      if (!res.ok) return fallbackNotifications.filter(n => !n.isRead).length;
      const data = await res.json();
      return data.unreadCount ?? fallbackNotifications.filter(n => !n.isRead).length;
    } catch {
      return fallbackNotifications.filter(n => !n.isRead).length;
    }
  },

  markNotificationAsRead: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH', headers: getHeaders() });
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    await fetch(`${API_BASE}/notifications/mark-all-read`, { method: 'POST', headers: getHeaders() });
  },

  dismissNotification: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/notifications/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  // Reports
  getInstitutionHoldingsReport: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/reports/institution-holdings`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch institution holdings report');
    return res.json();
  },

  getBankConcentrationReport: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/reports/bank-concentration`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch bank concentration report');
    return res.json();
  },

  // Audit
  getAuditTrail: async (params?: { entityType?: string; entityId?: string; action?: string; user?: string }): Promise<AuditTrailEntry[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.entityType) searchParams.append('entityType', params.entityType);
      if (params?.entityId) searchParams.append('entityId', params.entityId);
      if (params?.action) searchParams.append('action', params.action);
      if (params?.user) searchParams.append('user', params.user);
      const res = await fetch(`${API_BASE}/audit?${searchParams.toString()}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch audit trail');
      return await res.json();
    } catch {
      return fallbackAuditEntries;
    }
  },

  // Users
  getUsers: async (): Promise<InternalUser[]> => {
    try {
      const res = await fetch(`${API_BASE}/users`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch {
      return fallbackUsers;
    }
  },

  createUser: async (user: Partial<InternalUser>): Promise<InternalUser> => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  updateUser: async (id: string, user: Partial<InternalUser>): Promise<InternalUser> => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  // Master Data
  getMasterConfiguration: async (): Promise<MasterConfiguration> => {
    try {
      const res = await fetch(`${API_BASE}/master-data`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch master configuration');
      return await res.json();
    } catch {
      return fallbackMasterConfig;
    }
  },

  updateMasterConfiguration: async (config: MasterConfiguration): Promise<MasterConfiguration> => {
    const res = await fetch(`${API_BASE}/master-data`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Failed to update master configuration');
    return res.json();
  }
};
