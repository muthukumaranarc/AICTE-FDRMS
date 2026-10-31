import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  HelpCircle,
  Minimize2,
  Key
} from 'lucide-react';
import {
  AuditTrailEntry,
  DashboardStats,
  DocumentRecord,
  FdrInstrument,
  Institution,
  InternalUser,
  Notification,
  ReleaseRefundCase
} from '../types';
import { formatInr, formatDate } from '../utils/formatters';

interface GeminiAssistantProps {
  currentUser: InternalUser;
  institutions: Institution[];
  fdrs: FdrInstrument[];
  documents: DocumentRecord[];
  releaseCases: ReleaseRefundCase[];
  stats: DashboardStats | null;
  notifications: Notification[];
  auditEntries: AuditTrailEntry[];
  onSelectFdr?: (fdr: FdrInstrument) => void;
  onSelectReleaseCase?: (c: ReleaseRefundCase) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  referencedFdrId?: string;
  referencedCaseId?: string;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({
  currentUser,
  institutions,
  fdrs,
  documents,
  releaseCases,
  stats,
  notifications,
  auditEntries,
  onSelectFdr,
  onSelectReleaseCase
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      localStorage.getItem('aicte_gemini_api_key') ||
      ''
    );
  });
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `**Namaste ${currentUser.name}!** I am your **AICTE-FDRMS Regulatory AI Assistant**, powered by Gemini with live RAG grounding across all technical institutions, fixed deposits, scrutiny observations, and refund cases.\n\nHow may I assist your desk scrutiny or regulatory monitoring today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const quickPrompts = [
    { label: 'Upcoming Expiries', query: 'Which FDRs and Bank Guarantees are expiring soon and what advance actions are required?' },
    { label: 'PNB Discrepancy', query: 'Explain the critical discrepancy on Maharashtra Institute PNB FDR-2026-002.' },
    { label: 'Release Criteria', query: 'What are the AICTE Approval Process Handbook (APH) criteria for approving the refund of an 8-year security deposit?' },
    { label: 'Bank Holdings', query: 'Provide a breakdown of total security deposit holdings across banks in the portal.' },
    { label: 'National Apex Case', query: 'What is the current status and recommendation for National Apex School of Architecture (REL-2026-001)?' }
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Construct comprehensive RAG context from live application state
  const buildRAGContext = (): string => {
    const instSummary = institutions
      .map(
        (i) =>
          `• Institution: ${i.name} (AICTE ID: ${i.aictePermanentId}), Type: ${i.institutionType}, State: ${i.state}, District: ${i.district}, Address: ${i.address}, Head: ${i.headName} (${i.headDesignation}, Email: ${i.headEmail}), Approval Status: ${i.approvalStatus}`
      )
      .join('\n');

    const fdrSummary = fdrs
      .map(
        (f) =>
          `• FDR No: ${f.fdrNumber} (ID: ${f.id}), College: ${f.institutionName} (AICTE ID: ${f.institutionAicteId}), Bank: ${f.bankName} (${f.branchName}, IFSC: ${f.branchIfsc}), Amount: INR ${f.amount}, Issue Date: ${f.issueDate}, Maturity Date: ${f.maturityDate}, Joint Lien Endorsed: ${f.jointLienMarked ? 'YES' : 'NO - CRITICAL DEFICIENCY'}, Instrument Status: ${f.instrumentStatus}, Verification Status: ${f.verificationStatus}, Reviewer: ${f.assignedReviewerName || 'Unassigned'}, Remarks: ${f.remarks || 'None'}`
      )
      .join('\n');

    const releaseSummary = releaseCases
      .map(
        (c) =>
          `• Release Case ID: ${c.id}, College: ${c.institutionName}, FDR Ref: ${c.fdrNumber}, Amount: INR ${c.amount}, Reason: ${c.requestReason}, Status: ${c.caseStatus}, Recommendation: ${c.scrutinyRecommendation || 'Pending'}, Reviewer Notes: ${c.reviewerNotes || 'None'}`
      )
      .join('\n');

    return `
