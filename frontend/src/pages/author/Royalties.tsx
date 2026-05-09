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
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

  const openMonthDetail = async (month: number, year: number) => {
    try {
      setDetailLoading(true);
      setSelectedMonth({ month, year });
      const res = await axiosInstance.get(API_ENDPOINTS.ROYALTY.GET_MY_MONTH_DETAIL(year, month));
      if (res.data?.success) setDetail(res.data.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load month detail');
      setSelectedMonth(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const goBack = () => { setSelectedMonth(null); setDetail(null); };

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
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {MONTH_NAMES[totals.month - 1]} {totals.year}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Monthly Royalty Detail</p>
          </div>
        </div>

        {/* Month Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-5 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${LIME}, ${LIME_DARK})` }} />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-widest mb-2">Total Net Royalty</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{formatCurrency(totals.totalNetRoyalty)}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-5">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-widest mb-2">Total Units Sold</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {totals.totalSellingUnits.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-5">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-widest mb-2">Payment Status</p>
            <div className="flex items-center gap-2 mt-1">
              {totals.status === 'paid' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Paid</span>
                  {totals.paymentDate && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(totals.paymentDate)}</span>
                  )}
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-amber-600 dark:text-amber-400">Pending</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payment Proof */}
        {totals.status === 'paid' && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Payment Proof</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                { label: 'Net Payment', value: `₹${formatCurrency(totals.totalNetRoyalty)}` },
                { label: 'Payment Mode', value: totals.paymentMode || '—' },
                { label: 'Transaction ID', value: totals.transactionReference || '—', mono: true },
                { label: 'Payment Date', value: formatDate(totals.paymentDate) },
              ].map(item => (
                <div key={item.label} className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{item.label}</p>
                  <p className={`font-semibold text-neutral-900 dark:text-white ${item.mono ? 'font-mono text-xs' : ''}`}>{item.value}</p>
                </div>
              ))}
            </div>
            {totals.paymentProof && (
              <a
                href={totals.paymentProof}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
              >
                <Download className="w-4 h-4" />
                Download Payment Proof
              </a>
            )}
          </div>
        )}

        {/* Per-Book Breakdown */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: LIME_DARK }} />
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Book-wise Breakdown</h2>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {books.map((book) => (
              <div key={book.bookId} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {book.coverPage ? (
                      <img src={book.coverPage} alt={book.bookName} className="w-10 h-14 object-cover rounded-lg shadow-sm" />
                    ) : (
                      <div className="w-10 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(132,204,22,0.10)' }}>
                        <BookOpen className="w-5 h-5" style={{ color: LIME_DARK }} />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">{book.bookName}</p>
                      {book.subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400">{book.subtitle}</p>}
                      {book.publishedDate && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          Published: {formatDate(book.publishedDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={book.status === 'paid' ? 'success' : 'warning'} size="sm">
                    {book.status === 'paid' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Units Sold', value: book.netSellingUnits.toLocaleString() },
                    { label: 'Total Revenue', value: `₹${formatCurrency(book.totalRevenue)}` },
                    { label: 'Author Royalty', value: `₹${formatCurrency(book.authorRoyalty)}` },
                    { label: 'Net Royalty', value: `₹${formatCurrency(book.finalRoyalty)}`, highlight: true },
                  ].map((item) => (
                    <div key={item.label} className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">{item.label}</p>
                      <p className={`font-semibold text-sm ${item.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {book.platformSales.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px] text-sm">
                      <thead>
                        <tr className="text-left text-neutral-500 dark:text-neutral-400 uppercase text-xs border-b border-neutral-100 dark:border-neutral-800">
                          <th className="pb-2 pr-4 font-semibold">Platform</th>
                          <th className="pb-2 pr-4 font-semibold text-right">Units</th>
                          <th className="pb-2 pr-4 font-semibold text-right">Price/Unit</th>
                          <th className="pb-2 font-semibold text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {book.platformSales.map((ps) => (
                          <tr key={ps.platform}>
                            <td className="py-2 pr-4 text-neutral-700 dark:text-neutral-300">{ps.platform}</td>
                            <td className="py-2 pr-4 text-right text-neutral-900 dark:text-white">{ps.sellingUnits.toLocaleString()}</td>
                            <td className="py-2 pr-4 text-right text-neutral-900 dark:text-white">₹{formatCurrency(ps.sellingPricePerUnit)}</td>
                            <td className="py-2 text-right font-semibold text-neutral-900 dark:text-white">₹{formatCurrency(ps.totalRevenue)}</td>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Royalties</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Track your earnings and payment history</p>
        </div>
        <button
          onClick={fetchRoyalties}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-5 flex items-center gap-4 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${LIME}, ${LIME_DARK})` }} />
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(132,204,22,0.10)' }}>
            <IndianRupee className="w-6 h-6" style={{ color: LIME_DARK }} />
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-widest">Total Earnings</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">
              ₹{formatCurrency(summary?.totalEarnings ?? 0)}
            </p>
          </div>
          <TrendingUp className="w-16 h-16 absolute right-4 bottom-2 opacity-5" style={{ color: LIME_DARK }} />
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(132,204,22,0.10)' }}>
            <Package className="w-6 h-6" style={{ color: LIME_DARK }} />
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-widest">Total Units Sold</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">
              {(summary?.totalSoldUnits ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" style={{ color: LIME_DARK }} />
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Monthly Summary</h2>
        </div>

        {months.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center px-6">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">No Royalty Records Yet</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Royalty records will appear here once your books start selling.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Period</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Units Sold</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Net Royalty</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Payment Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {months.map((m) => (
                  <tr
                    key={`${m.year}-${m.month}`}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(132,204,22,0.10)' }}>
                          <CalendarDays className="w-3.5 h-3.5" style={{ color: LIME_DARK }} />
                        </div>
                        <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                          {MONTH_NAMES[m.month - 1]} {m.year}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-neutral-700 dark:text-neutral-300">
                      {m.sellingUnits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold" style={{ color: LIME_DARK }}>
                        ₹{formatCurrency(m.netRoyalty)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={m.status === 'paid' ? 'success' : 'warning'} size="sm">
                        {m.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-neutral-500 dark:text-neutral-400">
                      {formatDate(m.paymentDate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openMonthDetail(m.month, m.year)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all"
                        style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
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
