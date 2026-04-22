import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  IndianRupee,
  ChevronRight,
  CheckCircle,
  Upload,
  Loader2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthorRoyaltySummary {
  authorId: string;
  firstName: string;
  lastName: string;
  location: string;
  totalBooks: number;
  totalBookUnits: number;
  lastRoyalty: number;
  lastPaymentDate?: string;
  netRoyalty: number;
  totalPaid: number;
  totalPending: number;
  pendingCount: number;
  paidCount: number;
}

interface RoyaltyRecord {
  royaltyRecordId: string;
  bookId: string;
  bookName?: string;
  month: number;
  year: number;
  authorRoyalty: number;
  referralDeduction: number;
  outstandingDeduction: number;
  finalRoyalty: number;
  status: 'pending' | 'paid';
  paymentDate?: string;
  paymentMode?: string;
  transactionReference?: string;
  bankAccountId?: string;
}

interface BankAccount {
  _id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  branchName: string;
  accountType: string;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(Math.round(n));
const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Release Modal ────────────────────────────────────────────────────────────

interface ReleaseModalProps {
  record: RoyaltyRecord;
  authorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ReleaseModal: React.FC<ReleaseModalProps> = ({ record, authorId, onClose, onSuccess }) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankAccountId, setBankAccountId] = useState('');
  const [paymentMode, setPaymentMode] = useState('NEFT');
  const [transactionReference, setTransactionReference] = useState('');
  const [referralDeduction, setReferralDeduction] = useState(String(record.referralDeduction || '0'));
  const [outstandingDeduction, setOutstandingDeduction] = useState(String(record.outstandingDeduction || '0'));
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const finalRoyalty = Math.max(
    0,
    record.authorRoyalty - (parseFloat(referralDeduction) || 0) - (parseFloat(outstandingDeduction) || 0)
  );

  useEffect(() => {
    axiosInstance
      .get(API_ENDPOINTS.ADMIN.GET_AUTHOR_BANK_ACCOUNTS(authorId))
      .then((res) => {
        if (res.data?.success) setBankAccounts(res.data.data?.bankAccounts || []);
      })
      .catch(() => {});
  }, [authorId]);

