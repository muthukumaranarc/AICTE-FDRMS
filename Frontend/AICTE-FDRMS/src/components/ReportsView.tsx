import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Landmark,
  Building2,
  PieChart,
  FileSpreadsheet,
  TrendingUp,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { FdrInstrument, Institution } from '../types';
import { api } from '../services/api';
import { formatInr, formatInrCompact, formatDate } from '../utils/formatters';

interface ReportsViewProps {
  fdrs: FdrInstrument[];
  institutions: Institution[];
  onSelectFdr: (fdr: FdrInstrument) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  fdrs,
  institutions,
  onSelectFdr
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'holdings' | 'bank' | 'maturities'>('holdings');
  const [holdingsData, setHoldingsData] = useState<any>(null);
  const [bankData, setBankData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [h, b] = await Promise.all([
        api.getInstitutionHoldingsReport(),
        api.getBankConcentrationReport()
      ]);
      setHoldingsData(h);
      setBankData(b);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = (type: string) => {
    window.open(`/api/reports/export/csv?type=${type}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  // Maturity buckets
  const now = new Date();
  const maturities30d = fdrs.filter((f) => {
    if (!f.maturityDate) return false;
    const diff = (new Date(f.maturityDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 30;
  });

  const maturities60d = fdrs.filter((f) => {
    if (!f.maturityDate) return false;
    const diff = (new Date(f.maturityDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diff > 30 && diff <= 60;
  });

  const maturities90d = fdrs.filter((f) => {
    if (!f.maturityDate) return false;
    const diff = (new Date(f.maturityDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diff > 60 && diff <= 90;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0f2e5a] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            AICTE Regulation Bureau • Official Deposit Portfolio Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical holdings, issuing bank exposure, upcoming maturity forecasts, and certified CSV export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadCsv(activeReportTab)}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition border border-slate-300 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveReportTab('holdings')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeReportTab === 'holdings'
              ? 'border-[#0f2e5a] text-[#0f2e5a]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Institution-Wise Deposit Holdings
        </button>

        <button
          onClick={() => setActiveReportTab('bank')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeReportTab === 'bank'
              ? 'border-[#0f2e5a] text-[#0f2e5a]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Issuing Bank Concentration & Exposure
        </button>

        <button
          onClick={() => setActiveReportTab('maturities')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeReportTab === 'maturities'
              ? 'border-[#0f2e5a] text-[#0f2e5a]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Maturity Schedule & Forecast (30/60/90 Days)
        </button>
      </div>

      {/* Report 1: Institution Holdings */}
      {activeReportTab === 'holdings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">
              Institution Holdings Summary ({holdingsData?.totalInstitutions || 0} Registered Institutions)
            </span>
            <span className="font-extrabold text-[#0f2e5a]">
              Grand Total: {formatInr(holdingsData?.grandTotalAmount || 0)} ({formatInrCompact(holdingsData?.grandTotalAmount || 0)})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">AICTE ID</th>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">Category & State</th>
                  <th className="py-3 px-4 text-center">Instruments</th>
                  <th className="py-3 px-4 text-right">Total Recorded Deposit</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!holdingsData?.rows ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Loading holdings data...</td>
                  </tr>
                ) : (
                  holdingsData.rows.map((row: any) => (
                    <tr key={row.institutionId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">{row.aictePermanentId}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{row.name}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {row.institutionType} • {row.state}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
                          {row.instrumentCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        {formatInr(row.totalDepositAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.instruments && row.instruments.length > 0 && (
                          <button
                            onClick={() => onSelectFdr(row.instruments[0])}
                            className="text-xs text-blue-600 hover:underline font-semibold"
                          >
                            Inspect Instruments
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Bank Concentration */}
      {activeReportTab === 'bank' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">Bank Concentration Analysis</span>
            <span className="font-extrabold text-[#0f2e5a]">
              Total Portfolio: {formatInrCompact(bankData?.totalDeposits || 0)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Issuing Scheduled Bank</th>
                  <th className="py-3 px-4 text-center">Total FDR Instruments</th>
                  <th className="py-3 px-4 text-right">Aggregated Deposit Value</th>
                  <th className="py-3 px-4 text-right">Portfolio Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!bankData?.banks ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">Loading bank data...</td>
                  </tr>
                ) : (
                  bankData.banks.map((b: any) => {
                    const share = bankData.totalDeposits > 0 ? ((b.totalAmount / bankData.totalDeposits) * 100).toFixed(1) : '0';
                    return (
                      <tr key={b.bankName} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-800">{b.bankName}</td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-700">{b.count}</td>
                        <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                          {formatInr(b.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${share}%` }}></div>
                            </div>
                            <span className="font-bold text-slate-700 font-mono w-10 text-right">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Maturity Schedule */}
      {activeReportTab === 'maturities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-xs font-bold text-red-800 uppercase">Due in 1 - 30 Days</span>
              <div className="text-2xl font-extrabold text-red-900 mt-1">
                {maturities30d.length} Instruments
              </div>
              <div className="text-[11px] text-red-700 mt-0.5">
                Value: {formatInrCompact(maturities30d.reduce((a, b) => a + (b.amount || 0), 0))}
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-xs font-bold text-amber-800 uppercase">Due in 31 - 60 Days</span>
              <div className="text-2xl font-extrabold text-amber-900 mt-1">
                {maturities60d.length} Instruments
              </div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                Value: {formatInrCompact(maturities60d.reduce((a, b) => a + (b.amount || 0), 0))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-xs font-bold text-blue-800 uppercase">Due in 61 - 90 Days</span>
              <div className="text-2xl font-extrabold text-blue-900 mt-1">
                {maturities90d.length} Instruments
              </div>
              <div className="text-[11px] text-blue-700 mt-0.5">
                Value: {formatInrCompact(maturities90d.reduce((a, b) => a + (b.amount || 0), 0))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Upcoming Instruments Reaching Maturity (Next 90 Days)
            </h4>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">FDR Number</th>
                  <th className="py-2.5 px-3">Institution</th>
                  <th className="py-2.5 px-3">Bank & Amount</th>
                  <th className="py-2.5 px-3">Maturity Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...maturities30d, ...maturities60d, ...maturities90d].length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No instruments reaching maturity within the next 90 days.
                    </td>
                  </tr>
                ) : (
                  [...maturities30d, ...maturities60d, ...maturities90d].map((fdr) => (
                    <tr key={fdr.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{fdr.fdrNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{fdr.institutionName}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{formatInr(fdr.amount)} ({fdr.bankName})</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{formatDate(fdr.maturityDate)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onSelectFdr(fdr)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded text-xs hover:bg-blue-100"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
