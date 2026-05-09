import React, { useState, useEffect, useRef } from 'react';
import {
  Users, BookOpen, TrendingUp, ShoppingCart, DollarSign,
  Calendar, Search, ChevronDown, BarChart2, PieChart as PieChartIcon,
  Eye, MoreHorizontal, ChevronLeft, ChevronRight,
  UserCog, Mail, Ban,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../contexts/AuthContext';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';
const C_LIME  = '#84CC16';
const C_DARK  = '#334155'; // slate-700 — readable in light & dark

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlatformStats {
  totalAuthors: number; activeAuthors: number; publishedBooks: number;
  ongoingBooks: number; bookSellingUnits: number; netProfitMargin: number;
  totalRevenue: number; totalTransactions: number; activeTickets: number;
}

interface BestSellerAuthor {
  id: string; name: string; authorId: string; photo: string;
  lastPayment: string; totalPayment: string; bookSellingUnit: number;
  status: 'Active' | 'Inactive';
}

interface MonthlyPoint { _id: { year: number; month: number }; count: number }

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, loading }) => (
  <div className="group bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default">
    <div className="flex items-start justify-between mb-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 leading-snug">
        {label}
      </p>
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
        style={{ background: 'rgba(132,204,22,0.12)' }}
      >
        {icon}
      </div>
    </div>
    {loading ? (
      <div className="h-9 w-20 rounded-lg bg-neutral-100 dark:bg-neutral-700 animate-pulse" />
    ) : (
      <p className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
        {value}
      </p>
    )}
  </div>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Pie Chart ───────────────────────────────────────────────────────────────

interface PieSlice { label: string; value: number; color: string }

const SimplePieChart: React.FC<{ slices: PieSlice[]; isDark: boolean }> = ({ slices, isDark }) => {
  const total = slices.reduce((s, p) => s + p.value, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center" style={{ height: 240 }}>
      <span className="text-sm text-neutral-400 dark:text-neutral-500">No data</span>
    </div>
  );

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
      color: slice.color, label: slice.label,
      pct: `${Math.round((slice.value / total) * 100)}%`,
    });
    cumAngle += angle;
  });

  const holeFill = isDark ? '#262626' : '#ffffff';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8" style={{ minHeight: 200 }}>
      <svg viewBox="0 0 200 200" style={{ width: 160, height: 160, flexShrink: 0 }}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke={holeFill} strokeWidth={3}>
            <title>{p.label}: {p.pct}</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={44} fill={holeFill} />
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize={10} fill="#9ca3af">Total</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize={15} fontWeight="800" fill={isDark ? '#f9fafb' : '#111827'}>{total}</text>
      </svg>
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {slices.filter(s => s.value > 0).map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate">{s.label}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">{s.value}</span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500 w-10 text-right">
                {Math.round((s.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Monthly Activities ───────────────────────────────────────────────────────

type FilterRange = '3m' | '6m' | '12m';
type ViewMode = 'bar' | 'pie';

interface MonthlyActivitiesCardProps {
  monthlyBooks: MonthlyPoint[];
  monthlyAuthors: MonthlyPoint[];
  loading: boolean;
  isDark: boolean;
}

const MonthlyActivitiesCard: React.FC<MonthlyActivitiesCardProps> = ({
  monthlyBooks, monthlyAuthors, loading, isDark,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('bar');
  const [filterRange, setFilterRange] = useState<FilterRange>('6m');
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const monthCount = filterRange === '3m' ? 3 : filterRange === '12m' ? 12 : 6;
  const slots: { label: string; year: number; month: number }[] = [];
  const now = new Date();
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    slots.push({ label: `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`, year: d.getFullYear(), month: d.getMonth() + 1 });
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
    { label: 'Books Added',      value: totalBooks,   color: C_LIME },
    { label: 'Authors Enrolled', value: totalAuthors, color: C_DARK },
  ];

  const RANGE_LABELS: Record<FilterRange, string> = { '3m': 'Last 3 Months', '6m': 'Last 6 Months', '12m': 'Last 12 Months' };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50">Monthly Activities</h2>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: C_LIME }} /> Books
            </span>
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: C_DARK }} /> Authors
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(v => !v)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showFilter
                  ? 'border-lime-400 bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400'
                  : 'border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {RANGE_LABELS[filterRange]}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden">
                {(['3m','6m','12m'] as FilterRange[]).map(r => (
                  <button key={r} onClick={() => { setFilterRange(r); setShowFilter(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors ${
                      filterRange === r
                        ? 'bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400 font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }`}>
                    {RANGE_LABELS[r]}
                    {filterRange === r && <span className="w-1.5 h-1.5 rounded-full" style={{ background: LIME_DARK }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle */}
          <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-600 overflow-hidden">
            {([['bar', <BarChart2 key="b" className="w-3.5 h-3.5" />, 'Bar'], ['pie', <PieChartIcon key="p" className="w-3.5 h-3.5" />, 'Pie']] as [ViewMode, React.ReactNode, string][]).map(([mode, icon, label], i) => (
              <button key={mode}
                onClick={() => setViewMode(mode)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${i > 0 ? 'border-l border-neutral-200 dark:border-neutral-600' : ''} ${
                  viewMode === mode
                    ? 'text-white'
                    : 'text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600'
                }`}
                style={viewMode === mode ? { background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` } : undefined}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-end gap-3 px-2 animate-pulse" style={{ height: 224 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-1 flex gap-1 items-end">
              <div className="flex-1 rounded-t-lg bg-neutral-100 dark:bg-neutral-700" style={{ height: 40 + i * 14 }} />
              <div className="flex-1 rounded-t-lg bg-neutral-100 dark:bg-neutral-700" style={{ height: 24 + i * 10 }} />
            </div>
          ))}
        </div>
      ) : viewMode === 'pie' ? (
        <SimplePieChart slices={pieSlices} isDark={isDark} />
      ) : (
        <div className="relative" style={{ paddingBottom: 28 }}>
          <div className="absolute left-0 right-0 top-0 flex flex-col justify-between pointer-events-none" style={{ height: 224 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-dashed border-neutral-100 dark:border-neutral-700/60 w-full" />
            ))}
          </div>
          <div className="relative z-10 flex items-end justify-between gap-2 px-1" style={{ height: 224 }}>
            {slots.map((slot, idx) => {
              const H = 210;
              const bH = Math.max(4, Math.round((booksData[idx]   / maxVal) * H));
              const aH = Math.max(4, Math.round((authorsData[idx] / maxVal) * H));
              return (
                <div key={slot.label} className="flex-1 flex items-end justify-center gap-0.5">
                  <div className="flex-1 rounded-t-md transition-all duration-500 cursor-default"
                    style={{ height: bH, backgroundColor: C_LIME }}
                    title={`${slot.label} — Books: ${booksData[idx]}`}
                  />
                  <div className="flex-1 rounded-t-md transition-all duration-500 cursor-default"
                    style={{ height: aH, backgroundColor: C_DARK }}
                    title={`${slot.label} — Authors: ${authorsData[idx]}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between px-1 mt-2">
            {slots.map(slot => (
              <span key={slot.label} className="flex-1 text-center text-xs text-neutral-400 dark:text-neutral-500 truncate">
                {slot.label}
              </span>
            ))}
          </div>
          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-4 py-2 rounded-xl bg-white/95 dark:bg-neutral-800/95 text-sm text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                No activity data yet
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Best Seller Table ────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

interface BestSellerTableProps {
  authors: BestSellerAuthor[];
  loading: boolean;
  totalAuthors: number;
}

const ActionMenu: React.FC<{ author: BestSellerAuthor; onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // Defer to prevent immediate close from the toggle click
    const t = setTimeout(() => document.addEventListener('mousedown', h), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', h); };
  }, [onClose]);

  const actions = [
    { icon: <UserCog className="w-4 h-4" />, label: 'View Profile', onClick: () => { navigate('/admin/authors'); onClose(); } },
    { icon: <Mail className="w-4 h-4" />, label: 'Contact', onClick: onClose },
    { icon: <Ban className="w-4 h-4" />, label: 'Suspend', onClick: onClose, danger: true },
  ];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 w-40 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-700 z-50 overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      {actions.map(a => (
        <button
          key={a.label}
          onClick={a.onClick}
          className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors ${
            a.danger
              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
          }`}
        >
          {a.icon}
          {a.label}
        </button>
      ))}
    </div>
  );
};

const BestSellerTable: React.FC<BestSellerTableProps> = ({ authors, loading, totalAuthors }) => {
  const navigate = useNavigate();
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [openId, setOpenId]       = useState<string | null>(null);

  const filtered = authors
    .filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.authorId.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.bookSellingUnit - a.bookSellingUnit);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const displayTotal = Math.max(totalAuthors, filtered.length);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-neutral-100 dark:border-neutral-700">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50">Best Seller Authors</h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            Showing {paginated.length} of {displayTotal.toLocaleString()} authors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search author..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-4 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-colors w-44"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-700/30">
              {['Author','Author ID','Last Payment','Total Payment','Books Sold','Status','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(PAGE_SIZE)].map((_, i) => (
                <tr key={i} className="border-b border-neutral-50 dark:border-neutral-700/60 animate-pulse">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-700 flex-shrink-0" />
                      <div className="h-4 w-28 rounded bg-neutral-100 dark:bg-neutral-700" />
                    </div>
                  </td>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 w-16 rounded bg-neutral-100 dark:bg-neutral-700" />
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <div className="h-7 w-16 rounded-full bg-neutral-100 dark:bg-neutral-700" />
                  </td>
                </tr>
              ))
            ) : paginated.length > 0 ? (
              paginated.map((author, idx) => {
                const rank = (page - 1) * PAGE_SIZE + idx;
                const isTop = rank < 3;
                return (
                  <tr
                    key={author.id}
                    className="border-b border-neutral-50 dark:border-neutral-700/60 hover:bg-neutral-50/70 dark:hover:bg-neutral-700/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {author.photo ? (
                          <img src={author.photo} alt={author.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-700 flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}>
                            {author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                            {author.name}
                          </span>
                          {isTop && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-bold rounded-md"
                              style={{ color: LIME_DARK, background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.25)' }}>
                              #{rank + 1}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-neutral-500 dark:text-neutral-400">{author.authorId}</td>
                    <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-300">{author.lastPayment}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-neutral-900 dark:text-neutral-50">{author.totalPayment}</td>
                    <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-300">{author.bookSellingUnit.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        author.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${author.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                        {author.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate('/admin/authors')}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          title="View author"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={e => { e.stopPropagation(); setOpenId(openId === author.id ? null : author.id); }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            title="More actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openId === author.id && (
                            <ActionMenu author={author} onClose={() => setOpenId(null)} />
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                      <Users className="w-6 h-6 text-neutral-300 dark:text-neutral-500" />
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                      {search ? 'No authors match your search' : 'No data available yet'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-100 dark:border-neutral-700">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {displayTotal.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [stats, setStats] = useState<PlatformStats>({
    totalAuthors: 0, activeAuthors: 0, publishedBooks: 0, ongoingBooks: 0,
    bookSellingUnits: 0, netProfitMargin: 0, totalRevenue: 0, totalTransactions: 0, activeTickets: 0,
  });
  const [bestSellers, setBestSellers]     = useState<BestSellerAuthor[]>([]);
  const [monthlyBooks, setMonthlyBooks]   = useState<MonthlyPoint[]>([]);
  const [monthlyAuthors, setMonthlyAuthors] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading]             = useState(true);
  const [statsError, setStatsError]       = useState<string | null>(null);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true); setStatsError(null);
      try {
        const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_PLATFORM_STATS);
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setStats({
            totalAuthors:      d.totalAuthors      ?? 0,
            activeAuthors:     d.activeAuthors     ?? d.totalAuthors ?? 0,
            publishedBooks:    d.publishedBooks    ?? 0,
            ongoingBooks:      d.ongoingBooks      ?? 0,
            bookSellingUnits:  d.bookSellingUnits  ?? 0,
            netProfitMargin:   d.netProfitMargin   ?? 0,
            totalRevenue:      d.totalRevenue      ?? 0,
            totalTransactions: d.totalTransactions ?? 0,
            activeTickets:     d.activeTickets     ?? 0,
          });
          if (Array.isArray(d.bestSellers))    setBestSellers(d.bestSellers);
          if (Array.isArray(d.monthlyBooks))   setMonthlyBooks(d.monthlyBooks);
          if (Array.isArray(d.monthlyAuthors)) setMonthlyAuthors(d.monthlyAuthors);
        }
      } catch {
        setStatsError('Unable to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const displayName =
    user?.role === 'super_admin' ? 'Super Admin'
    : user?.role === 'sub_admin' ? 'Sub Admin'
    : `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Admin';

  const kpiCards: KpiCardProps[] = [
    {
      label: 'Active Authors',
      value: stats.activeAuthors.toLocaleString(),
      icon: <Users style={{ width: 18, height: 18, color: LIME_DARK }} />,
    },
    {
      label: 'Published Books',
      value: stats.publishedBooks.toLocaleString(),
      icon: <BookOpen style={{ width: 18, height: 18, color: LIME_DARK }} />,
    },
    {
      label: 'Ongoing Books',
      value: stats.ongoingBooks.toLocaleString(),
      icon: <TrendingUp style={{ width: 18, height: 18, color: LIME_DARK }} />,
    },
    {
      label: 'Books Sold',
      value: stats.bookSellingUnits.toLocaleString(),
      icon: <ShoppingCart style={{ width: 18, height: 18, color: LIME_DARK }} />,
    },
    {
      label: 'Net Profit Margin',
      value: `₹${stats.netProfitMargin.toLocaleString('en-IN')}`,
      icon: <DollarSign style={{ width: 18, height: 18, color: LIME_DARK }} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
          Welcome back, {displayName}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Here&apos;s what&apos;s happening on your platform today.
        </p>
      </div>

      {/* Error */}
      {statsError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 text-sm">
          {statsError}
          <button onClick={() => window.location.reload()} className="ml-auto text-xs font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map(card => (
          <KpiCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Chart (full width) */}
      <MonthlyActivitiesCard
        monthlyBooks={monthlyBooks}
        monthlyAuthors={monthlyAuthors}
        loading={loading}
        isDark={isDark}
      />

      {/* Best Sellers */}
      <BestSellerTable authors={bestSellers} loading={loading} totalAuthors={stats.activeAuthors} />
    </div>
  );
};

export default Dashboard;