  const handleSubmit = async () => {
    if (!bankAccountId) { toast.error('Select a bank account'); return; }
    if (!paymentMode) { toast.error('Select a payment mode'); return; }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('royaltyRecordId', record.royaltyRecordId);
      formData.append('bankAccountId', bankAccountId);
      formData.append('paymentMode', paymentMode);
      if (transactionReference) formData.append('transactionReference', transactionReference);
      formData.append('referralDeduction', referralDeduction);
      formData.append('outstandingDeduction', outstandingDeduction);
      if (proofFile) formData.append('paymentProof', proofFile);

      const res = await axiosInstance.post(API_ENDPOINTS.ROYALTY.ADMIN_RELEASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        toast.success('Royalty payment released successfully');
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to release payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-100 rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-dark-300">
          <h2 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900">Release Royalty Payment</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-200 transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Summary */}
          <div className="bg-neutral-50 dark:bg-dark-200/50 rounded-lg p-4 text-body-sm">
            <div className="flex justify-between mb-1">
              <span className="text-neutral-500 dark:text-dark-500">Period</span>
              <span className="font-medium text-neutral-900 dark:text-dark-900">{MONTH_NAMES[record.month - 1]} {record.year}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-500 dark:text-dark-500">Author Royalty</span>
              <span className="font-medium text-neutral-900 dark:text-dark-900">₹{fmt(record.authorRoyalty)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 dark:border-dark-300 mt-2 pt-2">
              <span className="font-semibold text-neutral-900 dark:text-dark-900">Final Royalty</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{fmt(finalRoyalty)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">Referral Deduction (₹)</label>
              <input type="number" min="0" value={referralDeduction} onChange={(e) => setReferralDeduction(e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">Outstanding Deduction (₹)</label>
              <input type="number" min="0" value={outstandingDeduction} onChange={(e) => setOutstandingDeduction(e.target.value)} className="input w-full" />
            </div>
          </div>

          {/* Bank Account */}
          <div>
            <label className="block text-body-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">Bank Account *</label>
            <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} className="input w-full">
              <option value="">Select bank account…</option>
              {bankAccounts.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.bankName} — ****{String(b.accountNumber).slice(-4)} ({b.accountType})
                </option>
              ))}
            </select>
            {bankAccounts.length === 0 && (
              <p className="text-body-xs text-amber-600 dark:text-amber-400 mt-1">No bank accounts found for this author</p>
            )}
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-body-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">Payment Mode *</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="input w-full">
              {['NEFT', 'RTGS', 'IMPS', 'UPI', 'Phone Pay', 'Google Pay', 'Other'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Transaction Reference */}
          <div>
            <label className="block text-body-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">Transaction Reference / UTR</label>
            <input
              type="text"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              placeholder="Optional"
              className="input w-full"
            />
          </div>

          {/* Payment Proof */}
          <div>
            <label className="block text-body-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">Payment Proof (image / PDF)</label>
            <div className="border-2 border-dashed border-neutral-300 dark:border-dark-400 rounded-lg p-4 text-center">
              {proofFile ? (
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-neutral-700 dark:text-dark-700 truncate">{proofFile.name}</span>
                  <button onClick={() => setProofFile(null)} className="text-neutral-400 hover:text-red-500 ml-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                  <p className="text-body-sm text-neutral-500 dark:text-dark-500">Click to upload</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-dark-300 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-neutral-300 dark:border-dark-400 text-neutral-700 dark:text-dark-700 rounded-lg text-body-sm font-medium hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !bankAccountId}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-body-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {submitting ? 'Releasing…' : 'Release Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

type View = 'listing' | 'author-detail';

const AdminRoyalties: React.FC = () => {
  const [view, setView] = useState<View>('listing');
  const [authors, setAuthors] = useState<AuthorRoyaltySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Author detail
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorRoyaltySummary | null>(null);
  const [authorRecords, setAuthorRecords] = useState<RoyaltyRecord[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Release modal
  const [releaseRecord, setReleaseRecord] = useState<RoyaltyRecord | null>(null);

  // ── Fetch author listing ────────────────────────────────────────────────────
  const fetchAuthors = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await axiosInstance.get(API_ENDPOINTS.ROYALTY.ADMIN_LISTING, { params });
      if (res.data?.success) setAuthors(res.data.data.authors || []);
    } catch (err: any) {
      toast.error('Failed to load royalty data');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchAuthors(); }, [fetchAuthors]);

  // ── Open author detail ──────────────────────────────────────────────────────
  const openAuthorDetail = async (author: AuthorRoyaltySummary) => {
    try {
      setDetailLoading(true);
      setSelectedAuthor(author);
      setView('author-detail');
      const res = await axiosInstance.get(API_ENDPOINTS.ROYALTY.ADMIN_AUTHOR_DETAIL(author.authorId));
      if (res.data?.success) setAuthorRecords(res.data.data.records || []);
    } catch (err: any) {
      toast.error('Failed to load author royalty details');
    } finally {
      setDetailLoading(false);
    }
  };

  const goBack = () => { setView('listing'); setSelectedAuthor(null); setAuthorRecords([]); };

  const handleReleaseSuccess = () => {
    setReleaseRecord(null);
    if (selectedAuthor) openAuthorDetail(selectedAuthor);
  };

  // ─── Author Detail ────────────────────────────────────────────────────────
  if (view === 'author-detail' && selectedAuthor) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-200 text-neutral-600 dark:text-dark-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">
              {selectedAuthor.firstName} {selectedAuthor.lastName}
            </h1>
            <p className="text-body-sm text-neutral-500 dark:text-dark-500">{selectedAuthor.authorId}</p>
          </div>
        </div>

        {/* Author stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-body-xs text-neutral-500 dark:text-dark-500 uppercase tracking-wide mb-1">Total Royalty</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-dark-900">₹{fmt(selectedAuthor.netRoyalty)}</p>
          </div>
          <div className="card p-4 border-l-4 border-emerald-500">
            <p className="text-body-xs text-neutral-500 dark:text-dark-500 uppercase tracking-wide mb-1">Total Paid</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{fmt(selectedAuthor.totalPaid)}</p>
            {selectedAuthor.lastPaymentDate && (
              <p className="text-body-xs text-neutral-400 mt-0.5">Last: {fmtDate(selectedAuthor.lastPaymentDate)}</p>
            )}
          </div>
          <div className="card p-4 border-l-4 border-amber-400">
            <p className="text-body-xs text-neutral-500 dark:text-dark-500 uppercase tracking-wide mb-1">Remaining</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">₹{fmt(selectedAuthor.totalPending)}</p>
            {selectedAuthor.pendingCount > 0 && (
              <p className="text-body-xs text-neutral-400 mt-0.5">{selectedAuthor.pendingCount} month{selectedAuthor.pendingCount > 1 ? 's' : ''} unpaid</p>
            )}
          </div>
          <div className="card p-4">
            <p className="text-body-xs text-neutral-500 dark:text-dark-500 uppercase tracking-wide mb-1">Books / Units</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-dark-900">{selectedAuthor.totalBooks} / {selectedAuthor.totalBookUnits.toLocaleString()}</p>
          </div>
        </div>

        {/* Records table */}
        {detailLoading ? (
          <div className="flex justify-center py-12"><Loader size="lg" /></div>
        ) : (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-dark-300">
              <h2 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900">Royalty Records</h2>
            </div>
            {authorRecords.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertCircle className="w-8 h-8 text-neutral-400" />
                <p className="text-neutral-500 dark:text-dark-500">No royalty records yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-dark-200/50">
                      {['Period','Book','Gross Royalty','Deductions','Payable','Paid On','Status','Action'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-body-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-dark-300">
                    {authorRecords.map((r) => {
                      const deductions = (r.referralDeduction || 0) + (r.outstandingDeduction || 0);
                      return (
                        <tr key={r.royaltyRecordId} className="hover:bg-neutral-50/50 dark:hover:bg-dark-200/30 transition-colors">
                          <td className="px-4 py-4 font-medium text-neutral-900 dark:text-dark-900 whitespace-nowrap">
                            {MONTH_NAMES[r.month - 1]} {r.year}
                          </td>
                          <td className="px-4 py-4 text-body-sm">
                            <span className="font-mono text-neutral-500 text-body-xs">{r.bookId}</span>
                            {r.bookName && <p className="text-body-xs text-neutral-600 dark:text-dark-600 truncate max-w-[110px]">{r.bookName}</p>}
                          </td>
                          <td className="px-4 py-4 text-neutral-700 dark:text-dark-700 whitespace-nowrap">
                            ₹{fmt(r.authorRoyalty)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {deductions > 0 ? (
                              <span className="text-red-500 text-body-sm">−₹{fmt(deductions)}</span>
                            ) : (
                              <span className="text-neutral-400 text-body-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 font-semibold whitespace-nowrap">
                            {r.status === 'paid' ? (
                              <span className="text-emerald-600 dark:text-emerald-400">₹{fmt(r.finalRoyalty)}</span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400">₹{fmt(r.finalRoyalty)}</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-body-xs text-neutral-500 dark:text-dark-500 whitespace-nowrap">
                            {r.status === 'paid' ? fmtDate(r.paymentDate) : <span className="text-amber-500">Not yet</span>}
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={r.status === 'paid' ? 'success' : 'warning'} size="sm">
                              {r.status === 'paid' ? 'Paid' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            {r.status === 'pending' ? (
                              <button
                                onClick={() => setReleaseRecord(r)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-body-xs font-medium transition-colors"
                              >
                                <IndianRupee className="w-3.5 h-3.5" />
                                Release
                              </button>
                            ) : (
                              <span className="text-body-xs text-neutral-400 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Done
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Release Modal */}
        {releaseRecord && (
          <ReleaseModal
            record={releaseRecord}
            authorId={selectedAuthor.authorId}
            onClose={() => setReleaseRecord(null)}
            onSuccess={handleReleaseSuccess}
          />
        )}
      </div>
    );
  }

  // ─── Author Listing ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">Royalty Management</h1>
        <button onClick={fetchAuthors} className="inline-flex items-center gap-2 px-4 py-2 text-body-sm font-medium text-neutral-600 dark:text-dark-600 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-dark-200 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by Author Name / ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAuthors()}
            className="input pl-9 w-full"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-full sm:w-40">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
        <button onClick={fetchAuthors} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-body-sm font-medium transition-colors">
          Search
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          {authors.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center px-6">
              <AlertCircle className="w-10 h-10 text-neutral-400" />
              <p className="text-neutral-500 dark:text-dark-500">No royalty data found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-dark-200/50">
                    {['Author ID','Author Name','Location','Total Books','Book Units','Total Paid','Remaining','Last Paid On','Action'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-body-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-dark-300">
                  {authors.map((a) => (
                    <tr key={a.authorId} className="hover:bg-neutral-50/50 dark:hover:bg-dark-200/30 transition-colors">
                      <td className="px-5 py-4 font-mono text-body-sm text-primary-600 dark:text-primary-400 cursor-pointer hover:underline" onClick={() => openAuthorDetail(a)}>
                        {a.authorId}
                      </td>
                      <td className="px-5 py-4 font-medium text-neutral-900 dark:text-dark-900">
                        {a.firstName} {a.lastName}
                      </td>
                      <td className="px-5 py-4 text-body-sm text-neutral-600 dark:text-dark-600">{a.location || '—'}</td>
                      <td className="px-5 py-4 text-neutral-700 dark:text-dark-700">{a.totalBooks}</td>
                      <td className="px-5 py-4 text-neutral-700 dark:text-dark-700">{a.totalBookUnits.toLocaleString()}</td>
                      <td className="px-5 py-4 font-semibold text-emerald-600 dark:text-emerald-400">₹{fmt(a.totalPaid)}</td>
                      <td className="px-5 py-4">
                        {a.totalPending > 0 ? (
                          <span className="font-semibold text-amber-600 dark:text-amber-400">₹{fmt(a.totalPending)}</span>
                        ) : (
                          <span className="text-neutral-400 text-body-sm">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-body-xs text-neutral-500 dark:text-dark-500 whitespace-nowrap">
                        {a.lastPaymentDate ? fmtDate(a.lastPaymentDate) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openAuthorDetail(a)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-body-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                        >
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRoyalties;
