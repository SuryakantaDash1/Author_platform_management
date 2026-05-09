import React, { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import toast from 'react-hot-toast';
import {
  Search, Plus, MoreVertical, X, User, MapPin, Phone, Mail,
  Eye, Edit, Ban, Check, ChevronDown, BookOpen, TrendingUp, Calendar,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthorAddress {
  housePlot?: string; landmark?: string; pinCode?: string;
  division?: string; city?: string; district?: string; state?: string; country?: string;
}
interface AuthorUser { firstName: string; lastName: string; email: string; tier?: string; isActive?: boolean }
interface Author {
  _id?: string; authorId: string; userId: AuthorUser;
  publishedArticles?: any[]; address?: AuthorAddress;
  totalBooks: number; totalEarnings: number; totalSoldUnits: number;
  isRestricted: boolean; createdAt: string; mobile?: string;
}
interface AuthorDetail { author: Author; books: any[]; bankAccounts: any[]; recentTransactions: any[] }
interface PaginationInfo { currentPage: number; totalPages: number; totalItems: number; limit: number }
interface CreateAuthorForm {
  firstName: string; lastName: string; email: string; mobile: string;
  pinCode: string; division: string; city: string; district: string;
  state: string; country: string; housePlot: string; landmark: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initialCreateForm: CreateAuthorForm = {
  firstName: '', lastName: '', email: '', mobile: '',
  pinCode: '', division: '', city: '', district: '',
  state: '', country: '', housePlot: '', landmark: '',
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
  } catch { return '—'; }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

const LOCATION_OPTIONS = [
  { value: '', label: 'Select Location' }, { value: 'Delhi', label: 'Delhi' },
  { value: 'Mumbai', label: 'Mumbai' }, { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Chennai', label: 'Chennai' }, { value: 'Kolkata', label: 'Kolkata' },
  { value: 'Hyderabad', label: 'Hyderabad' }, { value: 'Pune', label: 'Pune' },
  { value: 'Ahmedabad', label: 'Ahmedabad' }, { value: 'Jaipur', label: 'Jaipur' },
  { value: 'Lucknow', label: 'Lucknow' },
];

// ─── Reusable form input style ────────────────────────────────────────────────

const inputCls = (err?: boolean, disabled?: boolean) =>
  `w-full px-3 py-2.5 text-sm border rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-colors ${
    err ? 'border-red-400' : 'border-neutral-300 dark:border-neutral-600'
  } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;

const readonlyCls = 'w-full px-3 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 cursor-not-allowed';

// ─── Primary lime button ──────────────────────────────────────────────────────

const LimeBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }> = ({ children, loading, className = '', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
  >
    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />}
    {children}
  </button>
);

// ─── Component ────────────────────────────────────────────────────────────────

const Authors: React.FC = () => {
  const [authors, setAuthors]       = useState<Author[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 20 });
  const [loading, setLoading]       = useState(false);

  const [searchTerm, setSearchTerm]       = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [earningsSort, setEarningsSort]   = useState<'highest' | 'lowest'>('highest');
  const [fromDate, setFromDate]           = useState('');
  const [toDate, setToDate]               = useState('');

  const [showCreateModal, setShowCreateModal]     = useState(false);
  const [editingAuthorId, setEditingAuthorId]     = useState<string | null>(null);
  const [showDetailPanel, setShowDetailPanel]     = useState(false);
  const [showArticlesPanel, setShowArticlesPanel] = useState(false);
  const [showRestrictDialog, setShowRestrictDialog] = useState(false);
  const [selectedAuthor, setSelectedAuthor]       = useState<Author | null>(null);
  const [authorDetail, setAuthorDetail]           = useState<AuthorDetail | null>(null);
  const [detailLoading, setDetailLoading]         = useState(false);

  const [createForm, setCreateForm]     = useState<CreateAuthorForm>(initialCreateForm);
  const [createLoading, setCreateLoading] = useState(false);
  const [pinLoading, setPinLoading]     = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [createApiError, setCreateApiError] = useState('');

  const [openMenuId, setOpenMenuId]   = useState<string | null>(null);
  const [restrictLoading, setRestrictLoading] = useState(false);
  const [restrictReason, setRestrictReason]   = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAuthors = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (searchTerm.trim())  params.search       = searchTerm.trim();
      if (locationFilter)     params.location     = locationFilter;
      if (earningsSort)       params.sortEarnings = earningsSort;
      if (fromDate)           params.fromDate     = fromDate;
      if (toDate)             params.toDate       = toDate;

      const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_ALL_AUTHORS, { params });
      if (res.data?.success) {
        setAuthors(res.data.data.authors || []);
        const p = res.data.data.pagination || {};
        setPagination({ currentPage: p.page || p.currentPage || page, totalPages: p.pages || p.totalPages || 1, totalItems: p.total || p.totalItems || 0, limit: p.limit || 20 });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to fetch authors');
      setAuthors([]);
    } finally { setLoading(false); }
  }, [searchTerm, locationFilter, earningsSort, fromDate, toDate]);

  useEffect(() => { fetchAuthors(1); }, [fetchAuthors]);

  // ── Detail ─────────────────────────────────────────────────────────────────

  const openDetail = async (author: Author) => {
    setSelectedAuthor(author); setShowDetailPanel(true); setDetailLoading(true);
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_AUTHOR_DETAILS(author.authorId));
      if (res.data?.success) setAuthorDetail(res.data.data);
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to load author details'); }
    finally { setDetailLoading(false); }
  };

  const closeDetail = () => { setShowDetailPanel(false); setSelectedAuthor(null); setAuthorDetail(null); };

  // ── Create / Edit ──────────────────────────────────────────────────────────

  const handleCreateFormChange = (field: keyof CreateAuthorForm, value: string) => {
    setCreateForm(p => ({ ...p, [field]: value }));
    if (createErrors[field]) setCreateErrors(p => { const n = { ...p }; delete n[field]; return n; });
    if (createApiError) setCreateApiError('');
    if (field === 'pinCode' && value.length === 6 && /^\d{6}$/.test(value)) lookupPinCode(value);
  };

  const lookupPinCode = async (pin: string) => {
    setPinLoading(true);
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.UTILITY.PINCODE_LOOKUP(pin));
      if (res.data?.success && res.data.data) {
        const { division, city, district, state, country } = res.data.data;
        setCreateForm(p => ({ ...p, division: division || '', city: city || '', district: district || '', state: state || '', country: country || '' }));
        toast.success('Address auto-filled from PIN code');
      }
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Could not look up PIN code'); }
    finally { setPinLoading(false); }
  };

  const validateCreateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!createForm.firstName.trim()) errs.firstName = 'First name is required';
    if (!createForm.lastName.trim())  errs.lastName  = 'Last name is required';
    if (!createForm.mobile.trim())    errs.mobile    = 'Phone number is required';
    else if (!/^\d{10}$/.test(createForm.mobile.trim())) errs.mobile = 'Phone number must be 10 digits';
    if (!createForm.email.trim())     errs.email     = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim())) errs.email = 'Enter a valid email address';
    if (createForm.pinCode && createForm.pinCode.length !== 6) errs.pinCode = 'PIN code must be 6 digits';
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setCreateApiError('');
    if (!validateCreateForm()) { toast.error('Please fill all required fields correctly'); return; }
    setCreateLoading(true);
    try {
      if (editingAuthorId) {
        await axiosInstance.put(`/admin/authors/${editingAuthorId}`, {
          address: { pinCode: createForm.pinCode, city: createForm.city, district: createForm.district, state: createForm.state, country: createForm.country, housePlot: createForm.housePlot, landmark: createForm.landmark },
        });
        toast.success('Author profile updated successfully');
      } else {
        const res = await axiosInstance.post(API_ENDPOINTS.ADMIN.CREATE_AUTHOR, createForm);
        if (res.data?.success) toast.success('Author account created. Credentials sent to email.');
      }
      setShowCreateModal(false); setEditingAuthorId(null);
      setCreateForm(initialCreateForm); setCreateErrors({}); setCreateApiError('');
      fetchAuthors(1);
    } catch (err: any) {
      const msg = err?.response?.data?.message || (editingAuthorId ? 'Failed to update author' : 'Failed to create author');
      setCreateApiError(msg); toast.error(msg);
    } finally { setCreateLoading(false); }
  };

  // ── Restrict ───────────────────────────────────────────────────────────────

  const openRestrictDialog = (author: Author) => {
    setSelectedAuthor(author); setRestrictReason(''); setShowRestrictDialog(true); setOpenMenuId(null);
  };

  const handleRestrictConfirm = async () => {
    if (!selectedAuthor) return;
    setRestrictLoading(true);
    try {
      const newRestricted = !selectedAuthor.isRestricted;
      await axiosInstance.put(API_ENDPOINTS.ADMIN.RESTRICT_AUTHOR(selectedAuthor.authorId), { isRestricted: newRestricted, reason: restrictReason || undefined });
      toast.success(newRestricted ? 'Author has been restricted' : 'Author has been unrestricted');
      setShowRestrictDialog(false); setSelectedAuthor(null);
      fetchAuthors(pagination.currentPage);
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to update restriction status'); }
    finally { setRestrictLoading(false); }
  };

  // ── Menu ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Render: Filter Bar ─────────────────────────────────────────────────────

  const renderFilterBar = () => (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-end">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wide">
            Author Name / ID
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchAuthors(1)}
              placeholder="Search author..."
              className={`${inputCls()} pl-9`}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wide">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
              className={`${inputCls()} pl-9 pr-8 appearance-none`}>
              {LOCATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Earnings Sort */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wide">
            Earnings
          </label>
          <button onClick={() => setEarningsSort(p => p === 'highest' ? 'lowest' : 'highest')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-lime-400/30 transition-colors">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neutral-400" />
              {earningsSort === 'highest' ? 'Highest First' : 'Lowest First'}
            </span>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${earningsSort === 'lowest' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* From Date */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wide">
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={`${inputCls()} pl-9`} />
          </div>
        </div>

        {/* To Date */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wide">
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={`${inputCls()} pl-9`} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <LimeBtn className="flex-1" onClick={() => fetchAuthors(1)}>
            <Search className="w-4 h-4" /> Search
          </LimeBtn>
          <LimeBtn className="flex-1" onClick={() => { setEditingAuthorId(null); setCreateForm(initialCreateForm); setShowCreateModal(true); }}>
            <Plus className="w-4 h-4" /> Author
          </LimeBtn>
        </div>
      </div>
    </div>
  );

  // ── Render: Table ──────────────────────────────────────────────────────────

  const renderTable = () => {
    if (loading) return (
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-neutral-200 dark:border-neutral-700 border-t-lime-500 rounded-full animate-spin" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading authors...</p>
        </div>
      </div>
    );

    if (authors.length === 0) return (
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-12">
        <div className="flex flex-col items-center gap-3 text-neutral-400 dark:text-neutral-500">
          <User className="w-12 h-12 opacity-40" />
          <p className="text-sm">No authors found</p>
          <button onClick={() => setShowCreateModal(true)} className="text-sm font-semibold hover:underline" style={{ color: LIME_DARK }}>
            + Create a new author
          </button>
        </div>
      </div>
    );

    return (
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-700/30">
                {['No','Author ID','Author Name','Location','Book Unit','Enroll Date','Net Earnings','Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {authors.map((author, index) => {
                const rowNumber = (pagination.currentPage - 1) * pagination.limit + index + 1;
                const userObj   = (author as any).user || (author as any).userId || {};
                const fullName  = `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim();
                const location  = [author.address?.city, author.address?.state].filter(Boolean).join(', ') || 'Not updated';

                return (
                  <tr key={author.authorId} className="border-b border-neutral-50 dark:border-neutral-700/60 hover:bg-neutral-50/70 dark:hover:bg-neutral-700/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-neutral-500 dark:text-neutral-400">{rowNumber}</td>

                    <td className="px-5 py-3.5">
                      <button onClick={() => openDetail(author)}
                        className="text-sm font-semibold font-mono transition-colors hover:underline"
                        style={{ color: LIME_DARK }}>
                        {author.authorId}
                      </button>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(132,204,22,0.12)' }}>
                          <User className="w-4 h-4" style={{ color: LIME_DARK }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{fullName || '—'}</p>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500">{userObj.email || ''}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{location}</td>
                    <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">{author.totalSoldUnits || 0}</td>
                    <td className="px-5 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{formatDate(author.createdAt)}</td>

                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold" style={{ color: author.totalEarnings > 0 ? LIME_DARK : undefined }}>
                        {formatCurrency(author.totalEarnings || 0)}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="relative" ref={openMenuId === author.authorId ? menuRef : undefined}>
                        <button onClick={() => setOpenMenuId(p => p === author.authorId ? null : author.authorId)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === author.authorId && (
                          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                            <button onClick={() => { openDetail(author); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                              <Eye className="w-4 h-4" /> View
                            </button>
                            <button onClick={() => { openDetail(author); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => openRestrictDialog(author)}
                              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                                author.isRestricted
                                  ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                  : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              }`}>
                              {author.isRestricted ? <><Check className="w-4 h-4" /> Unrestrict</> : <><Ban className="w-4 h-4" /> Restrict</>}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-700/20">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Showing <span className="font-semibold text-neutral-700 dark:text-neutral-300">{(pagination.currentPage - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}</span> of{' '}
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{pagination.totalItems}</span> authors
          </p>
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={p => fetchAuthors(p)} />
        </div>
      </div>
    );
  };

  // ── Render: Create Modal ───────────────────────────────────────────────────

  const renderCreateModal = () => (
    <Modal isOpen={showCreateModal}
      onClose={() => { setShowCreateModal(false); setEditingAuthorId(null); setCreateForm(initialCreateForm); setCreateErrors({}); setCreateApiError(''); }}
      title={editingAuthorId ? 'Update Author Profile' : 'Create Author Account'}
      size="xl"
    >
      <form onSubmit={handleCreateSubmit} className="space-y-5">
        {createApiError && (
          <div className="p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{createApiError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">First Name <span className="text-red-500">*</span></label>
            <input type="text" value={createForm.firstName} onChange={e => handleCreateFormChange('firstName', e.target.value)}
              placeholder="Enter first name" disabled={!!editingAuthorId} className={inputCls(!!createErrors.firstName, !!editingAuthorId)} />
            {createErrors.firstName && <p className="text-red-500 text-xs mt-1">{createErrors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Last Name <span className="text-red-500">*</span></label>
            <input type="text" value={createForm.lastName} onChange={e => handleCreateFormChange('lastName', e.target.value)}
              placeholder="Enter last name" className={inputCls(!!createErrors.lastName)} />
            {createErrors.lastName && <p className="text-red-500 text-xs mt-1">{createErrors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Phone No <span className="text-red-500">*</span></label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input type="tel" value={createForm.mobile}
                onChange={e => handleCreateFormChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit phone number" className={`${inputCls(!!createErrors.mobile)} pl-9`} />
            </div>
            {createErrors.mobile && <p className="text-red-500 text-xs mt-1">{createErrors.mobile}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Email ID <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input type="email" value={createForm.email} onChange={e => handleCreateFormChange('email', e.target.value)}
                placeholder="Enter email address" className={`${inputCls(!!createErrors.email)} pl-9`} />
            </div>
            {createErrors.email && <p className="text-red-500 text-xs mt-1">{createErrors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">PIN Code</label>
            <div className="relative">
              <input type="text" value={createForm.pinCode}
                onChange={e => handleCreateFormChange('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit PIN code" maxLength={6} className={inputCls(!!createErrors.pinCode)} />
              {pinLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-neutral-300 border-t-lime-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
            {createErrors.pinCode && <p className="text-red-500 text-xs mt-1">{createErrors.pinCode}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Division</label>
            <input type="text" value={createForm.division} readOnly placeholder="Auto-filled from PIN" className={readonlyCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">City</label>
            <input type="text" value={createForm.city} readOnly placeholder="Auto-filled from PIN" className={readonlyCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">District</label>
            <input type="text" value={createForm.district} readOnly placeholder="Auto-filled from PIN" className={readonlyCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">State</label>
            <input type="text" value={createForm.state} readOnly placeholder="Auto-filled from PIN" className={readonlyCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Country</label>
            <input type="text" value={createForm.country} readOnly placeholder="Auto-filled from PIN" className={readonlyCls} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">House / Plot & Landmark</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={createForm.housePlot} onChange={e => handleCreateFormChange('housePlot', e.target.value)}
              placeholder="House / Plot No" className={inputCls()} />
            <input type="text" value={createForm.landmark} onChange={e => handleCreateFormChange('landmark', e.target.value)}
              placeholder="Landmark" className={inputCls()} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-700">
          <button type="button"
            onClick={() => { setShowCreateModal(false); setCreateForm(initialCreateForm); }}
            className="px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-colors">
            Cancel
          </button>
          <LimeBtn type="submit" loading={createLoading}>
            {editingAuthorId ? 'Update' : 'Create Author'}
          </LimeBtn>
        </div>
      </form>
    </Modal>
  );

  // ── Render: Detail Panel ───────────────────────────────────────────────────

  const renderDetailPanel = () => {
    if (!showDetailPanel) return null;
    const detail = authorDetail;
    const author = detail?.author || selectedAuthor;
    if (!author) return null;

    const uObj = (author as any).user || (author as any).userId || {};
    const fullName = `${uObj.firstName || ''} ${uObj.lastName || ''}`.trim();
    const addressParts = [author.address?.housePlot, author.address?.landmark, author.address?.city, author.address?.district, author.address?.state, author.address?.pinCode, author.address?.country].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '—';

    return (
      <>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={closeDetail} />
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-neutral-900 shadow-2xl overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Author Details</h2>
            <button onClick={closeDetail}
              className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {detailLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-neutral-200 dark:border-neutral-700 border-t-lime-500 rounded-full animate-spin" />
              <p className="text-sm text-neutral-400">Loading details...</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
                  style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}>
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{fullName || '—'}</h3>
                      <p className="text-sm font-mono font-semibold mt-0.5" style={{ color: LIME_DARK }}>{author.authorId}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">Net Royalty</p>
                      <p className="text-lg font-bold mt-0.5" style={{ color: LIME_DARK }}>
                        {formatCurrency(author.totalEarnings || 0)}
                      </p>
                    </div>
                  </div>
                  {author.isRestricted && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full border border-red-200 dark:border-red-800/40">
                      <Ban className="w-3 h-3" /> Restricted
                    </span>
                  )}
                </div>
              </div>

              {/* Published Books (expandable) */}
              {(() => {
                const publishedBooks = (authorDetail?.books || []).filter((b: any) => b.status === 'published');
                if (publishedBooks.length === 0) return null;
                return (
                  <div className="rounded-xl overflow-hidden border border-lime-200 dark:border-lime-800/40">
                    <button type="button" onClick={() => setShowArticlesPanel(p => !p)}
                      className="flex items-center justify-between gap-3 p-3.5 w-full text-left transition-colors"
                      style={{ background: 'rgba(132,204,22,0.08)' }}>
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: LIME_DARK }} />
                        <div>
                          <p className="text-xs text-neutral-500">Published Books</p>
                          <p className="text-sm font-semibold" style={{ color: LIME_DARK }}>
                            {publishedBooks.length} {publishedBooks.length === 1 ? 'book' : 'books'} published
                          </p>
                        </div>
                      </div>
                      <span className="text-xs" style={{ color: LIME_DARK }}>{showArticlesPanel ? '▲' : '▼'}</span>
                    </button>
                    {showArticlesPanel && (
                      <div className="p-3 space-y-2 bg-white dark:bg-neutral-900">
                        {publishedBooks.map((book: any) => (
                          <div key={book.bookId} className="flex gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                            <div className="w-12 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(132,204,22,0.10)' }}>
                              <BookOpen className="w-5 h-5" style={{ color: LIME_DARK }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{book.bookName}</p>
                              <p className="text-xs text-neutral-400">{book.bookId}</p>
                              {book.platformWiseSales && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Object.entries(book.platformWiseSales as Record<string, any>)
                                    .filter(([, v]) => v?.productLink)
                                    .map(([platform, v]: [string, any]) => {
                                      const href = !/^https?:\/\//i.test(v.productLink) ? `https://${v.productLink}` : v.productLink;
                                      return (
                                        <a key={platform} href={href} target="_blank" rel="noopener noreferrer"
                                          className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md transition-colors"
                                          style={{ color: LIME_DARK, background: 'rgba(132,204,22,0.12)' }}>
                                          {platform} ↗
                                        </a>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Info rows */}
              <div className="space-y-2">
                {[
                  { icon: MapPin, label: 'Address', value: fullAddress },
                  { icon: Phone, label: 'Phone', value: author.mobile || (author as any).user?.mobile || '—' },
                  { icon: Mail, label: 'Email', value: uObj.email || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: LIME_DARK }} />
                    <div>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">{label}</p>
                      <p className="text-sm text-neutral-800 dark:text-neutral-100 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Books', value: authorDetail?.books?.length ?? author.totalBooks ?? 0 },
                  { label: 'Ongoing Books', value: (authorDetail?.books || []).filter((b: any) => !['pending','published','rejected'].includes(b.status)).length },
                  {
                    label: 'Last Month Revenue',
                    value: (() => {
                      const pm = new Date(); pm.setMonth(pm.getMonth() - 1);
                      return formatCurrency((authorDetail?.recentTransactions || [])
                        .filter((t: any) => { const d = new Date(t.createdAt); return t.type === 'royalty_payment' && d.getMonth() === pm.getMonth() && d.getFullYear() === pm.getFullYear(); })
                        .reduce((s: number, t: any) => s + (t.amount || 0), 0));
                    })(),
                  },
                  {
                    label: 'Author Royalty',
                    value: (() => {
                      const pcts = (authorDetail?.books || []).map((b: any) => b.royaltyPercentage).filter((v: any) => typeof v === 'number');
                      if (pcts.length === 0) return '—';
                      const mn = Math.min(...pcts); const mx = Math.max(...pcts);
                      return mn === mx ? `${mn}%` : `${mn}–${mx}%`;
                    })(),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-4 text-center border border-neutral-100 dark:border-neutral-700"
                    style={{ background: 'rgba(132,204,22,0.07)' }}>
                    <p className="text-2xl font-extrabold" style={{ color: LIME_DARK }}>{value}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Books list */}
              <div>
                <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">Books by this author</h4>
                {(authorDetail?.books || []).length === 0 ? (
                  <div className="rounded-xl p-6 text-center border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                    <BookOpen className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">No books yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(authorDetail!.books as any[]).map((book: any) => {
                      const statusMap: Record<string, string> = {
                        published: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                        ongoing: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                        pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                        rejected: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                      };
                      return (
                        <div key={book._id} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-2.5 border border-neutral-100 dark:border-neutral-700">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{book.bookName || book.title || 'Untitled'}</p>
                            <p className="text-xs text-neutral-400">{book.bookId || book._id?.toString().slice(-6).toUpperCase()}</p>
                          </div>
                          <span className={`ml-2 shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusMap[book.status] || 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'}`}>
                            {book.status || 'unknown'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Update Profile */}
              <LimeBtn className="w-full"
                onClick={() => {
                  if (!selectedAuthor) return;
                  const a = selectedAuthor; const u = (a as any).user || (a as any).userId || {};
                  setCreateForm({ firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', mobile: u.mobile || '', pinCode: a.address?.pinCode || '', division: a.address?.district || '', city: a.address?.city || '', district: a.address?.district || '', state: a.address?.state || '', country: a.address?.country || '', housePlot: a.address?.housePlot || '', landmark: a.address?.landmark || '' });
                  setEditingAuthorId(a.authorId); setShowCreateModal(true); setShowDetailPanel(false);
                }}>
                <Edit className="w-4 h-4" /> Update Profile
              </LimeBtn>
            </div>
          )}
        </div>
      </>
    );
  };

  // ── Render: Restrict Dialog ────────────────────────────────────────────────

  const renderRestrictDialog = () => {
    if (!showRestrictDialog || !selectedAuthor) return null;
    const isRestricted = selectedAuthor.isRestricted;
    const uObj = (selectedAuthor as any).user || (selectedAuthor as any).userId || {};
    const fullName = `${uObj.firstName || ''} ${uObj.lastName || ''}`.trim();

    return (
      <Modal isOpen={showRestrictDialog}
        onClose={() => { setShowRestrictDialog(false); setSelectedAuthor(null); }}
        title={`${isRestricted ? 'Unrestrict' : 'Restrict'} Author`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(132,204,22,0.12)' }}>
              <User className="w-5 h-5" style={{ color: LIME_DARK }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{fullName || selectedAuthor.authorId}</p>
              <p className="text-xs text-neutral-400 font-mono">{selectedAuthor.authorId}</p>
            </div>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {isRestricted
              ? 'Are you sure you want to unrestrict this author? They will regain full access to the platform.'
              : 'Are you sure you want to restrict this author? They will lose access to publish and manage books.'}
          </p>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Reason <span className="text-neutral-400 text-xs font-normal">(optional)</span>
            </label>
            <textarea value={restrictReason} onChange={e => setRestrictReason(e.target.value)}
              placeholder={`Reason for ${isRestricted ? 'unrestricting' : 'restricting'}...`}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 resize-none transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button onClick={() => { setShowRestrictDialog(false); setSelectedAuthor(null); }}
              className="px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-colors">
              Cancel
            </button>
            <button onClick={handleRestrictConfirm} disabled={restrictLoading}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                isRestricted
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}>
              {restrictLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isRestricted ? <><Check className="w-4 h-4" /> Unrestrict</> : <><Ban className="w-4 h-4" /> Restrict</>}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // ── Main Render ────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">Manage Authors</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">View, create, and manage author accounts on the platform</p>
      </div>
      {renderFilterBar()}
      {renderTable()}
      {renderCreateModal()}
      {renderDetailPanel()}
      {renderRestrictDialog()}
    </div>
  );
};

export default Authors;
