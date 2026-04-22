import React, { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee,
  Package,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Download,
  CalendarDays,
  BookOpen,
  CheckCircle,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthSummary {
  month: number;
  year: number;
  sellingUnits: number;
  netRoyalty: number;
  paymentDate?: string;
  status: 'pending' | 'paid';
  recordCount: number;
}

interface BookRoyalty {
  bookId: string;
  bookName: string;
  subtitle?: string;
  coverPage?: string;
  publishedDate?: string;
  netSellingUnits: number;
  totalRevenue: number;
  netProfit: number;
  authorRoyalty: number;
  finalRoyalty: number;
  status: 'pending' | 'paid';
  paymentDate?: string;
  paymentMode?: string;
  transactionReference?: string;
  paymentProof?: string;
  platformSales: { platform: string; sellingUnits: number; sellingPricePerUnit: number; totalRevenue: number }[];
}

interface MonthDetail {
  totals: {
    month: number;
    year: number;
    totalNetRoyalty: number;
    totalSellingUnits: number;
    status: 'pending' | 'paid';
    paymentDate?: string;
    paymentMode?: string;
    transactionReference?: string;
    paymentProof?: string;
  };
  books: BookRoyalty[];
}

interface RoyaltySummary {
  totalEarnings: number;
  totalSoldUnits: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN').format(Math.round(n));

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Component ────────────────────────────────────────────────────────────────

const AuthorRoyalties: React.FC = () => {
  const [summary, setSummary] = useState<RoyaltySummary | null>(null);
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null);
  const [detail, setDetail] = useState<MonthDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Fetch monthly list ──────────────────────────────────────────────────────
  const fetchRoyalties = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_ENDPOINTS.ROYALTY.GET_MY_ROYALTIES);
      if (res.data?.success) {
        setSummary(res.data.data.summary);
        setMonths(res.data.data.months || []);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load royalty data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoyalties(); }, [fetchRoyalties]);

  // ── Fetch month detail ──────────────────────────────────────────────────────
  const openMonthDetail = async (month: number, year: number) => {
    try {
      setDetailLoading(true);
      setSelectedMonth({ month, year });
      const res = await axiosInstance.get(
        API_ENDPOINTS.ROYALTY.GET_MY_MONTH_DETAIL(year, month)
      );
      if (res.data?.success) setDetail(res.data.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load month detail');
      setSelectedMonth(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const goBack = () => { setSelectedMonth(null); setDetail(null); };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading royalty data..." />
      </div>
    );
  }

  // ── Month Detail View ───────────────────────────────────────────────────────
  if (selectedMonth) {
    if (detailLoading || !detail) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Loading month detail..." />
        </div>
      );
    }

    const { totals, books } = detail;

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-200 text-neutral-600 dark:text-dark-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">
              {MONTH_NAMES[totals.month - 1]} {totals.year}
            </h1>
            <p className="text-body-sm text-neutral-500 dark:text-dark-500">Monthly Royalty Detail</p>
          </div>
        </div>

        {/* Month Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 sm:col-span-1">
            <p className="text-body-xs text-neutral-500 dark:text-dark-500 font-medium uppercase tracking-wide mb-1">
              Total Net Royalty
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{formatCurrency(totals.totalNetRoyalty)}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-body-xs text-neutral-500 dark:text-dark-500 font-medium uppercase tracking-wide mb-1">
              Total Units Sold
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-dark-900">
              {totals.totalSellingUnits.toLocaleString()}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-body-xs text-neutral-500 dark:text-dark-500 font-medium uppercase tracking-wide mb-1">
              Payment Status
            </p>
            <div className="flex items-center gap-2 mt-1">
              {totals.status === 'paid' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Paid</span>
                  {totals.paymentDate && (
                    <span className="text-body-xs text-neutral-500 dark:text-dark-500">
                      {formatDate(totals.paymentDate)}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Pending</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payment Proof Section */}
        {totals.status === 'paid' && (
          <div className="card p-6">
            <h2 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900 mb-4">Payment Proof</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-body-sm">
              <div>
                <p className="text-neutral-500 dark:text-dark-500 mb-1">Net Payment</p>
                <p className="font-semibold text-neutral-900 dark:text-dark-900">₹{formatCurrency(totals.totalNetRoyalty)}</p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-dark-500 mb-1">Payment Mode</p>
                <p className="font-semibold text-neutral-900 dark:text-dark-900">{totals.paymentMode || '—'}</p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-dark-500 mb-1">Transaction ID</p>
                <p className="font-semibold font-mono text-neutral-900 dark:text-dark-900">{totals.transactionReference || '—'}</p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-dark-500 mb-1">Payment Date</p>
                <p className="font-semibold text-neutral-900 dark:text-dark-900">{formatDate(totals.paymentDate)}</p>
              </div>
            </div>
            {totals.paymentProof && (
              <a
                href={totals.paymentProof}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-body-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Payment Proof
              </a>
            )}
          </div>
        )}

        {/* Per-Book Breakdown */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-dark-300">
            <h2 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900">Book-wise Breakdown</h2>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-dark-300">
            {books.map((book) => (
              <div key={book.bookId} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {book.coverPage ? (
                      <img src={book.coverPage} alt={book.bookName} className="w-10 h-14 object-cover rounded shadow-sm" />
                    ) : (
                      <div className="w-10 h-14 bg-neutral-100 dark:bg-dark-200 rounded flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-neutral-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-dark-900">{book.bookName}</p>
                      {book.subtitle && <p className="text-body-xs text-neutral-500 dark:text-dark-500">{book.subtitle}</p>}
                      {book.publishedDate && (
                        <p className="text-body-xs text-neutral-500 dark:text-dark-500 mt-0.5">
                          Published: {formatDate(book.publishedDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={book.status === 'paid' ? 'success' : 'warning'} size="sm">
                    {book.status === 'paid' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>

                {/* Financial summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Units Sold', value: book.netSellingUnits.toLocaleString() },
                    { label: 'Total Revenue', value: `₹${formatCurrency(book.totalRevenue)}` },
                    { label: 'Author Royalty', value: `₹${formatCurrency(book.authorRoyalty)}` },
                    { label: 'Net Royalty', value: `₹${formatCurrency(book.finalRoyalty)}`, highlight: true },
                  ].map((item) => (
                    <div key={item.label} className="bg-neutral-50 dark:bg-dark-200/50 rounded-lg p-3">
                      <p className="text-body-xs text-neutral-500 dark:text-dark-500 mb-0.5">{item.label}</p>
                      <p className={`font-semibold text-body-sm ${item.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-dark-900'}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Platform sales */}
                {book.platformSales.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px] text-body-sm">
                      <thead>
                        <tr className="text-left text-neutral-500 dark:text-dark-500 uppercase text-body-xs">
                          <th className="pb-2 pr-4 font-semibold">Platform</th>
                          <th className="pb-2 pr-4 font-semibold text-right">Units</th>
                          <th className="pb-2 pr-4 font-semibold text-right">Price/Unit</th>
                          <th className="pb-2 font-semibold text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-dark-300">
                        {book.platformSales.map((ps) => (
                          <tr key={ps.platform}>
                            <td className="py-2 pr-4 text-neutral-700 dark:text-dark-700">{ps.platform}</td>
                            <td className="py-2 pr-4 text-right text-neutral-900 dark:text-dark-900">{ps.sellingUnits.toLocaleString()}</td>
                            <td className="py-2 pr-4 text-right text-neutral-900 dark:text-dark-900">₹{formatCurrency(ps.sellingPricePerUnit)}</td>
                            <td className="py-2 text-right font-medium text-neutral-900 dark:text-dark-900">₹{formatCurrency(ps.totalRevenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Monthly List View ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">Royalties</h1>
        <button
          onClick={fetchRoyalties}
          className="inline-flex items-center gap-2 px-4 py-2 text-body-sm font-medium text-neutral-600 dark:text-dark-600 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-body-xs text-neutral-500 dark:text-dark-500 font-medium uppercase tracking-wide">Total Earnings</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-dark-900">
              ₹{formatCurrency(summary?.totalEarnings ?? 0)}
            </p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-body-xs text-neutral-500 dark:text-dark-500 font-medium uppercase tracking-wide">Total Units Sold</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-dark-900">
              {(summary?.totalSoldUnits ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly List */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-dark-300">
          <h2 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900">Monthly Summary</h2>
        </div>

        {months.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center px-6">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-dark-200 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-neutral-400 dark:text-dark-400" />
            </div>
            <div>
              <h3 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900 mb-1">No Royalty Records Yet</h3>
              <p className="text-body-sm text-neutral-500 dark:text-dark-500">
                Royalty records will appear here once your books start selling.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="bg-neutral-50 dark:bg-dark-200/50">
                  <th className="text-left px-6 py-3 text-body-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">Period</th>
                  <th className="text-right px-6 py-3 text-body-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">Units Sold</th>
                  <th className="text-right px-6 py-3 text-body-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">Net Royalty</th>
                  <th className="text-center px-6 py-3 text-body-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-body-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">Payment Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-dark-300">
                {months.map((m) => (
                  <tr
                    key={`${m.year}-${m.month}`}
                    className="hover:bg-neutral-50/50 dark:hover:bg-dark-200/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-neutral-400" />
                        <span className="font-medium text-neutral-900 dark:text-dark-900">
                          {MONTH_NAMES[m.month - 1]} {m.year}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-neutral-700 dark:text-dark-700">
                      {m.sellingUnits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-neutral-900 dark:text-dark-900">
                      ₹{formatCurrency(m.netRoyalty)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={m.status === 'paid' ? 'success' : 'warning'} size="sm">
                        {m.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-body-xs text-neutral-500 dark:text-dark-500">
                      {formatDate(m.paymentDate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openMonthDetail(m.month, m.year)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-body-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                      >
                        Explore
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorRoyalties;