=== SYSTEM IDENTITY & GOVERNANCE RULES ===
You are the official Regulatory Intelligence AI Assistant for the AICTE Security Deposit & Fixed Deposit Receipt Management System (AICTE-FDRMS).
Your purpose is to assist AICTE officers in the Regulation Bureau at AICTE HQ, New Delhi.
Current Active Officer: ${currentUser.name} (${currentUser.designation}, Role: ${currentUser.role}, Email: ${currentUser.email}).

=== REGULATORY KNOWLEDGE BASE (AICTE APH CLAUSE 4.12 & AICTE ACT) ===
1. Technical institutions approved by AICTE must deposit a mandatory security deposit (in the form of an FDR or Bank Guarantee) under irrevocable joint lien in favor of the Regional Officer, AICTE.
2. The deposit has a statutory lock-in / moratorium period of 8 years for new institutions / technical programs.
3. JOINT LIEN REQUIREMENT: The issuing bank MUST mark an irrevocable lien in its Core Banking System (CBS) and issue an official confirmation letter on bank letterhead signed by the Branch Manager. If the lien is not marked, the FDR is non-compliant and a critical discrepancy notice is issued.
4. REFUND / RELEASE CONDITIONS:
   - Completion of 8-year lock-in period with clean compliance, no pending student fee complaints, and no outstanding litigation.
   - Closure of the institution or program with No Objection Certificates (NOC) from the State Government and Affiliating Technical University.
5. WORKFLOW ROLES:
   - Scrutiny Officer (ROLE_REVIEWER, e.g. Smt. Ananya Sen): Inspects documents, cross-verifies bank confirmations, logs observations, recommends release.
   - Competent Authority (ROLE_APPROVER, e.g. Dr. Rajesh Sharma, Advisor Regulation): Sanctions releases and signs Sanction Orders.
   - Bureau Admin (ROLE_ADMIN, e.g. Shri Vikram Patel): System maintenance and master configuration.

=== LIVE REAL-TIME APPLICATION DATA SNAPSHOT ===
[TOTAL ACTIVE FDR HOLDINGS]: ${stats?.activeCount || 0} active instruments amounting to INR ${stats?.activeAmount || 0}.
[URGENT / DISCREPANCY CASES]: ${stats?.urgentCasesCount || 0} urgent cases.

[INSTITUTIONS IN DATABASE (${institutions.length})]:
${instSummary}

[FDR & BANK GUARANTEE INSTRUMENTS (${fdrs.length})]:
${fdrSummary}

[ACTIVE RELEASE & REFUND CASES (${releaseCases.length})]:
${releaseSummary}

