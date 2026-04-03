import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Calendar,
  PieChart,
  Search,
} from 'lucide-react';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlatformStats {
  totalAuthors: number;
  totalBooks: number;
  totalRevenue: number;
  activeAuthors: number;
  publishedBooks: number;
  ongoingBooks: number;
  bookSellingUnits: number;
  netProfitMargin: number;
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

// ─── KPI Card Component ─────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  iconBgClass: string;
  label: string;
  value: number | string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBgClass, label, value }) => (
  <div className="bg-white dark:bg-dark-100 rounded-xl shadow-md dark:shadow-dark-md p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-lg dark:hover:shadow-dark-lg">
    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${iconBgClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-body-sm text-neutral-500 dark:text-dark-500">{label}</p>
      <p className="text-h3 font-semibold text-neutral-900 dark:text-dark-900">{value}</p>
    </div>
  </div>
);

// ─── Monthly Activities Chart Skeleton ───────────────────────────────────────

const months = [
  'April 2025',
  'May 2025',
  'June 2025',
  'July 2025',
  'August 2025',
  'September 2025',
];

const barHeights = [60, 45, 70, 35, 55, 50]; // placeholder heights (%)

const MonthlyActivitiesCard: React.FC = () => (
  <div className="bg-white dark:bg-dark-100 rounded-xl shadow-md dark:shadow-dark-md p-6 transition-all duration-200">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <h2 className="text-h4 font-semibold text-neutral-900 dark:text-dark-900">
        Monthly Activities
      </h2>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-2 px-4 py-2 text-body-sm font-medium rounded-lg border border-neutral-200 dark:border-dark-200 text-neutral-600 dark:text-dark-600 bg-white dark:bg-dark-50 hover:bg-neutral-50 dark:hover:bg-dark-100 transition-colors">
          <Calendar className="w-4 h-4" />
          Use filter (Calendar)
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-body-sm font-medium rounded-lg border border-neutral-200 dark:border-dark-200 text-neutral-600 dark:text-dark-600 bg-white dark:bg-dark-50 hover:bg-neutral-50 dark:hover:bg-dark-100 transition-colors">
          <PieChart className="w-4 h-4" />
          Pie Chart
        </button>
      </div>
    </div>

    {/* Chart Skeleton */}
    <div className="relative">
      {/* Y-axis placeholder lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="border-b border-dashed border-neutral-100 dark:border-dark-200 w-full"
          />
        ))}
      </div>

      {/* Bars */}
      <div className="flex items-end justify-between gap-4 h-56 px-2 pt-2 pb-0 relative z-10">
        {months.map((month, idx) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex justify-center">
              <div
                className="w-10 rounded-t-md bg-gradient-to-t from-primary-600 to-primary-400 dark:from-primary-500 dark:to-primary-300 opacity-25"
                style={{ height: `${barHeights[idx]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between gap-4 px-2 mt-3">
        {months.map((month) => (
          <span
            key={month}
            className="flex-1 text-center text-body-xs text-neutral-400 dark:text-dark-400 truncate"
          >
            {month}
          </span>
        ))}
      </div>

      {/* Overlay message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="px-4 py-2 rounded-lg bg-neutral-50/90 dark:bg-dark-50/90 text-body-sm text-neutral-500 dark:text-dark-500 font-medium backdrop-blur-sm border border-neutral-200 dark:border-dark-200">
          Chart data will be available in Phase 2
        </span>
      </div>
    </div>
  </div>
);

// ─── Best Seller Author List ─────────────────────────────────────────────────

interface BestSellerTableProps {
  authors: BestSellerAuthor[];
  loading: boolean;
}

const BestSellerTable: React.FC<BestSellerTableProps> = ({ authors, loading }) => (
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
          className="pl-9 pr-4 py-2 text-body-sm rounded-lg border border-neutral-200 dark:border-dark-200 bg-white dark:bg-dark-50 text-neutral-700 dark:text-dark-700 placeholder-neutral-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors w-56"
        />
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-neutral-100 dark:border-dark-200">
            <th className="pb-3 pr-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">
              Author
            </th>
            <th className="pb-3 px-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">
              Author ID
            </th>
            <th className="pb-3 px-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">
              Last Payment
            </th>
            <th className="pb-3 px-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">
              Total Payment
            </th>
            <th className="pb-3 px-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">
              Books Selling Unit
            </th>
            <th className="pb-3 pl-4 text-label text-neutral-500 dark:text-dark-500 font-semibold">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            // Skeleton rows
            [...Array(3)].map((_, i) => (
              <tr
                key={i}
                className="border-b border-neutral-50 dark:border-dark-200 animate-pulse"
              >
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-dark-200" />
                    <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-dark-200" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-dark-200" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-dark-200" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-dark-200" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-dark-200" />
                </td>
                <td className="py-4 pl-4">
                  <div className="h-6 w-16 rounded-full bg-neutral-200 dark:bg-dark-200" />
                </td>
              </tr>
            ))
          ) : authors.length > 0 ? (
            authors.map((author) => (
              <tr
                key={author.id}
                className="border-b border-neutral-50 dark:border-dark-200 hover:bg-neutral-50/50 dark:hover:bg-dark-50/50 transition-colors"
              >
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={author.photo}
                      alt={author.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-dark-200"
                    />
                    <span className="text-body-sm font-medium text-neutral-800 dark:text-dark-800">
                      {author.name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-body-sm text-neutral-600 dark:text-dark-600">
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
                    No data available yet
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

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalAuthors: 0,
    totalBooks: 0,
    totalRevenue: 0,
    activeAuthors: 0,
    publishedBooks: 0,
    ongoingBooks: 0,
    bookSellingUnits: 0,
    netProfitMargin: 0,
  });
  const [bestSellers, setBestSellers] = useState<BestSellerAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_PLATFORM_STATS);
        if (response.data?.success && response.data?.data) {
          const data = response.data.data;
          setStats({
            totalAuthors: data.totalAuthors ?? 0,
            totalBooks: data.totalBooks ?? 0,
            totalRevenue: data.totalRevenue ?? 0,
            activeAuthors: data.activeAuthors ?? data.totalAuthors ?? 0,
            publishedBooks: data.publishedBooks ?? 0,
            ongoingBooks: data.ongoingBooks ?? 0,
            bookSellingUnits: data.bookSellingUnits ?? 0,
            netProfitMargin: data.netProfitMargin ?? 0,
          });
          if (data.bestSellers) {
            setBestSellers(data.bestSellers);
          }
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
      value: loading ? '...' : stats.activeAuthors,
    },
    {
      icon: <BookOpen className="w-5 h-5 text-amber-600" />,
      iconBgClass: 'bg-amber-100 dark:bg-amber-900/30',
      label: 'Published Books',
      value: loading ? '...' : stats.publishedBooks,
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      iconBgClass: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Ongoing Books',
      value: loading ? '...' : stats.ongoingBooks,
    },
    {
      icon: <ShoppingCart className="w-5 h-5 text-indigo-600" />,
      iconBgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
      label: 'Books Selling Units',
      value: loading ? '...' : stats.bookSellingUnits,
    },
    {
      icon: <DollarSign className="w-5 h-5 text-orange-600" />,
      iconBgClass: 'bg-orange-100 dark:bg-orange-900/30',
      label: 'Net Profit Margin',
      value: loading ? '...' : stats.netProfitMargin,
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
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-error-light/10 border border-error-light/20 text-error-dark dark:text-error-light text-body-sm">
          <span>{statsError}</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-auto underline text-body-xs font-medium hover:text-error"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* Monthly Activities */}
      <MonthlyActivitiesCard />

      {/* Best Seller Author List */}
      <BestSellerTable authors={bestSellers} loading={loading} />
    </div>
  );
};

export default Dashboard;
