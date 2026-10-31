import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Landmark,
  Building2,
  ArrowUpRightSquare,
  FileText,
  LayoutDashboard,
  ListTodo,
  RefreshCw,
  BarChart3,
  ShieldCheck,
  Settings,
  CornerDownRight,
  ExternalLink,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { FdrInstrument, Institution, ReleaseRefundCase, DocumentRecord } from '../types';
import { formatInrCompact, formatDate } from '../utils/formatters';
import { NavTab } from './Navigation';

interface GlobalSearchProps {
  fdrs: FdrInstrument[];
  institutions: Institution[];
  releaseCases: ReleaseRefundCase[];
  documents: DocumentRecord[];
  onSelectTab: (tab: NavTab) => void;
  onSelectFdr: (fdr: FdrInstrument) => void;
  onSelectInstitution: (institutionId: string) => void;
  onSelectReleaseCase: (releaseCase: ReleaseRefundCase) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  fdrs,
  institutions,
  releaseCases,
  documents,
  onSelectTab,
  onSelectFdr,
  onSelectInstitution,
  onSelectReleaseCase
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showMoreFdrs, setShowMoreFdrs] = useState(false);
  const [showMoreInsts, setShowMoreInsts] = useState(false);
  const [showMoreDocs, setShowMoreDocs] = useState(false);
  const [showMoreCases, setShowMoreCases] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Ctrl+K or / or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === '/' && !isOpen && (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus modal input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus();
        modalInputRef.current?.select();
      }, 30);
    }
  }, [isOpen]);

  // Lock body scroll and prevent background interaction when search is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const cleanQuery = query.trim().toLowerCase();

  // Search in FDRs
  const matchedFdrs = cleanQuery
    ? fdrs.filter(
        (f) =>
          f.fdrNumber?.toLowerCase().includes(cleanQuery) ||
          f.bankName?.toLowerCase().includes(cleanQuery) ||
          f.institutionName?.toLowerCase().includes(cleanQuery) ||
          f.branchName?.toLowerCase().includes(cleanQuery) ||
          f.branchIfsc?.toLowerCase().includes(cleanQuery) ||
          f.instrumentStatus?.toLowerCase().includes(cleanQuery)
      )
    : [];

  // Search in Institutions
  const matchedInstitutions = cleanQuery
    ? institutions.filter(
        (i) =>
          i.name?.toLowerCase().includes(cleanQuery) ||
          i.aictePermanentId?.toLowerCase().includes(cleanQuery) ||
          i.state?.toLowerCase().includes(cleanQuery) ||
          i.district?.toLowerCase().includes(cleanQuery) ||
          i.institutionType?.toLowerCase().includes(cleanQuery)
      )
    : [];

  // Search in Release Cases
  const matchedReleaseCases = cleanQuery
    ? releaseCases.filter(
        (c) =>
          c.id?.toLowerCase().includes(cleanQuery) ||
          c.fdrNumber?.toLowerCase().includes(cleanQuery) ||
          c.institutionName?.toLowerCase().includes(cleanQuery) ||
          c.requestReason?.toLowerCase().includes(cleanQuery) ||
          c.caseStatus?.toLowerCase().includes(cleanQuery)
      )
    : [];

  // Search in Digital Documents
  const matchedDocuments = cleanQuery
    ? documents.filter(
        (d) =>
          d.title?.toLowerCase().includes(cleanQuery) ||
          d.fileName?.toLowerCase().includes(cleanQuery) ||
          d.documentType?.toLowerCase().includes(cleanQuery) ||
          d.sourceReference?.toLowerCase().includes(cleanQuery) ||
          d.fdrId?.toLowerCase().includes(cleanQuery)
      )
    : [];

  // Search in Pages / Navigation Tabs
  const portalPages: { id: NavTab; title: string; subtitle: string; icon: any }[] = [
    { id: 'dashboard', title: 'Dashboard Overview', subtitle: 'Product page · Central security deposit metrics and urgent deadlines', icon: LayoutDashboard },
    { id: 'institutions', title: 'Institution Registry', subtitle: 'Product page · AICTE technical institution profiles and holding directory', icon: Building2 },
    { id: 'fdrs', title: 'FDR Register', subtitle: 'Product page · Fixed deposit receipts, joint lien records, and maturity schedule', icon: Landmark },
    { id: 'scrutiny', title: 'Scrutiny & Bank Verification', subtitle: 'Workspace · Bank confirmation letters, observations, and discrepancy tracker', icon: CornerDownRight },
    { id: 'queues', title: 'Work Queues', subtitle: 'Task queues · Pending scrutiny, discrepancies, upcoming expiries, and sanctions', icon: ListTodo },
    { id: 'renewals', title: 'Renewals & Replacements', subtitle: 'Lifecycle · FDR renewal processing, rollover receipts, and substitution with BG', icon: RefreshCw },
    { id: 'releases', title: 'Release & Refund Sanctions', subtitle: 'Lifecycle · Formal release scrutiny, sanction orders, and discharge certificates', icon: ArrowUpRightSquare },
    { id: 'documents', title: 'Digital Document Repository', subtitle: 'Documentation · Official bank confirmation evidence, receipts, and court clearances', icon: FileText },
    { id: 'reports', title: 'Reports & Concentration Analytics', subtitle: 'Analytics · Bank exposure limits, institution holdings, and CSV exports', icon: BarChart3 },
    { id: 'audit', title: 'Cryptographic Audit Trail', subtitle: 'Security · SHA-256 chained tamper-evident governance ledger', icon: ShieldCheck },
    { id: 'admin', title: 'Master Data & Settings', subtitle: 'System · Authorized bank master, reminder schedules, and user management', icon: Settings }
  ];

  const matchedPages = cleanQuery
    ? portalPages.filter(
        (p) =>
          p.title.toLowerCase().includes(cleanQuery) ||
          p.subtitle.toLowerCase().includes(cleanQuery) ||
          p.id.toLowerCase().includes(cleanQuery)
      )
    : [];

  // Assemble "Top results"
  const topResults: Array<
    | { type: 'FDR'; item: FdrInstrument }
    | { type: 'INST'; item: Institution }
    | { type: 'PAGE'; item: typeof portalPages[0] }
    | { type: 'CASE'; item: ReleaseRefundCase }
  > = [];

  if (cleanQuery) {
    if (matchedPages[0]) topResults.push({ type: 'PAGE', item: matchedPages[0] });
    if (matchedFdrs[0]) topResults.push({ type: 'FDR', item: matchedFdrs[0] });
    if (matchedInstitutions[0]) topResults.push({ type: 'INST', item: matchedInstitutions[0] });
    if (matchedReleaseCases[0]) topResults.push({ type: 'CASE', item: matchedReleaseCases[0] });
    if (matchedFdrs[1] && topResults.length < 5) topResults.push({ type: 'FDR', item: matchedFdrs[1] });
  }

  const hasResults =
    topResults.length > 0 ||
    matchedFdrs.length > 0 ||
    matchedInstitutions.length > 0 ||
    matchedPages.length > 0 ||
    matchedReleaseCases.length > 0 ||
    matchedDocuments.length > 0;

  return (
    <>
      {/* 1. Header Search Bar Trigger matching reference Image 1 */}
      <div className="relative w-full">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          placeholder="Search FDR no., institution, bank..."
          className="w-full bg-white border border-blue-400 hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 focus:outline-none rounded-lg pl-8 pr-12 py-1.5 text-xs text-slate-700 placeholder-slate-400 cursor-text transition"
        />
        <div
          onClick={() => setIsOpen(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded cursor-pointer hover:border-slate-300 select-none"
        >
          <span>⌘K</span>
        </div>
      </div>

      {/* 2. Google Cloud Console Style Search Overlay / Command Center */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex justify-center items-start pt-3 sm:pt-4 px-3">
            {/* Viewport Backdrop: Blurs the entire website and applies a subtle translucent dark/gray tint */}
            <div
              className="fixed inset-0 transition-opacity duration-200"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.42)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)'
              }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Container directly matching Google Cloud Console Search UI from Reference Image 2 */}
            <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl border border-slate-300 z-10 overflow-hidden flex flex-col max-h-[86vh] text-left">
            {/* Top Search Input Row (Google Cloud Console Header with #e8edf4 background) */}
            <div className="flex items-center bg-[#e8edf4] border-b border-slate-300 px-3 py-1.5 min-h-[46px] select-none">
              <input
                ref={modalInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search FDR no., institution, bank, case ID, pages..."
                className="flex-1 bg-transparent border-none text-[14px] text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-0 px-2 font-normal"
              />

              {/* Clear button 'X' */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    modalInputRef.current?.focus();
                  }}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded transition mr-1"
                  title="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Google Cloud Console Search Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => modalInputRef.current?.focus()}
                  className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded border border-slate-300 shadow-2xs flex items-center gap-1.5 transition"
                >
                  <Search className="w-3.5 h-3.5 text-slate-600" />
                  <span>Search</span>
                </button>

                {/* Google Cloud Console Collapse Toggle '<|' */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded text-xs transition"
                  title="Close search panel"
                >
                  <span className="font-mono text-xs text-slate-600">&lt;|</span>
                </button>
              </div>
            </div>

            {/* Results Body / Categorized Sections */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 scrollbar-thin">
              {cleanQuery ? (
                hasResults ? (
                  <>
                    {/* SECTION 1: Top results */}
                    {topResults.length > 0 && (
                      <div className="py-2.5">
                        <div className="px-5 pb-1.5 text-[13px] font-normal text-slate-700">
                          Top results
                        </div>
                        <div className="space-y-0.5">
                          {topResults.map((r, idx) => {
                            if (r.type === 'FDR') {
                              return (
                                <div
                                  key={`top-fdr-${r.item.id}-${idx}`}
                                  onClick={() => {
                                    onSelectFdr(r.item);
                                    setIsOpen(false);
                                  }}
                                  className="px-5 py-2 hover:bg-[#f1f5f9] cursor-pointer flex items-start gap-3.5 group transition"
                                >
                                  <Landmark className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-medium text-[#1a73e8] group-hover:underline">
                                      {r.item.fdrNumber}
                                    </div>
                                    <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                                      FDR Instrument · {formatInrCompact(r.item.amount)} · {r.item.bankName} · {r.item.institutionName} · {r.item.instrumentStatus}
                                    </div>
                                  </div>
                                </div>
                              );
                            } else if (r.type === 'INST') {
                              return (
                                <div
                                  key={`top-inst-${r.item.id}-${idx}`}
                                  onClick={() => {
                                    onSelectInstitution(r.item.id);
                                    setIsOpen(false);
                                  }}
                                  className="px-5 py-2 hover:bg-[#f1f5f9] cursor-pointer flex items-start gap-3.5 group transition"
                                >
                                  <Building2 className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-medium text-[#1a73e8] group-hover:underline">
                                      {r.item.name}
                                    </div>
                                    <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                                      Institution · AICTE ID: {r.item.aictePermanentId} · {r.item.institutionType} · {r.item.district}, {r.item.state}
                                    </div>
                                  </div>
                                </div>
                              );
                            } else if (r.type === 'CASE') {
                              return (
                                <div
                                  key={`top-case-${r.item.id}-${idx}`}
                                  onClick={() => {
                                    onSelectReleaseCase(r.item);
                                    setIsOpen(false);
                                  }}
                                  className="px-5 py-2 hover:bg-[#f1f5f9] cursor-pointer flex items-start gap-3.5 group transition"
                                >
                                  <ArrowUpRightSquare className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-medium text-[#1a73e8] group-hover:underline">
                                      Case {r.item.id} · Release & Refund
                                    </div>
                                    <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                                      Release Request · {formatInrCompact(r.item.amount)} · FDR: {r.item.fdrNumber} · {r.item.institutionName} · Status: {r.item.caseStatus}
                                    </div>
                                  </div>
                                </div>
                              );
                            } else {
                              const PageIcon = r.item.icon;
                              return (
                                <div
                                  key={`top-page-${r.item.id}-${idx}`}
                                  onClick={() => {
                                    onSelectTab(r.item.id);
                                    setIsOpen(false);
                                  }}
                                  className="px-5 py-2 hover:bg-[#f1f5f9] cursor-pointer flex items-start gap-3.5 group transition"
                                >
                                  <PageIcon className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-medium text-[#1a73e8] group-hover:underline">
                                      {r.item.title}
                                    </div>
                                    <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                                      {r.item.subtitle}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: Products & pages */}
                    {matchedPages.length > 0 && (
                      <div className="py-2.5">
                        <div className="px-5 pb-1.5 text-[13px] font-normal text-slate-700">
                          Products & pages
                        </div>
                        <div className="space-y-0.5">
                          {matchedPages.map((page) => {
                            const IconCmp = page.icon;
                            return (
                              <div
                                key={page.id}
                                onClick={() => {
                                  onSelectTab(page.id);
                                  setIsOpen(false);
                                }}
                                className="px-5 py-2 hover:bg-[#f1f5f9] cursor-pointer flex items-start gap-3.5 group transition"
                              >
                                <IconCmp className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-medium text-[#1a73e8] group-hover:underline">
                                    {page.title}
                                  </div>
                                  <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                                    {page.subtitle}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SECTION 3: FDR Instruments & Deposits */}
                    {matchedFdrs.length > 0 && (
                      <div className="py-2.5">
                        <div className="px-5 pb-1.5 text-[13px] font-normal text-slate-700 flex justify-between items-center">
                          <span>FDR Instruments & Deposits</span>
                          {matchedFdrs.length > 3 && (
                            <button
                              type="button"
                              onClick={() => setShowMoreFdrs(!showMoreFdrs)}
                              className="text-[13px] text-[#1a73e8] hover:underline font-normal flex items-center gap-1"
                            >
                              <span>{showMoreFdrs ? 'Show less' : 'Show more'}</span>
                              {showMoreFdrs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          {(showMoreFdrs ? matchedFdrs : matchedFdrs.slice(0, 3)).map((fdr) => (
                            <div
                              key={fdr.id}
                              onClick={() => {
                                onSelectFdr(fdr);
                                setIsOpen(false);
                              }}
                              className="px-5 py-2 hover:bg-[#f1f5f9] cursor-pointer flex items-start gap-3.5 group transition"
                            >
                              <Landmark className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-[#1a73e8] group-hover:underline flex items-center gap-2">
                                  <span>{fdr.fdrNumber}</span>
                                  <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                                    {fdr.instrumentStatus}
                                  </span>
                                </div>
                                <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                                  Deposit: {formatInrCompact(fdr.amount)} · Bank: {fdr.bankName} ({fdr.branchName}) · Institution: {fdr.institutionName} · Maturity: {formatDate(fdr.maturityDate)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 4: Institutions & Technical Colleges */}
                    {matchedInstitutions.length > 0 && (
                      <div className="py-2.5">
                        <div className="px-5 pb-1.5 text-[13px] font-normal text-slate-700 flex justify-between items-center">
                          <span>Institutions & Technical Colleges</span>
                          {matchedInstitutions.length > 3 && (
                            <button
                              type="button"
                              onClick={() => setShowMoreInsts(!showMoreInsts)}
                              className="text-[13px] text-[#1a73e8] hover:underline font-normal flex items-center gap-1"
                            >
                              <span>{showMoreInsts ? 'Show less' : 'Show more'}</span>
                              {showMoreInsts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          {(showMoreInsts ? matchedInstitutions : matchedInstitutions.slice(0, 3)).map((inst) => (
                            <div
                              key={inst.id}
                              onClick={() => {
                                onSelectInstitution(inst.id);
                                setIsOpen(false);
                              }}
                              className="px-5 py-2 hover:bg-[#f1f5f9] cursor-pointer flex items-start gap-3.5 group transition"
                            >
                              <Building2 className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-[#1a73e8] group-hover:underline">
                                  {inst.name}
                                </div>
                                <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                                  AICTE Permanent ID: {inst.aictePermanentId} · {inst.institutionType} · {inst.district}, {inst.state} · Principal: {inst.headName}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 5: Release & Refund Cases */}
                    {matchedReleaseCases.length > 0 && (
                      <div className="py-2.5">
                        <div className="px-5 pb-1.5 text-[13px] font-normal text-slate-700 flex justify-between items-center">
                          <span>Release & Refund Cases</span>
                          {matchedReleaseCases.length > 3 && (
                            <button
                              type="button"
                              onClick={() => setShowMoreCases(!showMoreCases)}
                              className="text-[13px] text-[#1a73e8] hover:underline font-normal flex items-center gap-1"
                            >
                              <span>{showMoreCases ? 'Show less' : 'Show more'}</span>
                              {showMoreCases ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          {(showMoreCases ? matchedReleaseCases : matchedReleaseCases.slice(0, 3)).map((rc) => (
                            <div
                              key={rc.id}
                              onClick={() => {
                                onSelectReleaseCase(rc);
                                setIsOpen(false);
                              }}
                              className="px-5 py-2 hover:bg-[#f1f5f9] cursor-pointer flex items-start gap-3.5 group transition"
                            >
                              <ArrowUpRightSquare className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-[#1a73e8] group-hover:underline flex items-center gap-2">
                                  <span>Case {rc.id}</span>
                                  <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-purple-50 text-purple-700">
                                    {rc.caseStatus}
                                  </span>
                                </div>
                                <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                                  Deposit: {formatInrCompact(rc.amount)} · FDR: {rc.fdrNumber} · {rc.institutionName} · Reason: {rc.requestReason}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 6: Documentation & Evidence Files */}
                    {matchedDocuments.length > 0 && (
                      <div className="py-2.5">
                        <div className="px-5 pb-1.5 text-[13px] font-normal text-slate-700 flex justify-between items-center">
                          <span>Documentation & evidence files</span>
                          {matchedDocuments.length > 3 && (
                            <button
                              type="button"
                              onClick={() => setShowMoreDocs(!showMoreDocs)}
                              className="text-[13px] text-[#1a73e8] hover:underline font-normal flex items-center gap-1"
                            >
                              <span>{showMoreDocs ? 'Show less' : 'Show more'}</span>
                              {showMoreDocs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          {(showMoreDocs ? matchedDocuments : matchedDocuments.slice(0, 3)).map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => {
                                onSelectTab('documents');
                                setIsOpen(false);
                              }}
                              className="px-5 py-2 hover:bg-[#f1f5f9] cursor-pointer flex items-start gap-3.5 group transition"
                            >
                              <FileText className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-[#1a73e8] group-hover:underline">
                                  {doc.title}
                                </div>
                                <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                                  Documentation · {doc.documentType} · {doc.fileName} ({doc.fileSize}) · Uploaded: {doc.uploadedDate}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 px-6 text-center text-slate-500">
                    <Search className="w-8 h-8 text-slate-400 mx-auto mb-2.5 opacity-60" />
                    <p className="text-[14px] font-medium text-slate-700">No results found for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Check your spelling or try searching for FDR numbers, bank names, or institution IDs.
                    </p>
                  </div>
                )
              ) : (
                /* Initial State / Suggested Jumps when query is empty */
                <div className="p-5 space-y-4">
                  <div>
                    <div className="text-[13px] font-normal text-slate-700 mb-2.5">
                      Suggested pages & quick jumps
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {portalPages.slice(0, 6).map((page) => {
                        const IconComponent = page.icon;
                        return (
                          <div
                            key={page.id}
                            onClick={() => {
                              onSelectTab(page.id);
                              setIsOpen(false);
                            }}
                            className="p-2.5 rounded border border-slate-200 hover:border-blue-400 hover:bg-[#f8fafc] cursor-pointer transition flex items-center gap-3 group"
                          >
                            <IconComponent className="w-4 h-4 text-slate-500 group-hover:text-blue-600 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-medium text-slate-800 group-hover:text-[#1a73e8] truncate">
                                {page.title}
                              </div>
                              <div className="text-[11px] text-[#5f6368] truncate">
                                Navigation · {page.id.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-[13px] font-normal text-slate-700 mb-2">
                      Recent FDR Instruments Requiring Attention
                    </div>
                    <div className="space-y-0.5">
                      {fdrs.slice(0, 4).map((fdr) => (
                        <div
                          key={fdr.id}
                          onClick={() => {
                            onSelectFdr(fdr);
                            setIsOpen(false);
                          }}
                          className="px-3 py-2 rounded hover:bg-[#f1f5f9] cursor-pointer flex items-center justify-between transition group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Landmark className="w-4 h-4 text-slate-600 shrink-0" />
                            <div className="truncate">
                              <span className="text-[13px] font-medium text-[#1a73e8] group-hover:underline">
                                {fdr.fdrNumber}
                              </span>
                              <span className="text-slate-400 mx-2">·</span>
                              <span className="text-xs text-slate-600 truncate">{fdr.institutionName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold text-slate-800">{formatInrCompact(fdr.amount)}</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {fdr.instrumentStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Shortcut Bar */}
            <div className="px-5 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center select-none">
              <span className="flex items-center gap-1.5">
                <span>Use</span>
                <kbd className="px-1 py-0.2 bg-white border border-slate-300 rounded font-mono text-[10px]">↑</kbd>
                <kbd className="px-1 py-0.2 bg-white border border-slate-300 rounded font-mono text-[10px]">↓</kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span>Press</span>
                <kbd className="px-1.5 py-0.2 bg-white border border-slate-300 rounded font-mono text-[10px]">ESC</kbd>
                <span>to exit</span>
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
