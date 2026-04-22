import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  BookOpen,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Calendar,
  PieChart,
  Search,
  ChevronDown,
  X,
  BarChart2,
} from 'lucide-react';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlatformStats {
  totalAuthors: number;
  activeAuthors: number;
  publishedBooks: number;
  ongoingBooks: number;
  bookSellingUnits: number;
  netProfitMargin: number;
  totalRevenue: number;
  totalTransactions: number;
  activeTickets: number;
}

interface BestSellerAuthor {
  id: string;
  name: string;
  authorId: string;
  photo: string;
  lastPayment: string;
  totalPayment: string;
  bookSellingUnit: number;
  status: 'Active' | 'Inactive';
}

interface MonthlyPoint {
  _id: { year: number; month: number };
  count: number;
}

// ─── KPI Card Component ─────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  iconBgClass: string;
  label: string;
  value: number | string;
  loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBgClass, label, value, loading }) => (
  <div className="bg-white dark:bg-dark-100 rounded-xl shadow-md dark:shadow-dark-md p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-lg dark:hover:shadow-dark-lg">
    <div className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 ${iconBgClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-body-sm text-neutral-500 dark:text-dark-500">{label}</p>
      {loading ? (
        <div className="h-7 w-12 rounded bg-neutral-200 dark:bg-dark-200 animate-pulse mt-1" />
      ) : (
        <p className="text-h3 font-semibold text-neutral-900 dark:text-dark-900">{value}</p>
      )}
    </div>
  </div>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Pie Chart View ───────────────────────────────────────────────────────────

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface PieSlice { label: string; value: number; color: string }

const SimplePieChart: React.FC<{ slices: PieSlice[] }> = ({ slices }) => {
  const total = slices.reduce((s, p) => s + p.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: 240 }}>
        <span className="text-body-sm text-neutral-400 dark:text-dark-400">No data to display</span>
      </div>
    );
  }

  // Build SVG pie
  const cx = 100; const cy = 100; const r = 80;
  let cumAngle = -Math.PI / 2;
  const paths: { d: string; color: string; label: string; pct: string }[] = [];

  slices.forEach(slice => {
    if (slice.value === 0) return;
    const angle = (slice.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    const x2 = cx + r * Math.cos(cumAngle + angle);
    const y2 = cy + r * Math.sin(cumAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    paths.push({
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
      color: slice.color,
      label: slice.label,
      pct: `${Math.round((slice.value / total) * 100)}%`,
    });
    cumAngle += angle;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6" style={{ minHeight: 200 }}>
      <svg viewBox="0 0 200 200" style={{ width: 160, height: 160, flexShrink: 0 }}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth={2}>
            <title>{p.label}: {p.pct}</title>
          </path>
        ))}
        {/* Donut hole */}
        <circle cx={cx} cy={cy} r={38} fill="white" className="dark:fill-dark-100" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={11} fill="#6b7280">Total</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#1f2937">{total}</text>
      </svg>
      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {slices.filter(s => s.value > 0).map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-body-sm text-neutral-700 dark:text-dark-700 truncate">{s.label}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-body-sm font-semibold text-neutral-900 dark:text-dark-900">{s.value}</span>
              <span className="text-body-xs text-neutral-400 dark:text-dark-400 w-10 text-right">
                {Math.round((s.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Monthly Activities Chart ─────────────────────────────────────────────────

interface MonthlyActivitiesCardProps {
  monthlyBooks: MonthlyPoint[];
  monthlyAuthors: MonthlyPoint[];
  loading: boolean;
}

type FilterRange = '3m' | '6m' | '12m';

const MonthlyActivitiesCard: React.FC<MonthlyActivitiesCardProps> = ({
  monthlyBooks,
  monthlyAuthors,
  loading,
}) => {
  const [viewMode, setViewMode] = useState<'bar' | 'pie'>('bar');
  const [filterRange, setFilterRange] = useState<FilterRange>('6m');
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build month slots based on selected range
  const monthCount = filterRange === '3m' ? 3 : filterRange === '12m' ? 12 : 6;
  const slots: { label: string; year: number; month: number }[] = [];
  const now = new Date();
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    slots.push({
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }

  const booksMap: Record<string, number> = {};
  const authorsMap: Record<string, number> = {};
  monthlyBooks.forEach(p => { booksMap[`${p._id.year}-${p._id.month}`] = p.count; });
  monthlyAuthors.forEach(p => { authorsMap[`${p._id.year}-${p._id.month}`] = p.count; });

  const booksData  = slots.map(s => booksMap[`${s.year}-${s.month}`]   || 0);
  const authorsData = slots.map(s => authorsMap[`${s.year}-${s.month}`] || 0);
  const maxVal = Math.max(...booksData, ...authorsData, 1);
  const hasData = booksData.some(v => v > 0) || authorsData.some(v => v > 0);

  const totalBooks   = booksData.reduce((a, b) => a + b, 0);
  const totalAuthors = authorsData.reduce((a, b) => a + b, 0);

  const pieSlices: PieSlice[] = [
    { label: 'Books Added',     value: totalBooks,   color: PIE_COLORS[0] },
    { label: 'Authors Enrolled', value: totalAuthors, color: PIE_COLORS[1] },
  ];

  const RANGE_LABELS: Record<FilterRange, string> = { '3m': 'Last 3 Months', '6m': 'Last 6 Months', '12m': 'Last 12 Months' };

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl shadow-md dark:shadow-dark-md p-6 transition-all duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-h4 font-semibold text-neutral-900 dark:text-dark-900">
            Monthly Activities
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-body-xs text-neutral-500 dark:text-dark-500">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: PIE_COLORS[0] }} /> Books
            </span>
            <span className="flex items-center gap-1.5 text-body-xs text-neutral-500 dark:text-dark-500">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: PIE_COLORS[1] }} /> Authors
            </span>
            {filterRange !== '6m' && (
              <span className="flex items-center gap-1 text-body-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {RANGE_LABELS[filterRange]}
                <button onClick={() => setFilterRange('6m')} className="ml-0.5 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(v => !v)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-body-sm font-medium rounded-lg border transition-colors ${
                showFilter
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-neutral-200 dark:border-dark-200 text-neutral-600 dark:text-dark-600 bg-white dark:bg-dark-50 hover:bg-neutral-50 dark:hover:bg-dark-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {RANGE_LABELS[filterRange]}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
            </button>

            {showFilter && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dark-50 rounded-xl shadow-lg dark:shadow-dark-lg border border-neutral-200 dark:border-dark-200 z-50 overflow-hidden">
                {(['3m', '6m', '12m'] as FilterRange[]).map(range => (
                  <button
                    key={range}
                    onClick={() => { setFilterRange(range); setShowFilter(false); }}
                    className={`w-full text-left px-4 py-2.5 text-body-sm transition-colors flex items-center justify-between ${
                      filterRange === range
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'text-neutral-700 dark:text-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-100'
                    }`}
                  >
                    {RANGE_LABELS[range]}
                    {filterRange === range && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Bar / Pie */}
          <div className="flex rounded-lg border border-neutral-200 dark:border-dark-200 overflow-hidden">
            <button
              onClick={() => setViewMode('bar')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-body-sm font-medium transition-colors ${
                viewMode === 'bar'
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-600 dark:text-dark-600 bg-white dark:bg-dark-50 hover:bg-neutral-50 dark:hover:bg-dark-100'
              }`}
              title="Bar Chart"
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Bar</span>
            </button>
            <button
              onClick={() => setViewMode('pie')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-body-sm font-medium transition-colors border-l border-neutral-200 dark:border-dark-200 ${
                viewMode === 'pie'
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-600 dark:text-dark-600 bg-white dark:bg-dark-50 hover:bg-neutral-50 dark:hover:bg-dark-100'
              }`}
              title="Pie Chart"
            >
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Pie</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart area */}
      {loading ? (
        <div className="flex items-end gap-4 px-2 animate-pulse" style={{ height: 224 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-1 flex gap-1 items-end">
              <div className="flex-1 rounded-t-md bg-neutral-200 dark:bg-dark-200" style={{ height: 40 + i * 14 }} />
              <div className="flex-1 rounded-t-md bg-neutral-100 dark:bg-dark-100" style={{ height: 24 + i * 10 }} />
            </div>
          ))}
        </div>
      ) : viewMode === 'pie' ? (
        <SimplePieChart slices={pieSlices} />
      ) : (
        <div className="relative" style={{ paddingBottom: 28 }}>
          {/* Grid lines */}
          <div
            className="absolute left-0 right-0 top-0 flex flex-col justify-between pointer-events-none"
            style={{ height: 224 }}
          >
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-dashed border-neutral-100 dark:border-dark-200 w-full" />
            ))}
          </div>

          {/* Bars */}
          <div
            className="relative z-10 flex items-end justify-between gap-3 px-2"
            style={{ height: 224 }}
          >
            {slots.map((slot, idx) => {
              const CHART_H = 210;
              const bookH   = Math.max(4, Math.round((booksData[idx]   / maxVal) * CHART_H));
              const authorH = Math.max(4, Math.round((authorsData[idx] / maxVal) * CHART_H));
              return (
                <div key={slot.label} className="flex-1 flex items-end justify-center gap-1 group">
                  <div
                    className="flex-1 rounded-t-md transition-all duration-500 cursor-default"
                    style={{ height: bookH, backgroundColor: PIE_COLORS[0] }}
                    title={`${slot.label} — Books: ${booksData[idx]}`}
                  />
                  <div
                    className="flex-1 rounded-t-md transition-all duration-500 cursor-default"
                    style={{ height: authorH, backgroundColor: PIE_COLORS[1] }}
                    title={`${slot.label} — Authors: ${authorsData[idx]}`}
                  />
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between gap-3 px-2 mt-2">
            {slots.map(slot => (
              <span key={slot.label} className="flex-1 text-center text-body-xs text-neutral-400 dark:text-dark-400 truncate">
                {slot.label}
              </span>
            ))}
          </div>

          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ bottom: 28 }}>
              <span className="px-4 py-2 rounded-lg bg-white/90 dark:bg-dark-100/90 text-body-sm text-neutral-500 dark:text-dark-500 font-medium border border-neutral-200 dark:border-dark-200">
                No activity data yet
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Best Seller Author List ─────────────────────────────────────────────────

interface BestSellerTableProps {
  authors: BestSellerAuthor[];
  loading: boolean;
}

const BestSellerTable: React.FC<BestSellerTableProps> = ({ authors, loading }) => {
  const [search, setSearch] = useState('');
  const filtered = authors.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.authorId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl shadow-md dark:shadow-dark-md p-6 transition-all duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-h4 font-semibold text-neutral-900 dark:text-dark-900">
          Best Seller Author List
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-dark-400" />
          <input
            type="text"
            placeholder="Search author..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-body-sm rounded-lg border border-neutral-200 dark:border-dark-200 bg-white dark:bg-dark-50 text-neutral-700 dark:text-dark-700 placeholder-neutral-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-dark-200">
              <th className="pb-3 pr-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">Author</th>
              <th className="pb-3 px-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">Author ID</th>
              <th className="pb-3 px-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">Last Payment</th>
              <th className="pb-3 px-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">Total Payment</th>
              <th className="pb-3 px-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">Books Selling Unit</th>
              <th className="pb-3 pl-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-neutral-50 dark:border-dark-200 animate-pulse">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-dark-200" />
                      <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-dark-200" />
                    </div>
                  </td>
                  <td className="py-4 px-4"><div className="h-4 w-20 rounded bg-neutral-200 dark:bg-dark-200" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-16 rounded bg-neutral-200 dark:bg-dark-200" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-16 rounded bg-neutral-200 dark:bg-dark-200" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-12 rounded bg-neutral-200 dark:bg-dark-200" /></td>
                  <td className="py-4 pl-4"><div className="h-6 w-16 rounded-full bg-neutral-200 dark:bg-dark-200" /></td>
                </tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map(author => (
                <tr
                  key={author.id}
                  className="border-b border-neutral-50 dark:border-dark-200 hover:bg-neutral-50/50 dark:hover:bg-dark-50/50 transition-colors"
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      {author.photo ? (
                        <img
                          src={author.photo}
                          alt={author.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-dark-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-body-sm">
                          {author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-body-sm font-medium text-neutral-800 dark:text-dark-800">
                        {author.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-body-sm text-neutral-600 dark:text-dark-600 font-mono">
                    {author.authorId}
                  </td>
                  <td className="py-4 px-4 text-body-sm text-neutral-600 dark:text-dark-600">
                    {author.lastPayment}
                  </td>
                  <td className="py-4 px-4 text-body-sm font-medium text-neutral-800 dark:text-dark-800">
                    {author.totalPayment}
                  </td>
                  <td className="py-4 px-4 text-body-sm text-neutral-600 dark:text-dark-600">
                    {author.bookSellingUnit}
                  </td>
                  <td className="py-4 pl-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-body-xs font-medium ${
                        author.status === 'Active'
                          ? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400'
                          : 'bg-neutral-100 text-neutral-500 dark:bg-dark-200 dark:text-dark-500'
                      }`}
                    >
                      {author.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-dark-200 flex items-center justify-center">
                      <Users className="w-6 h-6 text-neutral-400 dark:text-dark-400" />
                    </div>
                    <p className="text-body-sm text-neutral-500 dark:text-dark-500 font-medium">
                      {search ? 'No authors match your search' : 'No data available yet'}
                    </p>
                    <p className="text-body-xs text-neutral-400 dark:text-dark-400">
                      Best seller data will appear here once authors start publishing
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalAuthors: 0,
    activeAuthors: 0,
    publishedBooks: 0,
    ongoingBooks: 0,
    bookSellingUnits: 0,
    netProfitMargin: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    activeTickets: 0,
  });
  const [bestSellers, setBestSellers] = useState<BestSellerAuthor[]>([]);
  const [monthlyBooks, setMonthlyBooks] = useState<MonthlyPoint[]>([]);
  const [monthlyAuthors, setMonthlyAuthors] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setStatsError(null);
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_PLATFORM_STATS);
        if (response.data?.success && response.data?.data) {
          const d = response.data.data;
          setStats({
            totalAuthors:     d.totalAuthors     ?? 0,
            activeAuthors:    d.activeAuthors    ?? d.totalAuthors ?? 0,
            publishedBooks:   d.publishedBooks   ?? 0,
            ongoingBooks:     d.ongoingBooks     ?? 0,
            bookSellingUnits: d.bookSellingUnits ?? 0,
            netProfitMargin:  d.netProfitMargin  ?? 0,
            totalRevenue:     d.totalRevenue     ?? 0,
            totalTransactions: d.totalTransactions ?? 0,
            activeTickets:    d.activeTickets    ?? 0,
          });
          if (Array.isArray(d.bestSellers)) setBestSellers(d.bestSellers);
          if (Array.isArray(d.monthlyBooks)) setMonthlyBooks(d.monthlyBooks);
          if (Array.isArray(d.monthlyAuthors)) setMonthlyAuthors(d.monthlyAuthors);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
        setStatsError('Unable to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpiCards: KpiCardProps[] = [
    {
      icon: <Users className="w-5 h-5 text-green-600" />,
      iconBgClass: 'bg-green-100 dark:bg-green-900/30',
      label: 'Active Authors',
      value: stats.activeAuthors,
    },
    {
      icon: <BookOpen className="w-5 h-5 text-amber-600" />,
      iconBgClass: 'bg-amber-100 dark:bg-amber-900/30',
      label: 'Published Books',
      value: stats.publishedBooks,
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      iconBgClass: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Ongoing Books',
      value: stats.ongoingBooks,
    },
    {
      icon: <ShoppingCart className="w-5 h-5 text-indigo-600" />,
      iconBgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
      label: 'Books Selling Units',
      value: stats.bookSellingUnits,
    },
    {
      icon: <DollarSign className="w-5 h-5 text-orange-600" />,
      iconBgClass: 'bg-orange-100 dark:bg-orange-900/30',
      label: 'Net Profit Margin',
      value: `₹${stats.netProfitMargin.toLocaleString('en-IN')}`,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title */}
      <div>
        <h1 className="text-h2 font-bold text-neutral-900 dark:text-dark-900">
          Admin Dashboard
        </h1>
        <p className="text-body-sm text-neutral-500 dark:text-dark-500 mt-1">
          Overview of platform performance and key metrics
        </p>
      </div>

      {/* Error Banner */}
      {statsError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 text-body-sm">
          <span>{statsError}</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-auto underline text-body-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map(card => (
          <KpiCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Monthly Activities */}
      <MonthlyActivitiesCard
        monthlyBooks={monthlyBooks}
        monthlyAuthors={monthlyAuthors}
        loading={loading}
      />

      {/* Best Seller Author List */}
      <BestSellerTable authors={bestSellers} loading={loading} />
    </div>
  );
};

export default Dashboard;
