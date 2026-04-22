import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  X,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Check,
  Upload,
  User,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Star,
  DollarSign,
  Clock,
  Link as LinkIcon,
  CreditCard,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { format } from 'date-fns';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BOOK_STATUSES = ['pending', 'payment_pending', 'in_progress', 'formatting', 'designing', 'printing', 'published', 'rejected'];
const PLATFORMS = ['Amazon', 'Flipkart', 'Meesho', 'Snapdeal', 'Myntra', '150+ Other Sellers', '1200 Offline Channels'];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending:         { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500', label: 'Pending' },
  payment_pending: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500', label: 'Payment Pending' },
  in_progress:     { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-300',   dot: 'bg-blue-500',   label: 'In Progress' },
  formatting:      { bg: 'bg-cyan-100 dark:bg-cyan-900/30',   text: 'text-cyan-700 dark:text-cyan-300',   dot: 'bg-cyan-500',   label: 'Formatting' },
  designing:       { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500', label: 'Designing' },
  printing:        { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500', label: 'Printing' },
  published:       { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500', label: 'Published' },
  rejected:        { bg: 'bg-red-100 dark:bg-red-900/30',     text: 'text-red-700 dark:text-red-300',     dot: 'bg-red-500',   label: 'Rejected' },
};

const PIPELINE_STAGES = ['pending', 'formatting', 'designing', 'printing', 'published'] as const;

const PIPELINE_STAGE_LABELS: Record<string, string> = {
  pending: 'Pending',
  formatting: 'Formatting',
  designing: 'Designing',
  printing: 'Printing',
  published: 'Published',
};

const NEXT_STAGE: Record<string, string> = {
  formatting: 'designing',
  designing: 'printing',
  printing: 'published',
};

const TYPE_CONFIG: Record<string, string> = {
  Fiction:     'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  'Non-Fiction':'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  Academic:    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  Magazine:    'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  Poetry:      'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  Children:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Book {
  _id: string;
  bookId: string;
  bookName: string;
  authorName?: string;
  authorId?: string;
  bookType: string;
  language?: string;
  status: string;
  sellingUnits?: number;
  netEarnings?: number;
  createdAt: string;
  expectedLaunchDate?: string;
  physicalCopies?: number;
  royaltyPercentage?: number;
  subtitle?: string;
  targetAudience?: string;
  paymentInstallment?: number;
  // nested services object (if present)
  services?: {
    coverPage?: boolean;
    designing?: boolean;
    formatting?: boolean;
    copyright?: boolean;
  };
  // flat fields from Book model
  hasCover?: boolean;
  needDesigning?: boolean;
  needFormatting?: boolean;
  needCopyright?: boolean;
  coverPage?: string;
  marketplaces?: string[];
  platforms?: string[];
  uploadedFiles?: Array<{ name: string; url: string; type: string }>;
  payment?: {
    totalAmount?: number;
    paidAmount?: number;
    pendingAmount?: number;
    installmentOption?: number;
  };
  paymentStatus?: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    paymentCompletionPercentage: number;
    installments?: { amount: number; status: string; paidAt?: string; _id?: string }[];
  };
  paymentPlan?: string;
  dueDate?: string;
  productLinks?: Array<{ platform: string; productLink: string; rating: number }>;
  platformWiseSales?: Record<string, { sellingUnits: number; productLink?: string; rating?: number }>;
  declineReason?: string;
}

interface AuthorSuggestion {
  authorId: string;
  name: string;
  email?: string;
}

interface PricingConfig {
  publishingPrice?: { main: number; discount: number };
  coverDesignPrice?: { main: number; discount: number };
  formattingPrice?: { main: number; discount: number };
  copyrightPrice?: { main: number; discount: number };
  distributionPrice?: { main: number; discount: number };
  perBookCopyPrice?: { main: number; discount: number };
}

interface BookFilters {
  authorName: string;
  bookName: string;
  bookType: string;
  status: string;
  fromDate: string;
  toDate: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

type WizardStep = 1 | 2 | 3;

interface BookFormData {
  // Step 1
  authorSearch: string;
  authorId: string;
  authorName: string;
  language: string;
  bookName: string;
  subtitle: string;
  bookType: string;
  customBookType?: string;
  targetAudience: string;
  expectedLaunchDate: string;
  physicalCopies: number;
  royaltyPercentage: number;
  paymentInstallment: number;
  // Step 2
  services: {
    coverPage: boolean;
    designing: boolean;
    formatting: boolean;
    copyright: boolean;
  };
  platforms: string[];
  uploadedFiles: File[];
  // Step 3 is read-only price summary
}

const initialForm: BookFormData = {
  authorSearch: '',
  authorId: '',
  authorName: '',
  language: '',
  bookName: '',
  subtitle: '',
  bookType: '',
  customBookType: '',
  targetAudience: '',
  expectedLaunchDate: '',
  physicalCopies: 2,
  royaltyPercentage: 10,
  paymentInstallment: 1,
  services: { coverPage: false, designing: false, formatting: false, copyright: false },
  platforms: [],
  uploadedFiles: [],
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_CONFIG[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
    {type}
  </span>
);

// Opens a book file via backend-generated signed URL (bypasses Cloudinary PDF restriction)
const OpenFileButton: React.FC<{ bookId: string; fileUrl: string; label?: string }> = ({ bookId, fileUrl, label }) => {
  const [loading, setLoading] = React.useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.BOOKS.GET_FILE_URL(bookId), {
        params: { fileUrl },
      });
      const signedUrl = res.data?.data?.url;
      if (signedUrl) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Could not generate file URL');
      }
    } catch {
      toast.error('Failed to open file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleOpen}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors w-full text-left disabled:opacity-50"
    >
      <BookOpen className="w-4 h-4 flex-shrink-0" />
      <span className="truncate flex-1">{label || 'Open File'}</span>
      {loading ? <Loader2 className="w-3.5 h-3.5 ml-auto flex-shrink-0 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-gray-400" />}
    </button>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const AdminBooks: React.FC = () => {
  // ---- List state ----
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 20 });

  // ---- Filters ----
  const [filters, setFilters] = useState<BookFilters>({ authorName: '', bookName: '', bookType: '', status: '', fromDate: '', toDate: '' });
  const [appliedFilters, setAppliedFilters] = useState<BookFilters>({ authorName: '', bookName: '', bookType: '', status: '', fromDate: '', toDate: '' });

  // ---- Modals / panels ----
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editMode, setEditMode] = useState(false);

  // ---- Actions dropdown ----
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ---- Add/Edit form ----
  const [step, setStep] = useState<WizardStep>(1);
  const [form, setForm] = useState<BookFormData>(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  // Already-saved Cloudinary URLs shown during edit (separate from new File uploads)
  const [existingFiles, setExistingFiles] = useState<string[]>([]);

  // ---- Author typeahead ----
  const [authorSuggestions, setAuthorSuggestions] = useState<AuthorSuggestion[]>([]);
  const [authorLoading, setAuthorLoading] = useState(false);
  const authorDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Pricing ----
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // ---- Dynamic config (languages & book types from admin) ----
  const [dynamicLanguages, setDynamicLanguages] = useState<string[]>([]);
  const [dynamicBookTypes, setDynamicBookTypes] = useState<string[]>([]);

  // ---- Delete confirm ----
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ---- Phase 3: Approval / Pipeline / Product Links / Payment Request / Due Date ----
  const [approveLoading, setApproveLoading] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declineLoading, setDeclineLoading] = useState(false);
  const [stageLoading, setStageLoading] = useState(false);
  const [productLinkInputs, setProductLinkInputs] = useState<Record<string, { url: string; rating: number }>>({});
  const [productLinkSaving, setProductLinkSaving] = useState<string | null>(null);
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
  const [paymentRequestForm, setPaymentRequestForm] = useState({ serviceType: 'inclusive', amount: '', description: '' });
  const [paymentRequestLoading, setPaymentRequestLoading] = useState(false);
  const [showExtendDueDateModal, setShowExtendDueDateModal] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');
  const [extendDueDateLoading, setExtendDueDateLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // ===========================================================================
  // Data fetching
  // ===========================================================================

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (appliedFilters.authorName) params.authorName = appliedFilters.authorName;
      if (appliedFilters.bookName) params.bookName = appliedFilters.bookName;
      if (appliedFilters.bookType) params.bookType = appliedFilters.bookType;
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.fromDate) params.fromDate = appliedFilters.fromDate;
      if (appliedFilters.toDate) params.toDate = appliedFilters.toDate;

      const res = await axiosInstance.get('/admin/books', { params });
      const data = res.data?.data || res.data || {};
      const booksArr = data.books || data.data || [];
      const p = data.pagination || {};
      setBooks(booksArr);
      setPagination({
        currentPage: p.page || p.currentPage || page,
        totalPages: p.pages || p.totalPages || 1,
        totalItems: p.total || p.totalItems || 0,
        limit: p.limit || 20,
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to fetch books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => { fetchBooks(1); }, [fetchBooks]);

  // Fetch dynamic languages & book types from payment-config
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get('/payment-config/public');
        const data = res.data?.data;
        if (data?.languages) setDynamicLanguages(data.languages);
        if (data?.bookTypes) setDynamicBookTypes(data.bookTypes);
      } catch { /* fallback: dropdowns stay empty */ }
    })();
  }, []);

  // When book types load, fix bookType if edit modal is open and type wasn't resolved yet
  useEffect(() => {
    if (dynamicBookTypes.length === 0) return;
    setForm(prev => {
      if (!prev.bookType || prev.bookType === 'Other') return prev;
      if (dynamicBookTypes.includes(prev.bookType)) return prev;
      // Type is set but not in list — move to custom
      return { ...prev, bookType: 'Other', customBookType: prev.bookType };
    });
  }, [dynamicBookTypes]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ===========================================================================
  // Author typeahead
  // ===========================================================================

  const handleAuthorSearch = (value: string) => {
    setForm(prev => ({ ...prev, authorSearch: value, authorId: '', authorName: '' }));
    if (authorDebounce.current) clearTimeout(authorDebounce.current);
    if (value.length < 2) { setAuthorSuggestions([]); return; }

    authorDebounce.current = setTimeout(async () => {
      setAuthorLoading(true);
      try {
        const res = await axiosInstance.get('/admin/authors', { params: { search: value, limit: 10 } });
        const list = res.data?.data?.authors || res.data?.data || [];
        const mapped: AuthorSuggestion[] = list.map((a: any) => {
          const userObj = a.user || {};
          const name = `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim();
          return {
            authorId: a.authorId,
            name: name || a.authorId,
            email: userObj.email || '',
          };
        }).filter((a: AuthorSuggestion) => a.name);
        setAuthorSuggestions(mapped);
      } catch {
        setAuthorSuggestions([]);
      } finally {
        setAuthorLoading(false);
      }
    }, 350);
  };

  const selectAuthor = (suggestion: AuthorSuggestion) => {
    setForm(prev => ({ ...prev, authorSearch: suggestion.name, authorId: suggestion.authorId, authorName: suggestion.name }));
    setAuthorSuggestions([]);
  };

  // ===========================================================================
  // Pricing fetch
  // ===========================================================================

  const fetchPricing = async (language: string) => {
    if (!language) return;
    setPricingLoading(true);
    try {
      const res = await axiosInstance.get('/payment-config/public');
      const configs = res.data?.data?.configs || [];
      const match = configs.find((c: any) => c.language?.toLowerCase() === language.toLowerCase());
      console.log('[DEBUG] Pricing config for', language, ':', match);
      setPricingConfig(match || null);
    } catch {
      setPricingConfig(null);
    } finally {
      setPricingLoading(false);
    }
  };

  // ===========================================================================
  // Price calculation helpers
  // ===========================================================================

  const disc = (p?: { main: number; discount: number }) => {
    if (!p) return 0;
    return p.main - Math.round((p.main * p.discount) / 100);
  };

  const calcTotal = (): number => {
    if (!pricingConfig) return 0;
    let total = disc(pricingConfig.publishingPrice);
    if (form.services.coverPage) total += disc(pricingConfig.coverDesignPrice);
    if (form.services.designing) total += disc(pricingConfig.formattingPrice);
    if (form.services.copyright) total += disc(pricingConfig.copyrightPrice);
    total += disc(pricingConfig.distributionPrice);
    const freeCopies = 2;
    const extraCopies = Math.max(0, (form.physicalCopies || 2) - freeCopies);
    total += extraCopies * disc(pricingConfig.perBookCopyPrice);
    return total;
  };

  const authorEarnings = () => {
    const total = calcTotal();
    return Math.round((total * (form.royaltyPercentage || 0)) / 100);
  };

  // ===========================================================================
  // Handlers
  // ===========================================================================

  const handleSearch = () => {
    setAppliedFilters({ ...filters });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const openAddModal = () => {
    setForm(initialForm);
    setFormErrors({});
    setStep(1);
    setEditMode(false);
    setExistingFiles([]);
    setPricingConfig(null);
    setAuthorSuggestions([]);
    setShowAddModal(true);
  };

  const openEditModal = (book: Book) => {
    const savedType = book.bookType || '';
    // If the saved type isn't in the known list, treat as custom "Other"
    const isKnownType = !savedType || dynamicBookTypes.includes(savedType) || savedType === 'Other';
    const resolvedBookType = isKnownType ? savedType : 'Other';
    const resolvedCustomType = isKnownType ? '' : savedType;

    setForm({
      authorSearch: book.authorName || '',
      authorId: book.authorId || '',
      authorName: book.authorName || '',
      language: book.language || '',
      bookName: book.bookName || '',
      subtitle: book.subtitle || '',
      bookType: resolvedBookType,
      customBookType: resolvedCustomType,
      targetAudience: book.targetAudience || '',
      expectedLaunchDate: book.expectedLaunchDate ? book.expectedLaunchDate.split('T')[0] : '',
      physicalCopies: book.physicalCopies ?? 2,
      royaltyPercentage: book.royaltyPercentage ?? 10,
      paymentInstallment: book.paymentInstallment ?? 1,
      services: {
        coverPage: book.services?.coverPage ?? book.hasCover ?? false,
        designing: book.services?.designing ?? book.needDesigning ?? false,
        formatting: book.services?.formatting ?? book.needFormatting ?? false,
        copyright: book.services?.copyright ?? book.needCopyright ?? false,
      },
      platforms: book.platforms || book.marketplaces || [],
      uploadedFiles: [],
    });
    // Populate existing Cloudinary file URLs so they display in Step 2
    const saved = (book.uploadedFiles || []) as any[];
    setExistingFiles(saved.map(f => (typeof f === 'string' ? f : f?.url || '')).filter(Boolean));
    setFormErrors({});
    setStep(1);
    setEditMode(true);
    setSelectedBook(book);
    if (book.language) fetchPricing(book.language);
    setShowAddModal(true);
    setOpenMenuId(null);
  };

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.authorId) errs.authorId = 'Please select a valid author';
    if (!form.language) errs.language = 'Language is required';
    if (!form.bookName.trim()) errs.bookName = 'Book name is required';
    if (!form.bookType) errs.bookType = 'Book type is required';
    if (!form.expectedLaunchDate) errs.expectedLaunchDate = 'Expected launch date is required';
    if (form.physicalCopies < 2) errs.physicalCopies = 'Minimum 2 physical copies';
    if (form.royaltyPercentage < 0 || form.royaltyPercentage > 100) errs.royaltyPercentage = 'Royalty must be between 0 and 100';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateStep1()) { toast.error('Please fill all required fields'); return; }
      // Fetch pricing when moving to step 2
      if (form.language) fetchPricing(form.language);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const bookType = form.bookType === 'Other' && form.customBookType
        ? form.customBookType
        : form.bookType;

      const payload: any = {
        authorId: form.authorId,
        language: form.language,
        bookName: form.bookName,
        subtitle: form.subtitle,
        bookType: bookType.toLowerCase(),
        targetAudience: form.targetAudience,
        expectedLaunchDate: form.expectedLaunchDate,
        physicalCopies: form.physicalCopies,
        royaltyPercentage: form.royaltyPercentage,
        needFormatting: form.services.formatting,
        needCopyright: form.services.copyright,
        needDesigning: form.services.designing,
        hasCover: form.services.coverPage,
        marketplaces: form.platforms,
        paymentPlan: form.paymentInstallment === 1 ? 'full'
          : form.paymentInstallment === 2 ? '2_installments'
          : form.paymentInstallment === 3 ? '3_installments'
          : '4_installments',
      };

      let bookId: string | null = null;

      if (editMode && selectedBook) {
        await axiosInstance.put(`/admin/books/${selectedBook.bookId}`, payload);
        bookId = selectedBook.bookId;
        toast.success('Book updated successfully');
      } else {
        const res = await axiosInstance.post('/admin/books', payload);
        bookId = res.data?.data?.book?.bookId;
        toast.success('Book created successfully');
      }

      // Upload files to Cloudinary if book was created and files exist
      console.log('[DEBUG] bookId:', bookId, 'files count:', form.uploadedFiles.length);
      if (bookId && form.uploadedFiles.length > 0) {
        toast.loading('Uploading files...', { id: 'file-upload' });
        try {
          const formData = new FormData();
          form.uploadedFiles.forEach(file => {
            console.log('[DEBUG] Appending file:', file.name, file.size);
            formData.append('bookFiles', file);
          });
          await axiosInstance.post(`/books/${bookId}/files`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 300000,
          });
          toast.success('Files uploaded successfully', { id: 'file-upload' });
        } catch (uploadErr: any) {
          toast.error(uploadErr?.response?.data?.message || 'Book created but file upload failed. You can upload files later.', { id: 'file-upload' });
        }
      }

      setShowAddModal(false);
      setForm(initialForm);
      setExistingFiles([]);
      setStep(1);
      fetchBooks(pagination.currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save book');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (book: Book) => {
    setSelectedBook(book);
    setShowDetailPanel(true);
    setOpenMenuId(null);
    // Fetch full detail — merge with existing book data to preserve authorName
    try {
      const res = await axiosInstance.get(`/admin/books/${book.bookId}`);
      const fetched = res.data?.data?.book || res.data?.data || {};
      setSelectedBook({ ...book, ...fetched, authorName: book.authorName || fetched.authorName });
    } catch {
      // Use existing data from listing
    }
  };

  const handleDelete = async () => {
    if (!deletingBook) return;
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/admin/books/${deletingBook.bookId}`);
      toast.success('Book deleted successfully');
      setShowDeleteConfirm(false);
      setDeletingBook(null);
      fetchBooks(pagination.currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete book');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try { return format(new Date(dateStr), 'dd MMM yyyy'); } catch { return dateStr; }
  };

  const minLaunchDate = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; })();

  // ===========================================================================
  // Phase 3: Approval / Pipeline / Product Links / Payment / Due Date handlers
  // ===========================================================================

  const handleApprove = async () => {
    if (!selectedBook) return;
    setApproveLoading(true);
    try {
      await axiosInstance.put(`/admin/books/${selectedBook.bookId}/approve`);
      toast.success('Book approved successfully');
      const res = await axiosInstance.get(`/admin/books/${selectedBook.bookId}`);
      setSelectedBook(res.data?.data || { ...selectedBook, status: 'formatting' });
      fetchBooks(pagination.currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve book');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedBook || !declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }
    setDeclineLoading(true);
    try {
      await axiosInstance.put(`/admin/books/${selectedBook.bookId}/decline`, { reason: declineReason.trim() });
      toast.success('Book declined');
      setShowDeclineModal(false);
      setDeclineReason('');
      const res = await axiosInstance.get(`/admin/books/${selectedBook.bookId}`);
      setSelectedBook(res.data?.data || { ...selectedBook, status: 'rejected' });
      fetchBooks(pagination.currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to decline book');
    } finally {
      setDeclineLoading(false);
    }
  };

  const handleMoveToNextStage = async () => {
    if (!selectedBook) return;
    const nextStatus = NEXT_STAGE[selectedBook.status];
    if (!nextStatus) return;
    setStageLoading(true);
    try {
      await axiosInstance.put(`/admin/books/${selectedBook.bookId}/stage`, { status: nextStatus });
      toast.success(`Book moved to ${PIPELINE_STAGE_LABELS[nextStatus] || nextStatus}`);
      const res = await axiosInstance.get(`/admin/books/${selectedBook.bookId}`);
      setSelectedBook(res.data?.data || { ...selectedBook, status: nextStatus });
      fetchBooks(pagination.currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to advance stage');
    } finally {
      setStageLoading(false);
    }
  };

  const handleSaveProductLink = async (platform: string) => {
    if (!selectedBook) return;
    const isOffline = platform === '1200 Offline Channels' || platform === '150+ Other Sellers';
    const input = productLinkInputs[platform];
    if (!isOffline && !input?.url?.trim()) {
      toast.error('Please enter a product URL');
      return;
    }
    setProductLinkSaving(platform);
    try {
      const res = await axiosInstance.put(`/admin/books/${selectedBook.bookId}/product-links`, {
        platform,
        productLink: isOffline ? '' : input.url.trim(),
        rating: input?.rating || 0,
      });
      toast.success(`Product link saved for ${platform}`);
      // Use the book returned directly from the PUT response — avoids a second round-trip
      const updatedBook = res.data?.data?.book;
      if (updatedBook) setSelectedBook(updatedBook);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save product link');
    } finally {
      setProductLinkSaving(null);
    }
  };

  const handlePaymentRequest = async () => {
    if (!selectedBook) return;
    if (!paymentRequestForm.amount || Number(paymentRequestForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setPaymentRequestLoading(true);
    try {
      await axiosInstance.post(`/admin/books/${selectedBook.bookId}/payment-request`, {
        serviceType: paymentRequestForm.serviceType,
        amount: Number(paymentRequestForm.amount),
        description: paymentRequestForm.description,
      });
      toast.success('Payment request sent successfully');
      setShowPaymentRequestModal(false);
      setPaymentRequestForm({ serviceType: 'inclusive', amount: '', description: '' });
      const res = await axiosInstance.get(`/admin/books/${selectedBook.bookId}`);
      setSelectedBook(res.data?.data || selectedBook);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send payment request');
    } finally {
      setPaymentRequestLoading(false);
    }
  };

  const handleExtendDueDate = async () => {
    if (!selectedBook || !newDueDate) {
      toast.error('Please select a new due date');
      return;
    }
    setExtendDueDateLoading(true);
    try {
      await axiosInstance.put(`/admin/books/${selectedBook.bookId}/extend-due-date`, { newDueDate });
      toast.success('Due date extended successfully');
      setShowExtendDueDateModal(false);
      setNewDueDate('');
      const res = await axiosInstance.get(`/admin/books/${selectedBook.bookId}`);
      setSelectedBook(res.data?.data || selectedBook);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to extend due date');
    } finally {
      setExtendDueDateLoading(false);
    }
  };

  // Initialize product link inputs when selectedBook changes
  useEffect(() => {
    if (selectedBook?.marketplaces && selectedBook.status === 'published') {
      const existing: Record<string, { url: string; rating: number }> = {};
      selectedBook.marketplaces.forEach(platform => {
        const sales = selectedBook.platformWiseSales?.[platform];
        existing[platform] = {
          url: sales?.productLink || '',
          rating: sales?.rating || 0,
        };
      });
      setProductLinkInputs(existing);
    }
  }, [selectedBook?.bookId, selectedBook?.status, selectedBook?.platformWiseSales]);

  // ===========================================================================
  // Render: Filter Bar
  // ===========================================================================

  const renderFilterBar = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 items-end">
        {/* Author Name */}
        <div className="xl:col-span-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Author Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.authorName}
              onChange={e => setFilters(p => ({ ...p, authorName: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Author name..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Book Name */}
        <div className="xl:col-span-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Book Name</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.bookName}
              onChange={e => setFilters(p => ({ ...p, bookName: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Book name..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Book Type */}
        <div className="xl:col-span-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Book Type</label>
          <select
            value={filters.bookType}
            onChange={e => setFilters(p => ({ ...p, bookType: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            <option value="">All Types</option>
            {dynamicBookTypes.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="Other">Other</option>
          </select>
        </div>

        {/* Status */}
        <div className="xl:col-span-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            <option value="">All Statuses</option>
            {BOOK_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
          </select>
        </div>

        {/* From Date */}
        <div className="xl:col-span-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">From Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={filters.fromDate}
              onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* To Date */}
        <div className="xl:col-span-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">To Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={filters.toDate}
              onChange={e => setFilters(p => ({ ...p, toDate: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="xl:col-span-2 flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
            onClick={openAddModal}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <Plus className="w-4 h-4" />
            Book
          </button>
        </div>
      </div>
    </div>
  );

  // ===========================================================================
  // Render: Table
  // ===========================================================================

  const renderTable = () => {
    if (loading) {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading books...</p>
          </div>
        </div>
      );
    }

    if (books.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-12 h-12 opacity-40" />
            <p className="text-base font-medium">No books found</p>
            <p className="text-sm">Try adjusting your filters or add a new book</p>
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
                {['No', 'Book ID', 'Book Name', 'Author Name', 'Book Type', 'Status', 'Selling Units', 'Net Earnings', 'Entry Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {books.map((book, idx) => {
                const rowNum = (pagination.currentPage - 1) * pagination.limit + idx + 1;
                return (
                  <tr key={book._id || book.bookId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{rowNum}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => openDetail(book)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline focus:outline-none transition-colors"
                      >
                        {book.bookId}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-[160px] truncate whitespace-nowrap">
                      {book.bookName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{book.authorName || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TypeBadge type={book.bookType} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={book.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap text-right">
                      {(book.sellingUnits ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap font-medium">
                      Rs {(book.netEarnings ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(book.createdAt)}</td>
                    <td className="px-4 py-3 text-sm relative">
                      <div ref={openMenuId === (book._id || book.bookId) ? menuRef : null}>
                        <button
                          onClick={() => setOpenMenuId(prev => prev === (book._id || book.bookId) ? null : (book._id || book.bookId))}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                        {openMenuId === (book._id || book.bookId) && (
                          <div className="absolute right-4 top-10 z-20 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                            <button
                              onClick={() => openDetail(book)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4" /> View
                            </button>
                            <button
                              onClick={() => openEditModal(book)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                            {book.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => { setOpenMenuId(null); openDetail(book); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                  <ThumbsUp className="w-4 h-4" /> Approve / Decline
                                </button>
                              </>
                            )}
                            {['formatting', 'designing', 'printing'].includes(book.status) && (
                              <button
                                onClick={async () => {
                                  setOpenMenuId(null);
                                  try {
                                    await axiosInstance.put(`/admin/books/${book.bookId}/stage`);
                                    toast.success(`Book advanced to next stage`);
                                    fetchBooks(pagination.currentPage);
                                  } catch (err: any) {
                                    toast.error(err?.response?.data?.message || 'Failed to advance stage');
                                  }
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                              >
                                <ArrowRight className="w-4 h-4" /> Advance Stage
                              </button>
                            )}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                            <button
                              onClick={() => { setDeletingBook(book); setShowDeleteConfirm(true); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span>
              {' '}to{' '}
              <span className="font-medium">{Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}</span>
              {' '}of <span className="font-medium">{pagination.totalItems}</span> books
            </p>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={page => { setPagination(p => ({ ...p, currentPage: page })); fetchBooks(page); }}
            />
          </div>
        )}
      </div>
    );
  };

  // ===========================================================================
  // Render: Add/Edit Wizard
  // ===========================================================================

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3].map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-2 ${step === s ? 'text-purple-600 dark:text-purple-400' : step > s ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              step === s ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
              step > s  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          'border-gray-300 dark:border-gray-600 text-gray-400'
            }`}>
              {step > s ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            <span className="text-xs font-medium hidden sm:block">
              {s === 1 ? 'Author & Book' : s === 2 ? 'Services & Files' : 'Price Summary'}
            </span>
          </div>
          {i < 2 && <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Author typeahead */}
      <div className="relative">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Author ID / Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={form.authorSearch}
            onChange={e => handleAuthorSearch(e.target.value)}
            placeholder="Type 2+ chars to search authors..."
            className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${formErrors.authorId ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
          />
          {authorLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />}
        </div>
        {formErrors.authorId && <p className="mt-1 text-xs text-red-500">{formErrors.authorId}</p>}
        {authorSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {authorSuggestions.map(s => (
              <button
                key={s.authorId}
                onClick={() => selectAuthor(s)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{s.authorId}</span>
                {s.email && <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{s.email}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Author Name (read-only after selection) */}
      {form.authorId && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Author Name</label>
          <input
            type="text"
            value={form.authorName}
            readOnly
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Language */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Book Language <span className="text-red-500">*</span>
          </label>
          <select
            value={form.language}
            onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${formErrors.language ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
          >
            <option value="">Select Language</option>
            {dynamicLanguages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {formErrors.language && <p className="mt-1 text-xs text-red-500">{formErrors.language}</p>}
        </div>

        {/* Book Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Book Type <span className="text-red-500">*</span>
          </label>
          <select
            value={form.bookType}
            onChange={e => setForm(p => ({ ...p, bookType: e.target.value }))}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${formErrors.bookType ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
          >
            <option value="">Select Type</option>
            {dynamicBookTypes.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="Other">Other</option>
          </select>
          {formErrors.bookType && <p className="mt-1 text-xs text-red-500">{formErrors.bookType}</p>}
          {form.bookType === 'Other' && (
            <input
              type="text"
              value={form.customBookType || ''}
              onChange={e => setForm(p => ({ ...p, customBookType: e.target.value }))}
              placeholder="Enter custom book type"
              className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
        </div>
      </div>

      {/* Book Name */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Book Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.bookName}
          onChange={e => setForm(p => ({ ...p, bookName: e.target.value }))}
          placeholder="Enter book name"
          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${formErrors.bookName ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
        />
        {formErrors.bookName && <p className="mt-1 text-xs text-red-500">{formErrors.bookName}</p>}
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Book Title / Subtitle</label>
        <input
          type="text"
          value={form.subtitle}
          onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
          placeholder="Optional subtitle"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Target Audience */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
          <input
            type="text"
            value={form.targetAudience}
            onChange={e => setForm(p => ({ ...p, targetAudience: e.target.value }))}
            placeholder="e.g. Young Adults, Students"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          />
        </div>

        {/* Expected Launch Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expected Launch Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.expectedLaunchDate}
            min={minLaunchDate}
            onChange={e => setForm(p => ({ ...p, expectedLaunchDate: e.target.value }))}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${formErrors.expectedLaunchDate ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
          />
          {formErrors.expectedLaunchDate && <p className="mt-1 text-xs text-red-500">{formErrors.expectedLaunchDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Physical Copies */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Physical Copies <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.physicalCopies}
            min={2}
            onChange={e => setForm(p => ({ ...p, physicalCopies: parseInt(e.target.value) || 2 }))}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${formErrors.physicalCopies ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
          />
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">2 copies free. Extra copies will be charged.</p>
          {form.physicalCopies > 2 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
              {form.physicalCopies - 2} extra {form.physicalCopies - 2 === 1 ? 'copy' : 'copies'} will be added to the price.
            </p>
          )}
          {formErrors.physicalCopies && <p className="mt-1 text-xs text-red-500">{formErrors.physicalCopies}</p>}
        </div>

        {/* Royalty % */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Author Royalty % <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.royaltyPercentage}
            min={0}
            max={100}
            onChange={e => setForm(p => ({ ...p, royaltyPercentage: parseFloat(e.target.value) || 0 }))}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${formErrors.royaltyPercentage ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
          />
          {formErrors.royaltyPercentage && <p className="mt-1 text-xs text-red-500">{formErrors.royaltyPercentage}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Services */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Add-on Services</h3>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'coverPage', label: 'Cover Page Design' },
            { key: 'designing', label: 'Book Designing' },
            { key: 'copyright', label: 'Copyright' },
          ] as { key: keyof typeof form.services; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setForm(p => ({ ...p, services: { ...p.services, [key]: !p.services[key] } }))}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                form.services[key]
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                form.services[key] ? 'border-purple-500 bg-purple-500' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {form.services[key] && <Check className="w-3 h-3 text-white" />}
              </div>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Upload Files</h3>

        {/* Already-saved files (edit mode) */}
        {existingFiles.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Already uploaded</p>
            <ul className="space-y-1">
              {existingFiles.map((url, i) => {
                const fileName = decodeURIComponent(url.split('/').pop()?.split('?')[0] || `File ${i + 1}`);
                return (
                  <li key={i} className="flex items-center justify-between px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="truncate max-w-[80%] text-indigo-600 dark:text-indigo-400 hover:underline">
                      {fileName}
                    </a>
                    <button
                      type="button"
                      onClick={() => setExistingFiles(prev => prev.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0"
                      title="Remove from display (does not delete the file)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <Upload className="w-6 h-6 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload manuscript / cover</span>
          <span className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PNG, JPG (max 50MB each)</span>
          <input
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={e => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                setForm(p => ({ ...p, uploadedFiles: [...p.uploadedFiles, ...files] }));
              }
              e.target.value = '';
            }}
          />
        </label>
        {form.uploadedFiles.length > 0 && (
          <ul className="mt-3 space-y-1">
            {form.uploadedFiles.map((f, i) => (
              <li key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                <span className="truncate max-w-[80%]">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, uploadedFiles: p.uploadedFiles.filter((_, j) => j !== i) }))}
                  className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Platforms */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Distribution Platforms</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PLATFORMS.map(platform => (
            <label key={platform} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.platforms.includes(platform)}
                onChange={e => {
                  setForm(p => ({
                    ...p,
                    platforms: e.target.checked
                      ? [...p.platforms, platform]
                      : p.platforms.filter(pl => pl !== platform),
                  }));
                }}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{platform}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const total = calcTotal();
    const royaltyEarnings = authorEarnings();
    const installments = form.paymentInstallment || 1;
    const perInstallment = installments > 1 ? Math.ceil(total / installments) : total;

    const p = pricingConfig;
    const freeCopies = 2;
    const extraCopies = Math.max(0, (form.physicalCopies || 2) - freeCopies);
    const rows: { label: string; original: number; discountPct: number; you_pay: number }[] = [
      { label: 'Book Publishing', original: p?.publishingPrice?.main || 0,  discountPct: p?.publishingPrice?.discount || 0,  you_pay: disc(p?.publishingPrice) },
    ];
    if (form.services.coverPage)  rows.push({ label: 'Cover Design',    original: p?.coverDesignPrice?.main || 0,  discountPct: p?.coverDesignPrice?.discount || 0,  you_pay: disc(p?.coverDesignPrice) });
    if (form.services.designing)  rows.push({ label: 'Book Designing',  original: p?.formattingPrice?.main || 0,   discountPct: p?.formattingPrice?.discount || 0,   you_pay: disc(p?.formattingPrice) });
    if (form.services.copyright)  rows.push({ label: 'Copyright',       original: p?.copyrightPrice?.main || 0,    discountPct: p?.copyrightPrice?.discount || 0,    you_pay: disc(p?.copyrightPrice) });
    rows.push({ label: 'Distribution',  original: p?.distributionPrice?.main || 0,  discountPct: p?.distributionPrice?.discount || 0,  you_pay: disc(p?.distributionPrice) });
    rows.push({ label: `Per Book Copy (×${extraCopies})`, original: extraCopies * (p?.perBookCopyPrice?.main || 0), discountPct: p?.perBookCopyPrice?.discount || 0, you_pay: extraCopies * disc(p?.perBookCopyPrice) });

    return (
      <div className="space-y-4">
        {pricingLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            Loading pricing...
          </div>
        )}

        {!pricingLoading && !pricingConfig && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
            Pricing configuration not found for {form.language}. Please ensure a config exists in Payment Config.
          </div>
        )}

        {pricingConfig && (
          <>
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Service</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Original</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Discount</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">You Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{row.label}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-400 line-through">Rs {row.original.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 text-sm text-right text-green-600 dark:text-green-400">{row.discountPct}%</td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 dark:text-gray-100">Rs {row.you_pay.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Total Amount</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300 mt-1">Rs {total.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Author Royalty ({form.royaltyPercentage}%)</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">Rs {royaltyEarnings.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Payment Plan Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Payment Plan</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 1, label: 'Full Payment', desc: '100% at once', icon: '💳' },
                  { value: 2, label: '2 Installments', desc: '50% + 50%', icon: '📋' },
                  { value: 3, label: '3 Installments', desc: '25% + 50% + 25%', icon: '📊' },
                  { value: 4, label: '4 Installments', desc: '25% + 50% + 25% + 0%', icon: '📑' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, paymentInstallment: opt.value }))}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                      form.paymentInstallment === opt.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <span className="text-xl mt-0.5">{opt.icon}</span>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${form.paymentInstallment === opt.value ? 'text-purple-700 dark:text-purple-300' : 'text-gray-800 dark:text-gray-200'}`}>{opt.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {installments > 1 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-semibold">Payment Plan:</span> {installments} installments of approx.{' '}
                  <span className="font-bold">Rs {perInstallment.toLocaleString('en-IN')}</span> each
                </p>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // ===========================================================================
  // Render: Book Detail Panel
  // ===========================================================================

  const renderDetailPanel = () => {
    if (!selectedBook) return null;

    return (
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ${showDetailPanel ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Book Details</h2>
            <button
              onClick={() => { setShowDetailPanel(false); setSelectedBook(null); }}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Top: Book ID + Entry Date */}
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                  {selectedBook.bookId}
                </span>
                <h1 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">{selectedBook.bookName}</h1>
                {selectedBook.subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">{selectedBook.subtitle}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Entry Date</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(selectedBook.createdAt)}</p>
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <TypeBadge type={selectedBook.bookType} />
              <StatusBadge status={selectedBook.status} />
              {selectedBook.language && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {selectedBook.language}
                </span>
              )}
            </div>

            {/* ---- Phase 3: Status Pipeline Progress ---- */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Status Pipeline</p>
              <div className="flex items-center gap-0">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const stageIndex = PIPELINE_STAGES.indexOf(selectedBook.status as typeof PIPELINE_STAGES[number]);
                  const currentIdx = stageIndex >= 0 ? stageIndex : (selectedBook.status === 'rejected' ? -1 : 0);
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <React.Fragment key={stage}>
                      <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: 0 }}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                          isCompleted ? 'border-green-500 bg-green-500 text-white' :
                          isCurrent ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`mt-1 text-[10px] font-medium text-center leading-tight ${
                          isCompleted ? 'text-green-600 dark:text-green-400' :
                          isCurrent ? 'text-purple-600 dark:text-purple-400' :
                          'text-gray-400 dark:text-gray-500'
                        }`}>
                          {PIPELINE_STAGE_LABELS[stage]}
                        </span>
                      </div>
                      {idx < PIPELINE_STAGES.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 rounded ${
                          idx < currentIdx ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* payment_pending — info only, author pays via Razorpay */}
            {selectedBook.status === 'payment_pending' && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">Awaiting Payment</p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Payment is overdue. The author has been notified and must complete payment to resume publishing.
                </p>
              </div>
            )}

            {/* ---- Phase 3: Approval/Decline Buttons (pending only) ---- */}
            {selectedBook.status === 'pending' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase tracking-wide mb-3">Pending Approval</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={approveLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {approveLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ThumbsUp className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => { setDeclineReason(''); setShowDeclineModal(true); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            )}

            {/* ---- Phase 3: Move to Next Stage (formatting / designing / printing) ---- */}
            {['formatting', 'designing', 'printing'].includes(selectedBook.status) && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-2">Advance Pipeline</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  Current stage: <span className="font-bold">{PIPELINE_STAGE_LABELS[selectedBook.status]}</span>
                  {' → Next: '}
                  <span className="font-bold">{PIPELINE_STAGE_LABELS[NEXT_STAGE[selectedBook.status]]}</span>
                </p>
                <button
                  onClick={handleMoveToNextStage}
                  disabled={stageLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {stageLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  Move to {PIPELINE_STAGE_LABELS[NEXT_STAGE[selectedBook.status]]}
                </button>
              </div>
            )}

            {/* Author */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Author</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedBook.authorName || '—'}</p>
              {selectedBook.authorId && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedBook.authorId}</p>
              )}
            </div>

            {/* Services */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Services</p>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: 'coverPage', label: 'Cover Page' },
                  { key: 'designing', label: 'Designing' },
                  { key: 'formatting', label: 'Formatting' },
                  { key: 'copyright', label: 'Copyright' },
                ] as { key: keyof typeof selectedBook.services; label: string }[]).map(({ key, label }) => {
                  const active = selectedBook.services?.[key];
                  return (
                    <span key={key} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                      {active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Physical Copies', value: selectedBook.physicalCopies ?? '—' },
                { label: 'Royalty %', value: selectedBook.royaltyPercentage != null ? `${selectedBook.royaltyPercentage}%` : '—' },
                { label: 'Launch Date', value: formatDate(selectedBook.expectedLaunchDate) },
                { label: 'Installments', value: selectedBook.paymentInstallment ? `${selectedBook.paymentInstallment}x` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
                </div>
              ))}
            </div>

            {/* Uploaded files */}
            {selectedBook.uploadedFiles && selectedBook.uploadedFiles.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Uploaded Files ({selectedBook.uploadedFiles.length})</p>
                <ul className="space-y-1">
                  {selectedBook.uploadedFiles.map((f: any, i: number) => {
                    const rawUrl = typeof f === 'string' ? f : f?.url || '';
                    const fileName = typeof f === 'string'
                      ? decodeURIComponent(rawUrl.split('/').pop()?.split('?')[0] || `File ${i + 1}`)
                      : (f?.name || `File ${i + 1}`);
                    return (
                      <li key={i}>
                        <OpenFileButton bookId={selectedBook.bookId} fileUrl={rawUrl} label={fileName} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Payment summary */}
            {(selectedBook.paymentStatus || selectedBook.payment) && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Payment Summary</p>
                {(() => {
                  const ps = selectedBook.paymentStatus || selectedBook.payment;
                  const totalAmount = ps?.totalAmount || 0;
                  const paidAmount = ps?.paidAmount || 0;
                  const pendingAmount = ps?.pendingAmount ?? (totalAmount - paidAmount);
                  const plan = selectedBook.paymentPlan || 'full';
                  const totalCount = plan === '4_installments' ? 4
                    : plan === '3_installments' ? 3
                    : plan === '2_installments' ? 2 : 1;
                  const installments = selectedBook.paymentStatus?.installments || [];
                  const paidEntries = installments.filter(i => i.status === 'paid');
                  const paidCount = paidEntries.length;
                  const perInstallment = totalCount > 1 ? Math.ceil(totalAmount / totalCount) : totalAmount;
                  return (
                    <>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-xs text-purple-500 font-medium">Total</p>
                          <p className="text-sm font-bold text-purple-700 dark:text-purple-300">Rs {totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-xs text-green-500 font-medium">Paid</p>
                          <p className="text-sm font-bold text-green-700 dark:text-green-300">Rs {paidAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <p className="text-xs text-red-500 font-medium">Pending</p>
                          <p className="text-sm font-bold text-red-700 dark:text-red-300">Rs {pendingAmount.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      {totalCount > 1 && (
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                            Installment Plan — {paidCount}/{totalCount} paid
                          </p>
                          <div className="space-y-1.5">
                            {Array.from({ length: totalCount }).map((_, i) => {
                              const isPaid = i < paidCount;
                              const isNext = i === paidCount && pendingAmount > 0;
                              const entry = paidEntries[i];
                              return (
                                <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                                  isPaid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : isNext ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                }`}>
                                  <span className="font-medium">
                                    {isPaid ? '✓ ' : isNext ? '→ ' : '○ '}
                                    Installment {i + 1}
                                    {entry?.paidAt && ` · ${formatDate(entry.paidAt)}`}
                                  </span>
                                  <span className="font-bold">Rs {perInstallment.toLocaleString('en-IN')}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* ---- Phase 3: Product Links (published books only) ---- */}
            {selectedBook.status === 'published' && selectedBook.marketplaces && selectedBook.marketplaces.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Product Links</p>
                <div className="space-y-3">
                  {selectedBook.marketplaces.map(platform => {
                    const isOffline = platform === '1200 Offline Channels' || platform === '150+ Other Sellers';
                    const input = productLinkInputs[platform] || { url: '', rating: 0 };
                    const isSaving = productLinkSaving === platform;
                    return (
                      <div key={platform} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{platform}</span>
                          {isOffline && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">(offline distribution)</span>
                          )}
                        </div>
                        {!isOffline && (
                          <input
                            type="url"
                            value={input.url}
                            onChange={e => setProductLinkInputs(prev => ({ ...prev, [platform]: { ...prev[platform], url: e.target.value } }))}
                            placeholder="https://..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          />
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Rating:</span>
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setProductLinkInputs(prev => ({ ...prev, [platform]: { ...prev[platform], rating: star } }))}
                                className="focus:outline-none transition-colors"
                              >
                                <Star
                                  className={`w-4 h-4 ${star <= (input.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                />
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => handleSaveProductLink(platform)}
                            disabled={isSaving}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isSaving ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Save
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---- Phase 3: Payment Request Button ---- */}
            <div>
              <button
                onClick={() => {
                  setPaymentRequestForm({ serviceType: 'inclusive', amount: '', description: '' });
                  setShowPaymentRequestModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <CreditCard className="w-4 h-4" />
                Request Payment
              </button>
            </div>

            {/* ---- Phase 3: Extend Due Date (pay_later books) ---- */}
            {selectedBook.paymentPlan === 'pay_later' && selectedBook.dueDate && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-2">Due Date</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">{formatDate(selectedBook.dueDate)}</span>
                  </div>
                  <button
                    onClick={() => { setNewDueDate(''); setShowExtendDueDateModal(true); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <Calendar className="w-3 h-3" />
                    Extend Due Date
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Edit button at bottom */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => { setShowDetailPanel(false); openEditModal(selectedBook); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <Edit className="w-4 h-4" />
              Edit Book
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===========================================================================
  // Main render
  // ===========================================================================

  return (
    <div className="space-y-6">
      {/* Overlay for detail panel */}
      {showDetailPanel && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => { setShowDetailPanel(false); setSelectedBook(null); }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Books</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View, manage and create books for all authors on the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
            <BookOpen className="w-4 h-4" />
            {pagination.totalItems} Total Books
          </span>
        </div>
      </div>

      {renderFilterBar()}
      {renderTable()}
      {renderDetailPanel()}

      {/* Add/Edit Book Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editMode ? 'Edit Book' : 'Add New Book'}
        size="xl"
        closeOnBackdropClick={false}
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => step > 1 ? handlePrevStep() : setShowAddModal(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {step > 1 ? 'Back' : 'Cancel'}
            </button>
            {step < 3 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : editMode ? (
                  <><Check className="w-4 h-4" /> Update Book</>
                ) : (
                  <><Check className="w-4 h-4" /> Create Book & Send Payment Request</>
                )}
              </button>
            )}
          </div>
        }
      >
        {renderStepIndicator()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingBook(null); }}
        title="Delete Book"
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setShowDeleteConfirm(false); setDeletingBook(null); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {deleteLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete</>}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-100">{deletingBook?.bookName}</span>?
          This action cannot be undone.
        </p>
      </Modal>

      {/* ---- Phase 3: Decline Reason Modal ---- */}
      <Modal
        isOpen={showDeclineModal}
        onClose={() => { setShowDeclineModal(false); setDeclineReason(''); }}
        title="Decline Book"
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setShowDeclineModal(false); setDeclineReason(''); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDecline}
              disabled={declineLoading || !declineReason.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {declineLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Declining...</>
              ) : (
                <><ThumbsDown className="w-4 h-4" /> Decline Book</>
              )}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please provide a reason for declining <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedBook?.bookName}</span>.
          </p>
          <textarea
            value={declineReason}
            onChange={e => setDeclineReason(e.target.value)}
            placeholder="Enter reason for declining this book..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors resize-none"
          />
          {!declineReason.trim() && (
            <p className="text-xs text-red-500">Reason is required to decline a book.</p>
          )}
        </div>
      </Modal>

      {/* ---- Phase 3: Payment Request Modal ---- */}
      <Modal
        isOpen={showPaymentRequestModal}
        onClose={() => { setShowPaymentRequestModal(false); setPaymentRequestForm({ serviceType: 'inclusive', amount: '', description: '' }); }}
        title="Request Payment"
        size="md"
        footer={
          <>
            <button
              onClick={() => { setShowPaymentRequestModal(false); setPaymentRequestForm({ serviceType: 'inclusive', amount: '', description: '' }); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePaymentRequest}
              disabled={paymentRequestLoading || !paymentRequestForm.amount}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {paymentRequestLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
              ) : (
                <><DollarSign className="w-4 h-4" /> Send Payment Request</>
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Book Info (read-only) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Book ID</label>
              <input
                type="text"
                value={selectedBook?.bookId || ''}
                readOnly
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Book Name</label>
              <input
                type="text"
                value={selectedBook?.bookName || ''}
                readOnly
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Amount received so far */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Received So Far</label>
            <input
              type="text"
              value={`Rs ${(selectedBook?.payment?.paidAmount || 0).toLocaleString('en-IN')}`}
              readOnly
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Type <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentRequestForm.serviceType}
              onChange={e => setPaymentRequestForm(p => ({ ...p, serviceType: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            >
              <option value="inclusive">Inclusive Services</option>
              <option value="exclusive">Exclusive Services</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (Rs) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={paymentRequestForm.amount}
              onChange={e => setPaymentRequestForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="Enter amount"
              min={1}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={paymentRequestForm.description}
              onChange={e => setPaymentRequestForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Add a note about this payment request..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* ---- Phase 3: Extend Due Date Modal ---- */}
      <Modal
        isOpen={showExtendDueDateModal}
        onClose={() => { setShowExtendDueDateModal(false); setNewDueDate(''); }}
        title="Extend Due Date"
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setShowExtendDueDateModal(false); setNewDueDate(''); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExtendDueDate}
              disabled={extendDueDateLoading || !newDueDate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {extendDueDateLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Calendar className="w-4 h-4" /> Extend Date</>
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current due date for <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedBook?.bookName}</span>:{' '}
            <span className="font-semibold text-amber-700 dark:text-amber-300">{formatDate(selectedBook?.dueDate)}</span>
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={newDueDate}
              min={today}
              onChange={e => setNewDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBooks;
