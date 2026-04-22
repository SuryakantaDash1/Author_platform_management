import React, { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  MoreVertical,
  X,
  User,
  MapPin,
  Phone,
  Mail,
  Eye,
  Edit,
  Ban,
  Check,
  ChevronDown,
  BookOpen,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthorAddress {
  housePlot?: string;
  landmark?: string;
  pinCode?: string;
  division?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
}

interface AuthorUser {
  firstName: string;
  lastName: string;
  email: string;
  tier?: string;
  isActive?: boolean;
}

interface Author {
  _id?: string;
  authorId: string;
  userId: AuthorUser;
  publishedArticles?: any[];
  address?: AuthorAddress;
  totalBooks: number;
  totalEarnings: number;
  totalSoldUnits: number;
  isRestricted: boolean;
  createdAt: string;
  mobile?: string;
}

interface AuthorDetail {
  author: Author;
  books: any[];
  bankAccounts: any[];
  recentTransactions: any[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

interface CreateAuthorForm {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  pinCode: string;
  division: string;
  city: string;
  district: string;
  state: string;
  country: string;
  housePlot: string;
  landmark: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const initialCreateForm: CreateAuthorForm = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  pinCode: '',
  division: '',
  city: '',
  district: '',
  state: '',
  country: '',
  housePlot: '',
  landmark: '',
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return '—';
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

const LOCATION_OPTIONS = [
  { value: '', label: 'Select Location' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Kolkata', label: 'Kolkata' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Ahmedabad', label: 'Ahmedabad' },
  { value: 'Jaipur', label: 'Jaipur' },
  { value: 'Lucknow', label: 'Lucknow' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Authors: React.FC = () => {
  // ---- Listing state ----
  const [authors, setAuthors] = useState<Author[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });
  const [loading, setLoading] = useState(false);

  // ---- Filter state ----
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [earningsSort, setEarningsSort] = useState<'highest' | 'lowest'>('highest');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ---- View state ----
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showArticlesPanel, setShowArticlesPanel] = useState(false);
  const [showRestrictDialog, setShowRestrictDialog] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [authorDetail, setAuthorDetail] = useState<AuthorDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ---- Create form state ----
  const [createForm, setCreateForm] = useState<CreateAuthorForm>(initialCreateForm);
  const [createLoading, setCreateLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  // ---- Actions menu state ----
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ---- Restrict state ----
  const [restrictLoading, setRestrictLoading] = useState(false);
  const [restrictReason, setRestrictReason] = useState('');

  // =========================================================================
  // Data Fetching
  // =========================================================================

  const fetchAuthors = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          limit: 20,
        };

        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (locationFilter) params.location = locationFilter;
        if (earningsSort) params.sortEarnings = earningsSort;
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;

        const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_ALL_AUTHORS, { params });

        if (response.data?.success) {
          setAuthors(response.data.data.authors || []);
          const p = response.data.data.pagination || {};
          setPagination({
            currentPage: p.page || p.currentPage || page,
            totalPages: p.pages || p.totalPages || 1,
            totalItems: p.total || p.totalItems || 0,
            limit: p.limit || 20,
          });
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to fetch authors');
        setAuthors([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, locationFilter, earningsSort, fromDate, toDate]
  );

  useEffect(() => {
    fetchAuthors(1);
  }, [fetchAuthors]);

  const handleSearch = () => {
    fetchAuthors(1);
  };

  const handlePageChange = (page: number) => {
    fetchAuthors(page);
  };

  // =========================================================================
  // Author Detail
  // =========================================================================

  const openDetail = async (author: Author) => {
    setSelectedAuthor(author);
    setShowDetailPanel(true);
    setDetailLoading(true);

    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.GET_AUTHOR_DETAILS(author.authorId)
      );
      if (response.data?.success) {
        setAuthorDetail(response.data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load author details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setShowDetailPanel(false);
    setSelectedAuthor(null);
    setAuthorDetail(null);
  };

  // =========================================================================
  // Create Author
  // =========================================================================

  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [createApiError, setCreateApiError] = useState('');

  const handleCreateFormChange = (field: keyof CreateAuthorForm, value: string) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (createErrors[field]) {
      setCreateErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
    if (createApiError) setCreateApiError('');

    // Auto-fill on 6-digit PIN
    if (field === 'pinCode' && value.length === 6 && /^\d{6}$/.test(value)) {
      lookupPinCode(value);
    }
  };

  const lookupPinCode = async (pin: string) => {
    setPinLoading(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.UTILITY.PINCODE_LOOKUP(pin));
      if (response.data?.success && response.data.data) {
        const { division, city, district, state, country } = response.data.data;
        setCreateForm((prev) => ({
          ...prev,
          division: division || '',
          city: city || '',
          district: district || '',
          state: state || '',
          country: country || '',
        }));
        toast.success('Address auto-filled from PIN code');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Could not look up PIN code');
    } finally {
      setPinLoading(false);
    }
  };

  const validateCreateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!createForm.firstName.trim()) errs.firstName = 'First name is required';
    if (!createForm.lastName.trim()) errs.lastName = 'Last name is required';
    if (!createForm.mobile.trim()) {
      errs.mobile = 'Phone number is required';
    } else if (!/^\d{10}$/.test(createForm.mobile.trim())) {
      errs.mobile = 'Phone number must be 10 digits';
    }
    if (!createForm.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (createForm.pinCode && createForm.pinCode.length !== 6) {
      errs.pinCode = 'PIN code must be 6 digits';
    }

    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateApiError('');

    if (!validateCreateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setCreateLoading(true);
    try {
      if (editingAuthorId) {
        // Update existing author profile
        const payload = {
          address: {
            pinCode: createForm.pinCode,
            city: createForm.city,
            district: createForm.district,
            state: createForm.state,
            country: createForm.country,
            housePlot: createForm.housePlot,
            landmark: createForm.landmark,
          },
        };
        await axiosInstance.put(`/admin/authors/${editingAuthorId}`, payload);
        toast.success('Author profile updated successfully');
      } else {
        const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.CREATE_AUTHOR, createForm);
        if (response.data?.success) {
          toast.success('Author account created successfully. Credentials sent to email.');
        }
      }
      setShowCreateModal(false);
      setEditingAuthorId(null);
      setCreateForm(initialCreateForm);
      setCreateErrors({});
      setCreateApiError('');
      fetchAuthors(1);
    } catch (error: any) {
      const msg = error?.response?.data?.message || (editingAuthorId ? 'Failed to update author' : 'Failed to create author');
      setCreateApiError(msg);
      toast.error(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  // =========================================================================
  // Restrict / Unrestrict
  // =========================================================================

  const openRestrictDialog = (author: Author) => {
    setSelectedAuthor(author);
    setRestrictReason('');
    setShowRestrictDialog(true);
    setOpenMenuId(null);
  };

  const handleRestrictConfirm = async () => {
    if (!selectedAuthor) return;

    setRestrictLoading(true);
    try {
      const newRestricted = !selectedAuthor.isRestricted;
      await axiosInstance.put(
        API_ENDPOINTS.ADMIN.RESTRICT_AUTHOR(selectedAuthor.authorId),
        {
          isRestricted: newRestricted,
          reason: restrictReason || undefined,
        }
      );
      toast.success(
        newRestricted ? 'Author has been restricted' : 'Author has been unrestricted'
      );
      setShowRestrictDialog(false);
      setSelectedAuthor(null);
      fetchAuthors(pagination.currentPage);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update restriction status');
    } finally {
      setRestrictLoading(false);
    }
  };

  // =========================================================================
  // Actions Menu
  // =========================================================================

  const toggleMenu = (authorId: string) => {
    setOpenMenuId((prev) => (prev === authorId ? null : authorId));
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // =========================================================================
  // Render: Filter Bar
  // =========================================================================

  const renderFilterBar = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-end">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Author Name / ID
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search author..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none transition-colors"
            >
              {LOCATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Earnings Sort */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Earnings
          </label>
          <button
            onClick={() =>
              setEarningsSort((prev) => (prev === 'highest' ? 'lowest' : 'highest'))
            }
            className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              {earningsSort === 'highest' ? 'Highest First' : 'Lowest First'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                earningsSort === 'lowest' ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* From Date */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* To Date */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
            onClick={() => { setEditingAuthorId(null); setCreateForm(initialCreateForm); setShowCreateModal(true); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <Plus className="w-4 h-4" />
            Author
          </button>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // Render: Authors Table
  // =========================================================================

  const renderTable = () => {
    if (loading) {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading authors...</p>
          </div>
        </div>
      );
    }

    if (authors.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
            <User className="w-12 h-12 opacity-40" />
            <p className="text-sm">No authors found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              + Create a new author
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['No', 'Author ID', 'Author Name', 'Location', 'Book Unit', 'Enroll Date', 'Net Earnings', 'Actions'].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {authors.map((author, index) => {
                const rowNumber =
                  (pagination.currentPage - 1) * pagination.limit + index + 1;
                const userObj = (author as any).user || (author as any).userId || {};
                const fullName = `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim();
                const location = [author.address?.city, author.address?.state].filter(Boolean).join(', ') || 'Not updated';

                return (
                  <tr
                    key={author.authorId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* No */}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {rowNumber}
                    </td>

                    {/* Author ID - clickable */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => openDetail(author)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline focus:outline-none transition-colors"
                      >
                        {author.authorId}
                      </button>
                    </td>

                    {/* Author Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {fullName || '—'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {userObj.email || ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {location}
                    </td>

                    {/* Book Unit */}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {author.totalSoldUnits || 0}
                    </td>

                    {/* Enroll Date */}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(author.createdAt)}
                    </td>

                    {/* Net Earnings */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                        {formatCurrency(author.totalEarnings || 0)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="relative" ref={openMenuId === author.authorId ? menuRef : undefined}>
                        <button
                          onClick={() => toggleMenu(author.authorId)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === author.authorId && (
                          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1">
                            <button
                              onClick={() => {
                                openDetail(author);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => {
                                openDetail(author);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => openRestrictDialog(author)}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                                author.isRestricted
                                  ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                  : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              }`}
                            >
                              {author.isRestricted ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Unrestrict
                                </>
                              ) : (
                                <>
                                  <Ban className="w-4 h-4" />
                                  Restrict
                                </>
                              )}
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

        {/* Pagination & Summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {(pagination.currentPage - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {pagination.totalItems}
            </span>{' '}
            authors
          </p>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    );
  };

  // =========================================================================
  // Render: Create Author Modal
  // =========================================================================

  const renderCreateModal = () => (
    <Modal
      isOpen={showCreateModal}
      onClose={() => {
        setShowCreateModal(false);
        setEditingAuthorId(null);
        setCreateForm(initialCreateForm);
        setCreateErrors({});
        setCreateApiError('');
      }}
      title={editingAuthorId ? "Update Author Profile" : "Create Author Account"}
      size="xl"
    >
      <form onSubmit={handleCreateSubmit} className="space-y-5">
        {/* API Error Banner */}
        {createApiError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">{createApiError}</p>
          </div>
        )}

        {/* Row: First Name & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={createForm.firstName}
              onChange={(e) => handleCreateFormChange('firstName', e.target.value)}
              placeholder="Enter first name"
              disabled={!!editingAuthorId}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${editingAuthorId ? 'opacity-60 cursor-not-allowed' : ''} ${createErrors.firstName ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {createErrors.firstName && <p className="text-red-500 text-xs mt-1">{createErrors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={createForm.lastName}
              onChange={(e) => handleCreateFormChange('lastName', e.target.value)}
              placeholder="Enter last name"
              className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${createErrors.lastName ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {createErrors.lastName && <p className="text-red-500 text-xs mt-1">{createErrors.lastName}</p>}
          </div>
        </div>

        {/* Row: Phone No & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone No <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={createForm.mobile}
                onChange={(e) => handleCreateFormChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit phone number"
                className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${createErrors.mobile ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              />
            </div>
            {createErrors.mobile && <p className="text-red-500 text-xs mt-1">{createErrors.mobile}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => handleCreateFormChange('email', e.target.value)}
                placeholder="Enter email address"
                className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${createErrors.email ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              />
            </div>
            {createErrors.email && <p className="text-red-500 text-xs mt-1">{createErrors.email}</p>}
          </div>
        </div>

        {/* Row: PIN Code & Division */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter PIN Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={createForm.pinCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  handleCreateFormChange('pinCode', val);
                }}
                placeholder="6-digit PIN code"
                maxLength={6}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${createErrors.pinCode ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {pinLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
            {createErrors.pinCode && <p className="text-red-500 text-xs mt-1">{createErrors.pinCode}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Division
            </label>
            <input
              type="text"
              value={createForm.division}
              readOnly
              placeholder="Auto-filled from PIN"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Row: City & District */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <input
              type="text"
              value={createForm.city}
              readOnly
              placeholder="Auto-filled from PIN"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              District
            </label>
            <input
              type="text"
              value={createForm.district}
              readOnly
              placeholder="Auto-filled from PIN"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Row: State & Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State
            </label>
            <input
              type="text"
              value={createForm.state}
              readOnly
              placeholder="Auto-filled from PIN"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <input
              type="text"
              value={createForm.country}
              readOnly
              placeholder="Auto-filled from PIN"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Full-width: House/Plot & Landmark */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            House / Plot No and Land Mark
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={createForm.housePlot}
              onChange={(e) => handleCreateFormChange('housePlot', e.target.value)}
              placeholder="House / Plot No"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
            <input
              type="text"
              value={createForm.landmark}
              onChange={(e) => handleCreateFormChange('landmark', e.target.value)}
              placeholder="Landmark"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => {
              setShowCreateModal(false);
              setCreateForm(initialCreateForm);
            }}
            className="mr-3 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createLoading}
            className="px-8 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center gap-2"
          >
            {createLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );

  // =========================================================================
  // Render: Author Detail Panel (Slide-Over)
  // =========================================================================

  const renderDetailPanel = () => {
    if (!showDetailPanel) return null;

    const detail = authorDetail;
    const author = detail?.author || selectedAuthor;
    if (!author) return null;

    const fullName = `${((author as any).user || (author as any).userId || {}).firstName || ''} ${((author as any).user || (author as any).userId || {}).lastName || ''}`.trim();
    const addressParts = [
      author.address?.housePlot,
      author.address?.landmark,
      author.address?.city,
      author.address?.district,
      author.address?.state,
      author.address?.pinCode,
      author.address?.country,
    ].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '—';

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeDetail}
        />

        {/* Panel */}
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto transform transition-transform duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Author Details
            </h2>
            <button
              onClick={closeDetail}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {detailLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading details...</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {fullName || '—'}
                      </h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-mono">
                        {author.authorId}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                        Net Royalty Earning
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(author.totalEarnings || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Restriction Badge */}
                  {author.isRestricted && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                      <Ban className="w-3 h-3" />
                      Restricted
                    </span>
                  )}
                </div>
              </div>

              {/* Info Cards */}
              <div className="space-y-3">
                {/* Published Books — from actual Book collection via authorDetail */}
                {(() => {
                  const publishedBooks = (authorDetail?.books || []).filter((b: any) => b.status === 'published');
                  if (publishedBooks.length === 0) return null;
                  return (
                    <div className="rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800">
                      <button type="button" onClick={() => setShowArticlesPanel(prev => !prev)}
                        className="flex items-center justify-between gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 w-full text-left hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Published Books</p>
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                              {publishedBooks.length} {publishedBooks.length === 1 ? 'book' : 'books'} published
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-500">{showArticlesPanel ? '▲' : '▼'}</span>
                      </button>
                      {showArticlesPanel && (
                        <div className="p-3 space-y-2 bg-white dark:bg-gray-900">
                          {publishedBooks.map((book: any) => (
                            <div key={book.bookId} className="flex gap-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <div className="w-12 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-indigo-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{book.bookName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{book.bookId}</p>
                                {/* Product links from platformWiseSales */}
                                {book.platformWiseSales && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries(book.platformWiseSales as Record<string, any>)
                                      .filter(([, v]) => v?.productLink)
                                      .map(([platform, v]: [string, any]) => {
                                        const href = !/^https?:\/\//i.test(v.productLink)
                                          ? `https://${v.productLink}`
                                          : v.productLink;
                                        return (
                                          <a key={platform} href={href} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
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

                {/* Address */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <MapPin className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{fullAddress}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Phone className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {author.mobile || (author as any).user?.mobile || '—'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Mail className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {((author as any).user || (author as any).userId || {}).email || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Book Button */}
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                title="Coming soon in Phase 2"
              >
                <Plus className="w-4 h-4" />
                Add Book
              </button>

              {/* Books List */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Books written by this author
                </h4>
                {(authorDetail?.books || []).length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center">
                    <BookOpen className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No books yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(authorDetail.books as any[]).map((book: any) => {
                      const statusColors: Record<string, string> = {
                        published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                        ongoing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                        rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                      };
                      const colorClass = statusColors[book.status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
                      return (
                        <div key={book._id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {book.bookName || book.title || 'Untitled'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {book.bookId || book._id?.toString().slice(-6).toUpperCase()}
                            </p>
                          </div>
                          <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                            {book.status || 'unknown'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {authorDetail?.books?.length ?? author.totalBooks ?? 0}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">Total Books</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {(authorDetail?.books || []).filter((b: any) => !['pending', 'published', 'rejected'].includes(b.status)).length}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Ongoing Books</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {(() => {
                      const prevMonth = new Date();
                      prevMonth.setMonth(prevMonth.getMonth() - 1);
                      const pm = prevMonth.getMonth();
                      const py = prevMonth.getFullYear();
                      const total = (authorDetail?.recentTransactions || [])
                        .filter((t: any) => {
                          if (t.type !== 'royalty_payment') return false;
                          const d = new Date(t.createdAt);
                          return d.getMonth() === pm && d.getFullYear() === py;
                        })
                        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
                      return formatCurrency(total);
                    })()}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Last Month Revenue
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {(() => {
                      const percentages = (authorDetail?.books || [])
                        .map((b: any) => b.royaltyPercentage)
                        .filter((v: any) => typeof v === 'number');
                      if (percentages.length === 0) return '—';
                      const min = Math.min(...percentages);
                      const max = Math.max(...percentages);
                      return min === max ? `${min}%` : `${min}-${max}%`;
                    })()}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                    Author Royalty
                  </p>
                </div>
              </div>

              {/* Update Profile Button */}
              <button
                onClick={() => {
                  if (!selectedAuthor) return;
                  const a = selectedAuthor;
                  const u = (a as any).user || (a as any).userId || {};
                  setCreateForm({
                    firstName: u.firstName || '',
                    lastName: u.lastName || '',
                    email: u.email || '',
                    mobile: u.mobile || '',
                    pinCode: a.address?.pinCode || '',
                    division: a.address?.district || '',
                    city: a.address?.city || '',
                    district: a.address?.district || '',
                    state: a.address?.state || '',
                    country: a.address?.country || '',
                    housePlot: a.address?.housePlot || '',
                    landmark: a.address?.landmark || '',
                  });
                  setEditingAuthorId(a.authorId);
                  setShowCreateModal(true);
                  setShowDetailPanel(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <Edit className="w-4 h-4" />
                Update Profile
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  // =========================================================================
  // Render: Restrict Confirmation Dialog
  // =========================================================================

  const renderRestrictDialog = () => {
    if (!showRestrictDialog || !selectedAuthor) return null;

    const isCurrentlyRestricted = selectedAuthor.isRestricted;
    const actionLabel = isCurrentlyRestricted ? 'Unrestrict' : 'Restrict';
    const uObj = (selectedAuthor as any).user || (selectedAuthor as any).userId || {};
    const fullName = `${uObj.firstName || ''} ${uObj.lastName || ''}`.trim();

    return (
      <Modal
        isOpen={showRestrictDialog}
        onClose={() => {
          setShowRestrictDialog(false);
          setSelectedAuthor(null);
        }}
        title={`${actionLabel} Author`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {fullName || selectedAuthor.authorId}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {selectedAuthor.authorId}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isCurrentlyRestricted
              ? 'Are you sure you want to unrestrict this author? They will regain full access to the platform.'
              : 'Are you sure you want to restrict this author? They will lose access to publish and manage books.'}
          </p>

          {/* Reason (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              value={restrictReason}
              onChange={(e) => setRestrictReason(e.target.value)}
              placeholder={`Reason for ${actionLabel.toLowerCase()}ing...`}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowRestrictDialog(false);
                setSelectedAuthor(null);
              }}
              className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRestrictConfirm}
              disabled={restrictLoading}
              className={`px-5 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 ${
                isCurrentlyRestricted
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-400'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-400'
              }`}
            >
              {restrictLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isCurrentlyRestricted ? (
                <>
                  <Check className="w-4 h-4" />
                  Unrestrict
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  Restrict
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // =========================================================================
  // Main Render
  // =========================================================================

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Authors</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View, create, and manage author accounts on the platform
        </p>
      </div>

      {/* Filter Bar */}
      {renderFilterBar()}

      {/* Authors Table */}
      {renderTable()}

      {/* Modals & Panels */}
      {renderCreateModal()}
      {renderDetailPanel()}
      {renderRestrictDialog()}
    </div>
  );
};

export default Authors;
