import React, { useState, useCallback, useEffect } from 'react';
import {
  Search,
  Plus,
  ArrowLeft,
  BookOpen,
  AlertCircle,
  TrendingUp,
  Loader2,
  History,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AllSellingRecord {
  sellingRecordId: string;
  bookId: string;
  bookName: string;
  authorName: string;
  month: number;
  year: number;
  totalSellingUnits: number;
  totalRevenue: number;
  netProfit: number;
  authorRoyalty: number;
  createdAt: string;
  updatedAt: string;
}

interface BookOption {
  bookId: string;
  bookName: string;
  subtitle?: string;
  authorId: string;
  authorName?: string;
  royaltyPercentage: number;
  marketplaces: string[];
  coverPage?: string;
}

interface PlatformRow {
  platform: string;
  sellingUnits: string;
  sellingPricePerUnit: string;
  totalRevenue: number;
}

interface Financials {
  totalSellingUnits: number;
  totalRevenue: number;
  productionCost: number;
  grossMargin: number;
  adsCost: number;
  platformFees: number;
  returnsExchangeAmount: number;
  outstandingAmount: number;
  netProfit: number;
  royaltyPercentage: number;
  authorRoyalty: number;
}


const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = MONTH_NAMES.map((name, i) => ({ label: name, value: i + 1 }));

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(Math.round(n));

// ─── Component ────────────────────────────────────────────────────────────────

type View = 'search' | 'form';

const AdminSelling: React.FC = () => {
  const [view, setView] = useState<View>('search');

  // Book search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookOption | null>(null);

  // Form state
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [platformRows, setPlatformRows] = useState<PlatformRow[]>([]);
  const [costPerBook, setCostPerBook] = useState('');
  const [adsCostPerUnit, setAdsCostPerUnit] = useState('');
  const [platformFees, setPlatformFees] = useState('');
  const [returnsExchangeAmount, setReturnsExchangeAmount] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');

  // Preview / submission
  const [previewFinancials, setPreviewFinancials] = useState<Financials | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // All selling records (main page)
  const [allRecords, setAllRecords] = useState<AllSellingRecord[]>([]);
  const [allRecordsLoading, setAllRecordsLoading] = useState(false);
  const [allRecordsPage, setAllRecordsPage] = useState(1);
  const [allRecordsTotal, setAllRecordsTotal] = useState(0);
  const ALL_RECORDS_LIMIT = 10;

  // ── Search books ────────────────────────────────────────────────────────────
  const searchBooks = useCallback(async (query?: string) => {
    try {
      setSearching(true);
      const params: any = { status: 'published', limit: 20 };
      const q = query !== undefined ? query : searchQuery;
      if (q.trim()) params.search = q.trim();
      const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_ALL_BOOKS, { params });
      if (res.data?.success) {
        const books = (res.data.data?.books || []).map((b: any) => ({
          bookId: b.bookId,
          bookName: b.bookName,
          subtitle: b.subtitle,
          authorId: b.authorId,
          authorName: b.authorName || b.authorId,
          royaltyPercentage: b.royaltyPercentage || 70,
          marketplaces: b.marketplaces || [],
          coverPage: b.coverPage,
        }));
        setSearchResults(books);
      }
    } catch {
      toast.error('Failed to load books');
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  // Load all published books on mount
  useEffect(() => { searchBooks(''); }, []);

  // ── Load all selling records ─────────────────────────────────────────────────
  const loadAllRecords = useCallback(async (page = 1) => {
    try {
      setAllRecordsLoading(true);
      const res = await axiosInstance.get(API_ENDPOINTS.SELLING.GET_ALL_RECORDS, {
        params: { page, limit: ALL_RECORDS_LIMIT },
      });
      if (res.data?.success) {
        setAllRecords(res.data.data.records || []);
        setAllRecordsTotal(res.data.data.pagination?.total || 0);
        setAllRecordsPage(page);
      }
    } catch {
      toast.error('Failed to load selling history');
    } finally {
      setAllRecordsLoading(false);
    }
  }, []);

  useEffect(() => { loadAllRecords(1); }, []);

  // ── Select book ─────────────────────────────────────────────────────────────
  const selectBook = async (book: BookOption) => {
    setSelectedBook(book);
    setPreviewFinancials(null);

    // Fetch most recent selling record for this book to pre-fill costs
    let lastRecord: any = null;
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.SELLING.GET_HISTORY(book.bookId), {
        params: { limit: 1, page: 1 },
      });
      if (res.data?.success) lastRecord = res.data.data.records?.[0] ?? null;
    } catch { /* ignore — just won't pre-fill */ }

    // Pre-fill platform rows with last known price per unit
    const platforms = book.marketplaces.length > 0 ? book.marketplaces : ['Amazon'];
    setPlatformRows(
      platforms.map((p) => {
        const prev = lastRecord?.platformSales?.find((s: any) => s.platform === p);
        return {
          platform: p,
          sellingUnits: '',
          sellingPricePerUnit: prev ? String(prev.sellingPricePerUnit) : '',
          totalRevenue: 0,
        };
      })
    );

    // Pre-fill cost fields
    setCostPerBook(lastRecord?.costPerBook ? String(lastRecord.costPerBook) : '');
    setAdsCostPerUnit(lastRecord?.adsCostPerUnit ? String(lastRecord.adsCostPerUnit) : '');
    setPlatformFees(lastRecord?.platformFees ? String(lastRecord.platformFees) : '');
    setReturnsExchangeAmount(lastRecord?.returnsExchangeAmount ? String(lastRecord.returnsExchangeAmount) : '');
    setOutstandingAmount('');

    setView('form');
  };

  // ── Add platform row ────────────────────────────────────────────────────────
  const addPlatformRow = () => {
    setPlatformRows((prev) => [...prev, { platform: '', sellingUnits: '', sellingPricePerUnit: '', totalRevenue: 0 }]);
  };

  const removePlatformRow = (idx: number) => {
    setPlatformRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: keyof PlatformRow, value: string) => {
    setPlatformRows((prev) => {
      const rows = [...prev];
      rows[idx] = { ...rows[idx], [field]: value };
      // auto-calculate row total
      if (field === 'sellingUnits' || field === 'sellingPricePerUnit') {
        const units = parseFloat(field === 'sellingUnits' ? value : rows[idx].sellingUnits) || 0;
        const price = parseFloat(field === 'sellingPricePerUnit' ? value : rows[idx].sellingPricePerUnit) || 0;
        rows[idx].totalRevenue = units * price;
      }
      return rows;
    });
  };

  // ── Preview financials ──────────────────────────────────────────────────────
  const handlePreview = async () => {
    if (!selectedBook) return;
    const salesPayload = platformRows
      .filter((r) => r.platform && (parseFloat(r.sellingUnits) || 0) > 0)
      .map((r) => ({
        platform: r.platform,
        sellingUnits: parseFloat(r.sellingUnits) || 0,
        sellingPricePerUnit: parseFloat(r.sellingPricePerUnit) || 0,
      }));
    if (salesPayload.length === 0) {
      toast.error('Enter at least one platform with selling units');
      return;
    }
    try {
      setPreviewing(true);
      const res = await axiosInstance.post(API_ENDPOINTS.SELLING.PREVIEW, {
        bookId: selectedBook.bookId,
        platformSales: salesPayload,
        costPerBook: parseFloat(costPerBook) || 0,
        adsCostPerUnit: parseFloat(adsCostPerUnit) || 0,
        platformFees: parseFloat(platformFees) || 0,
        returnsExchangeAmount: parseFloat(returnsExchangeAmount) || 0,
        outstandingAmount: parseFloat(outstandingAmount) || 0,
      });
      if (res.data?.success) setPreviewFinancials(res.data.data.financials);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Preview failed');
    } finally {
      setPreviewing(false);
    }
  };

  // ── Submit selling data ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedBook) return;
    const salesPayload = platformRows
      .filter((r) => r.platform && (parseFloat(r.sellingUnits) || 0) > 0)
      .map((r) => ({
        platform: r.platform,
        sellingUnits: parseFloat(r.sellingUnits) || 0,
        sellingPricePerUnit: parseFloat(r.sellingPricePerUnit) || 0,
      }));
    if (salesPayload.length === 0) {
      toast.error('Enter at least one platform with selling units');
      return;
    }
    try {
      setSubmitting(true);
      const res = await axiosInstance.post(API_ENDPOINTS.SELLING.SUBMIT, {
        bookId: selectedBook.bookId,
        month,
        year,
        platformSales: salesPayload,
        costPerBook: parseFloat(costPerBook) || 0,
        adsCostPerUnit: parseFloat(adsCostPerUnit) || 0,
        platformFees: parseFloat(platformFees) || 0,
        returnsExchangeAmount: parseFloat(returnsExchangeAmount) || 0,
        outstandingAmount: parseFloat(outstandingAmount) || 0,
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Selling data submitted');
        loadAllRecords(1);
        // Reset form so same data isn't accidentally re-submitted
        setPlatformRows(
          (selectedBook.marketplaces.length > 0 ? selectedBook.marketplaces : ['Amazon']).map((p) => ({
            platform: p, sellingUnits: '', sellingPricePerUnit: '', totalRevenue: 0,
          }))
        );
        setCostPerBook('');
        setAdsCostPerUnit('');
        setPlatformFees('');
        setReturnsExchangeAmount('');
        setOutstandingAmount('');
        setPreviewFinancials(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalUnits = platformRows.reduce((s, r) => s + (parseFloat(r.sellingUnits) || 0), 0);
  const totalRevenue = platformRows.reduce((s, r) => s + r.totalRevenue, 0);

  // ─── Form View ─────────────────────────────────────────────────────────────
  if (view === 'form' && selectedBook) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setView('search')} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-200 text-neutral-600 dark:text-dark-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">Submit Selling Data</h1>
            <p className="text-body-sm text-neutral-500 dark:text-dark-500">All calculations are backend-only</p>
          </div>
        </div>

        {/* Book Info */}
        <div className="card p-5 flex items-center gap-4">
          {selectedBook.coverPage ? (
            <img src={selectedBook.coverPage} alt={selectedBook.bookName} className="w-12 h-16 object-cover rounded shadow-sm" />
          ) : (
            <div className="w-12 h-16 bg-neutral-100 dark:bg-dark-200 rounded flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-neutral-400" />
            </div>
          )}
          <div>
            <p className="font-semibold text-neutral-900 dark:text-dark-900">{selectedBook.bookName}</p>
            {selectedBook.subtitle && <p className="text-body-xs text-neutral-500 dark:text-dark-500">{selectedBook.subtitle}</p>}
            <p className="text-body-xs text-neutral-500 dark:text-dark-500 mt-0.5">
              {selectedBook.bookId} · {selectedBook.authorName} · Royalty: {selectedBook.royaltyPercentage}%
            </p>
          </div>
        </div>

        {/* Month / Year */}
        <div className="card p-5">
          <h3 className="text-h6 font-semibold text-neutral-900 dark:text-dark-900 mb-4">Reporting Period</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-body-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="input w-full"
              >
                {MONTHS.filter((m) => year < CURRENT_YEAR || m.value <= CURRENT_MONTH).map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-body-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">Year</label>
              <select
                value={year}
                onChange={(e) => {
                  const y = Number(e.target.value);
                  setYear(y);
                  if (y === CURRENT_YEAR && month > CURRENT_MONTH) setMonth(CURRENT_MONTH);
                }}
                className="input w-full"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Platform Sales */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h6 font-semibold text-neutral-900 dark:text-dark-900">Platform Sales</h3>
            <button onClick={addPlatformRow} className="inline-flex items-center gap-1.5 text-body-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">
              <Plus className="w-4 h-4" /> Add Platform
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="text-left text-body-xs text-neutral-500 dark:text-dark-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Platform</th>
                  <th className="pb-3 pr-4 text-right">Units</th>
                  <th className="pb-3 pr-4 text-right">Price / Unit (₹)</th>
                  <th className="pb-3 text-right">Auto Total (₹)</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-dark-300">
                {platformRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-4">
                      <input
                        type="text"
                        value={row.platform}
                        onChange={(e) => updateRow(idx, 'platform', e.target.value)}
                        placeholder="Platform name"
                        className="input w-full"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="number"
                        min="0"
                        value={row.sellingUnits}
                        onChange={(e) => updateRow(idx, 'sellingUnits', e.target.value)}
                        placeholder="0"
                        className="input w-full text-right"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="number"
                        min="0"
                        value={row.sellingPricePerUnit}
                        onChange={(e) => updateRow(idx, 'sellingPricePerUnit', e.target.value)}
                        placeholder="0"
                        className="input w-full text-right"
                      />
                    </td>
                    <td className="py-2 text-right font-medium text-neutral-900 dark:text-dark-900">
                      ₹{fmt(row.totalRevenue)}
                    </td>
                    <td className="py-2 pl-3">
                      {platformRows.length > 1 && (
                        <button onClick={() => removePlatformRow(idx)} className="text-neutral-400 hover:text-red-500 transition-colors">
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-200 dark:border-dark-300">
                  <td className="pt-3 font-semibold text-neutral-900 dark:text-dark-900">Total</td>
                  <td className="pt-3 text-right font-semibold text-neutral-900 dark:text-dark-900">{totalUnits.toLocaleString()}</td>
                  <td></td>
                  <td className="pt-3 text-right font-semibold text-neutral-900 dark:text-dark-900">₹{fmt(totalRevenue)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Expense Inputs */}
        <div className="card p-5">
          <h3 className="text-h6 font-semibold text-neutral-900 dark:text-dark-900 mb-4">Expenses & Costs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Cost Per Book (₹)', value: costPerBook, setter: setCostPerBook, help: 'Production cost per copy' },
              { label: 'Ads Cost Per Unit (₹)', value: adsCostPerUnit, setter: setAdsCostPerUnit, help: 'Advertising cost per unit sold' },
              { label: 'Platform Fees (₹)', value: platformFees, setter: setPlatformFees, help: 'Total platform fees' },
              { label: 'Returns & Exchange (₹)', value: returnsExchangeAmount, setter: setReturnsExchangeAmount, help: 'Total return / exchange cost' },
              { label: 'Outstanding Amount (₹)', value: outstandingAmount, setter: setOutstandingAmount, help: 'Optional prior month dues' },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-body-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
                  {field.label}
                  <span className="ml-1.5 text-body-xs text-neutral-400 font-normal">({field.help})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder="0"
                  className="input w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Financials Preview */}
        {previewFinancials && (
          <div className="card p-5">
            <h3 className="text-h6 font-semibold text-neutral-900 dark:text-dark-900 mb-4">Financial Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: `₹${fmt(previewFinancials.totalRevenue)}`, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Production Cost', value: `₹${fmt(previewFinancials.productionCost)}`, color: 'text-red-500' },
                { label: 'Gross Margin', value: `₹${fmt(previewFinancials.grossMargin)}`, color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Ads Cost', value: `₹${fmt(previewFinancials.adsCost)}`, color: 'text-red-500' },
                { label: 'Platform Fees', value: `₹${fmt(previewFinancials.platformFees)}`, color: 'text-red-500' },
                { label: 'Returns', value: `₹${fmt(previewFinancials.returnsExchangeAmount)}`, color: 'text-red-500' },
                { label: 'Net Profit', value: `₹${fmt(previewFinancials.netProfit)}`, color: 'text-primary-600 dark:text-primary-400' },
                { label: `Author Royalty (${previewFinancials.royaltyPercentage}%)`, value: `₹${fmt(previewFinancials.authorRoyalty)}`, color: 'text-emerald-600 dark:text-emerald-400' },
              ].map((item) => (
                <div key={item.label} className="bg-neutral-50 dark:bg-dark-200/50 rounded-lg p-3">
                  <p className="text-body-xs text-neutral-500 dark:text-dark-500 mb-0.5">{item.label}</p>
                  <p className={`font-semibold text-body-sm ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handlePreview}
            disabled={previewing}
            className="px-5 py-2.5 border border-neutral-300 dark:border-dark-400 text-neutral-700 dark:text-dark-700 rounded-lg text-body-sm font-medium hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            Preview Financials
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-body-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? 'Submitting…' : 'Submit Selling Data'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Search / Landing View ─────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">Selling Update</h1>
      </div>

      {/* Search Box */}
      <div className="card p-6">
        <h2 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900 mb-4">Select Published Book</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by book name, book ID, or author name…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); if (!e.target.value.trim()) searchBooks(''); }}
              onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
              className="input pl-9 w-full"
            />
          </div>
          <button
            onClick={() => searchBooks()}
            disabled={searching}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-body-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 divide-y divide-neutral-100 dark:divide-dark-300 border border-neutral-200 dark:border-dark-300 rounded-lg overflow-hidden">
            {searchResults.map((book) => (
              <div key={book.bookId} className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-dark-200/50 transition-colors">
                <div className="flex items-center gap-3">
                  {book.coverPage ? (
                    <img src={book.coverPage} alt={book.bookName} className="w-9 h-12 object-cover rounded shadow-sm" />
                  ) : (
                    <div className="w-9 h-12 bg-neutral-100 dark:bg-dark-200 rounded flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-neutral-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-dark-900">{book.bookName}</p>
                    <p className="text-body-xs text-neutral-500 dark:text-dark-500">
                      {book.bookId} · {book.authorName} · Royalty {book.royaltyPercentage}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => selectBook(book)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-body-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Enter Data
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && !searching && (
          <div className="mt-4 text-center py-8 text-neutral-500 dark:text-dark-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
            <p>{searchQuery ? `No published books found matching "${searchQuery}"` : 'No published books found.'}</p>
          </div>
        )}
      </div>

      {/* All Selling History */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-dark-300">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-neutral-500 dark:text-dark-500" />
            <h2 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900">All Selling History</h2>
          </div>
          <span className="text-body-xs text-neutral-500 dark:text-dark-500">
            {allRecordsTotal} record{allRecordsTotal !== 1 ? 's' : ''}
          </span>
        </div>

        {allRecordsLoading ? (
          <div className="flex justify-center py-10"><Loader size="lg" /></div>
        ) : allRecords.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-neutral-400">
            <AlertCircle className="w-8 h-8" />
            <p className="text-body-sm">No selling records yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-dark-200/50">
                    {['Book', 'Author', 'Period', 'Units Sold', 'Total Revenue', 'Net Profit', 'Author Royalty', 'Entered On'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-body-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-dark-300">
                  {allRecords.map((r) => (
                    <tr key={r.sellingRecordId} className="hover:bg-neutral-50/50 dark:hover:bg-dark-200/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-900 dark:text-dark-900 text-body-sm">{r.bookName}</p>
                        <p className="text-body-xs text-neutral-400">{r.bookId}</p>
                      </td>
                      <td className="px-4 py-3 text-body-sm text-neutral-700 dark:text-dark-700 whitespace-nowrap">{r.authorName}</td>
                      <td className="px-4 py-3 text-body-sm font-medium text-neutral-900 dark:text-dark-900 whitespace-nowrap">
                        {MONTH_NAMES[r.month - 1]} {r.year}
                      </td>
                      <td className="px-4 py-3 text-body-sm text-neutral-700 dark:text-dark-700 whitespace-nowrap">
                        {r.totalSellingUnits.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-body-sm text-neutral-700 dark:text-dark-700 whitespace-nowrap">
                        ₹{fmt(r.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 text-body-sm text-neutral-700 dark:text-dark-700 whitespace-nowrap">
                        ₹{fmt(r.netProfit)}
                      </td>
                      <td className="px-4 py-3 text-body-sm font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        ₹{fmt(r.authorRoyalty)}
                      </td>
                      <td className="px-4 py-3 text-body-xs text-neutral-500 dark:text-dark-500 whitespace-nowrap">
                        {new Date(r.updatedAt || r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {allRecordsTotal > ALL_RECORDS_LIMIT && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 dark:border-dark-300">
                <p className="text-body-xs text-neutral-500 dark:text-dark-500">
                  Showing {(allRecordsPage - 1) * ALL_RECORDS_LIMIT + 1}–{Math.min(allRecordsPage * ALL_RECORDS_LIMIT, allRecordsTotal)} of {allRecordsTotal}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadAllRecords(allRecordsPage - 1)}
                    disabled={allRecordsPage === 1}
                    className="px-3 py-1.5 text-body-xs border border-neutral-200 dark:border-dark-400 rounded-lg disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadAllRecords(allRecordsPage + 1)}
                    disabled={allRecordsPage * ALL_RECORDS_LIMIT >= allRecordsTotal}
                    className="px-3 py-1.5 text-body-xs border border-neutral-200 dark:border-dark-400 rounded-lg disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSelling;