=== INSTRUCTIONS FOR RESPONDING ===
1. Answer authoritatively, professionally, and directly, citing exact college names, AICTE permanent IDs, FDR numbers, issuing banks, amounts, dates, and regulatory clauses.
2. Format your response cleanly using GitHub Markdown (bolding, bullet points, summary tables where appropriate).
3. Ground your answers strictly in the factual live data above. Never invent institutions, FDR numbers, or policies not present in the context.
4. If asked for actions, provide clear, step-by-step regulatory recommendations for the desk officer.
`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const activeKey =
      apiKey ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      localStorage.getItem('aicte_gemini_api_key') ||
      '';

    if (!activeKey) {
      setShowKeyModal(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: '⚠️ **Gemini API Key Required:** Please configure `VITE_GEMINI_API_KEY` in `Frontend/AICTE-FDRMS/.env` or click the Key icon in the header above to enter your Google Gemini API key.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const systemInstruction = buildRAGContext();

      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: `${systemInstruction}\n\n[USER QUERY]:\n${text}`
            }
          ]
        }
      ];

      // Try primary fast model gemini-3.5-flash-lite, fallback to gemini-flash-latest
      let apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${activeKey}`;

      let response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        // Fallback endpoint
        apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${activeKey}`;
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });
      }

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const assistantText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'I have analyzed the regulatory records, but received an empty response. Please try rephrasing your question.';

      // Check if response references any known FDR ID or Release Case
      const matchedFdr = fdrs.find(
        (f) =>
          assistantText.includes(f.fdrNumber) ||
          assistantText.includes(f.id) ||
          assistantText.toLowerCase().includes(f.institutionName.toLowerCase().slice(0, 15))
      );
      const matchedCase = releaseCases.find(
        (c) => assistantText.includes(c.id) || assistantText.includes(c.fdrNumber)
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referencedFdrId: matchedFdr?.id,
        referencedCaseId: matchedCase?.id
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      console.error('Gemini Assistant Error:', error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Regulatory System Notice:** Unable to reach Gemini API (${error.message || 'Network error'}).\n\nPlease ensure your device has internet access to query the Gemini cloud model.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Inline markdown formatter for bold, code, links, and italics
  const renderInlineMarkdown = (text: string) => {
    const tokenRegex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\)|\*.*?\*)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={index} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 bg-slate-100 text-blue-800 font-mono text-[10.5px] rounded border border-slate-200/80 font-medium"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a
              key={index}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline font-medium hover:text-blue-800"
            >
              {match[1]}
            </a>
          );
        }
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
        return (
          <em key={index} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Comprehensive Markdown Preview Renderer
  const renderMarkdownPreview = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Code blocks (```)
      if (trimmed.startsWith('```')) {
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <div
            key={`code-${i}`}
            className="my-2.5 rounded-lg bg-slate-900 text-slate-100 p-3 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed"
          >
            <pre>{codeLines.join('\n')}</pre>
          </div>
        );
        i++;
        continue;
      }

      // 2. Markdown Tables (| Col 1 | Col 2 |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|') && lines[i + 1].includes('---')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCells = tableLines[0]
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim());
          const bodyLines = tableLines.slice(2);

          elements.push(
            <div key={`table-${i}`} className="overflow-x-auto my-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx} className="py-2 px-3 whitespace-nowrap">
                        {renderInlineMarkdown(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {bodyLines.map((rowLine, rIdx) => {
                    const cells = rowLine
                      .slice(1, -1)
                      .split('|')
                      .map((c) => c.trim());
                    return (
                      <tr key={rIdx} className="hover:bg-slate-50 transition">
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2 px-3">
                            {renderInlineMarkdown(cell)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // 3. Horizontal Separators (--- or ***)
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        elements.push(<hr key={`hr-${i}`} className="my-2.5 border-t border-slate-200" />);
        i++;
        continue;
      }

      // 4. Standalone Bold Section Headings (e.g. **Heading Text** or **Heading Text:**)
      const boldHeaderMatch = trimmed.match(/^\*\*(.*?)\*\*:?$/);
      if (boldHeaderMatch) {
        elements.push(
          <div key={`bh-${i}`} className="font-bold text-xs text-[#0f2e5a] mt-3 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 inline-block"></span>
            <span>{boldHeaderMatch[1]}</span>
          </div>
        );
        i++;
        continue;
      }

      // 5. Standard Markdown Headings (#, ##, ###, ####)
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={`h1-${i}`} className="text-sm font-extrabold text-[#0f2e5a] mt-3 mb-1.5 pb-1 border-b border-slate-200">
            {renderInlineMarkdown(trimmed.slice(2))}
          </h2>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`h2-${i}`} className="text-xs font-bold text-[#0f2e5a] mt-2.5 mb-1 pb-0.5 border-b border-slate-100">
            {renderInlineMarkdown(trimmed.slice(3))}
          </h3>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`h3-${i}`} className="text-xs font-bold text-slate-900 mt-2 mb-1">
            {renderInlineMarkdown(trimmed.slice(4))}
          </h4>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h5 key={`h4-${i}`} className="text-[11px] font-bold text-slate-800 mt-1.5 mb-0.5">
            {renderInlineMarkdown(trimmed.slice(5))}
          </h5>
        );
        i++;
        continue;
      }

      // 6. Numbered List items (e.g. 1. Item or 1. **Title:** ...)
      const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        const num = numberedMatch[2];
        const content = numberedMatch[3];
        elements.push(
          <div key={`num-${i}`} className="flex items-start gap-2 my-1 text-xs pl-0.5">
            <span className="font-bold text-blue-700 font-mono bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 text-[10px] shrink-0 mt-0.5">
              {num}
            </span>
            <div className="flex-1 text-slate-800 leading-relaxed">
              {renderInlineMarkdown(content)}
            </div>
          </div>
        );
        i++;
        continue;
      }

      // 7. Bullet List items (*, •, -, +)
      const bulletMatch = line.match(/^(\s*)([-*•+])\s+(.*)$/);
      if (bulletMatch) {
        const indent = bulletMatch[1].length;
        const content = bulletMatch[3];
        elements.push(
          <div
            key={`bullet-${i}`}
            className={`flex items-start gap-2 my-0.5 text-xs ${indent >= 2 ? 'pl-4' : 'pl-1'}`}
          >
            <span className={`rounded-full shrink-0 ${indent >= 2 ? 'w-1 h-1 bg-slate-400 mt-2' : 'w-1.5 h-1.5 bg-blue-500 mt-1.5'}`} />
            <div className="flex-1 text-slate-800 leading-relaxed">
              {renderInlineMarkdown(content)}
            </div>
          </div>
        );
        i++;
        continue;
      }

      // 8. Blockquote (> ...)
      if (trimmed.startsWith('> ')) {
        elements.push(
          <div key={`quote-${i}`} className="border-l-3 border-blue-500 bg-blue-50/50 pl-2.5 py-1.5 my-1.5 text-xs text-slate-700 rounded-r-md italic">
            {renderInlineMarkdown(trimmed.slice(2))}
          </div>
        );
        i++;
        continue;
      }

      // 9. Blank Lines
      if (!trimmed) {
        elements.push(<div key={`blank-${i}`} className="h-1" />);
        i++;
        continue;
      }

      // 10. Standard Paragraphs
      elements.push(
        <p key={`p-${i}`} className="text-xs text-slate-800 leading-relaxed my-0.5">
          {renderInlineMarkdown(line)}
        </p>
      );
      i++;
    }

    return elements;
  };

  return (
    <>
      {/* 1. Floating Action Button (Circle with Robot Head Logo) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            isOpen
              ? 'bg-[#0f2e5a] text-white ring-4 ring-blue-300/40'
              : 'bg-gradient-to-tr from-[#0f2e5a] via-[#1e3a8a] to-[#2563eb] text-white ring-4 ring-blue-400/20 hover:ring-blue-400/50'
          }`}
          title="AICTE Regulatory AI Assistant (Gemini 3.5)"
          aria-label="Open AICTE AI Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            /* Robot Head Logo */
            <Bot className="w-7 h-7 text-white drop-shadow-md" />
          )}

          {/* Hover Tooltip (When Closed) */}
          {!isOpen && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900/90 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700/50 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AICTE Regulatory AI</span>
            </div>
          )}
        </button>
      </div>

      {/* 2. Slide-In AI Chat Drawer on the Right Side */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-[440px] max-w-[95vw] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0f2e5a] via-[#153e75] to-[#1e3a8a] text-white flex items-center justify-between border-b border-blue-900/40 shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src={`${import.meta.env.BASE_URL}fdrms-icon.svg`}
                alt="AICTE FDRMS"
                className="w-9 h-9 rounded-xl shadow-xs shrink-0 object-contain p-0.5 bg-white/10 border border-white/20"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide text-white">AICTE Regulatory AI</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Gemini 3.5
                  </span>
                </div>
                <p className="text-[10px] text-blue-200 font-medium">
                  RAG-Grounded on Bureau Database &amp; APH Rules
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setKeyInput(apiKey);
                  setShowKeyModal((prev) => !prev);
                }}
                className={`p-1.5 rounded-lg transition ${
                  apiKey
                    ? 'text-blue-200 hover:text-white hover:bg-white/10'
                    : 'text-amber-300 bg-amber-500/20 animate-pulse'
                }`}
                title={apiKey ? 'Gemini API Key Configured' : 'Configure Gemini API Key'}
              >
                <Key className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: `welcome-${Date.now()}`,
                      sender: 'assistant',
                      text: `Conversation cleared. I am grounded with **${institutions.length} Institutions**, **${fdrs.length} FDRs**, and **${releaseCases.length} Release Cases**. How can I assist you?`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ])
                }
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Clear Chat History"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close Drawer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* API Key Modal / Dropdown */}
          {showKeyModal && (
            <div className="p-3 bg-amber-50 border-b border-amber-200 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-amber-700" />
                  Gemini API Key Configuration
                </span>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="text-amber-700 hover:text-amber-900 text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug mb-2">
                Paste your Google Gemini API key or set{' '}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">
                  VITE_GEMINI_API_KEY
                </code>{' '}
                in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">.env</code>:
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter API key..."
                  className="flex-1 px-2.5 py-1 text-xs border border-amber-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
                <button
                  onClick={() => {
                    const trimmed = keyInput.trim();
                    setApiKey(trimmed);
                    if (trimmed) {
                      localStorage.setItem('aicte_gemini_api_key', trimmed);
                    } else {
                      localStorage.removeItem('aicte_gemini_api_key');
                    }
                    setShowKeyModal(false);
                  }}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold transition"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Quick Guidance Chips (Horizontal Scrollbar Hidden) */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 shrink-0 overflow-hidden">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Recommended Regulatory Inquiries</span>
            </div>
            <div
              className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.query)}
                  disabled={isLoading}
                  className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg border border-slate-200 font-medium transition shadow-2xs shrink-0 flex items-center gap-1"
                >
                  <span>{qp.label}</span>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Scroll Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs shadow-xs transition ${
                    msg.sender === 'user'
                      ? 'bg-[#0f2e5a] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  {/* Sender Header for Assistant */}
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1 text-[#0f2e5a] font-bold">
                        <Bot className="w-3 h-3 text-blue-600" />
                        <span>AICTE Regulatory AI</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="hover:text-slate-600 p-0.5 rounded transition"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Content with Markdown Preview Renderer */}
                  <div className="space-y-1">
                    {msg.sender === 'user' ? (
                      <p className="text-white font-medium">{msg.text}</p>
                    ) : (
                      renderMarkdownPreview(msg.text)
                    )}
                  </div>

                  {/* Deep-link Action Badge if an FDR or Case is Referenced */}
                  {msg.sender === 'assistant' && msg.referencedFdrId && onSelectFdr && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Referenced: {msg.referencedFdrId}
                      </span>
                      <button
                        onClick={() => {
                          const fdr = fdrs.find((f) => f.id === msg.referencedFdrId);
                          if (fdr) onSelectFdr(fdr);
                        }}
                        className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 transition"
                      >
                        <span>Inspect FDR</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}

                  {msg.sender === 'assistant' && msg.referencedCaseId && onSelectReleaseCase && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-purple-600 font-mono">
                        Case: {msg.referencedCaseId}
                      </span>
                      <button
                        onClick={() => {
                          const c = releaseCases.find((rc) => rc.id === msg.referencedCaseId);
                          if (c) onSelectReleaseCase(c);
                        }}
                        className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1 transition"
                      >
                        <span>Open Case</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <span className="text-[9px] text-slate-400 mt-0.5 mr-1 font-mono">{msg.timestamp}</span>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2 text-xs">
                <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-3 shadow-xs space-y-1 max-w-[80%]">
                  <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                    <span>Gemini is retrieving records &amp; synthesizing regulatory facts...</span>
                  </div>
                  <div className="flex gap-1 py-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Footer */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask anything about institutions, FDRs, renewals, or release rules..."
                rows={2}
                disabled={isLoading}
                className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none text-slate-900 placeholder:text-slate-400 leading-relaxed"
              />

              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="p-3 bg-[#0f2e5a] hover:bg-blue-800 disabled:opacity-40 disabled:hover:bg-[#0f2e5a] text-white rounded-xl shadow-sm transition shrink-0 flex items-center justify-center"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Live Grounding: {institutions.length} Inst • {fdrs.length} FDRs • {releaseCases.length} Cases
              </span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
