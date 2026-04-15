import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Plus,
  ArrowLeft,
  BookOpen,
  Upload,
  ChevronDown,
  ChevronRight,
  Check,
  Loader2,
  FileText,
  IndianRupee,
  Eye,
  ShoppingCart,
  CheckCircle2,
  Info,
  Trash2,
  ChevronUp,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import { bookService } from '../../services/bookService';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Book types are now fetched dynamically from admin config

const DEFAULT_PLATFORMS = [
  'Amazon',
  'Flipkart',
  'Meesho',
  'Snapdeal',
  'Myntra',
  '150+ Other Sellers',
  '1200 Offline Channels',
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  draft:           { bg: 'bg-gray-100 dark:bg-gray-900/30',    text: 'text-gray-700 dark:text-gray-300',     dot: 'bg-gray-500',    label: 'Draft' },
  pending:         { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500',  label: 'Pending' },
  payment_pending: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500',  label: 'Payment Pending' },
  in_progress:     { bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-300',     dot: 'bg-blue-500',    label: 'In Progress' },
  formatting:      { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500',  label: 'Formatting' },
  designing:       { bg: 'bg-pink-100 dark:bg-pink-900/30',     text: 'text-pink-700 dark:text-pink-300',     dot: 'bg-pink-500',    label: 'Designing' },
  published:       { bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-300',   dot: 'bg-green-500',   label: 'Published' },
  rejected:        { bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-300',       dot: 'bg-red-500',     label: 'Rejected' },
};

const SALE_PLATFORMS = ['Amazon', 'Flipkart', 'Meesho', 'Offline'];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookData {
  _id: string;
  bookId: string;
  bookName: string;
  subtitle?: string;
  bookType: string;
  language?: string;
  status: string;
  coverPage?: string;
  uploadedFiles?: Array<{ name?: string; url: string; type?: string }> | string[];
  needFormatting?: boolean;
  needCopyright?: boolean;
  needDesigning?: boolean;
  physicalCopies?: number;
  royaltyPercentage?: number;
  expectedLaunchDate?: string;
  actualLaunchDate?: string;
  targetAudience?: string;
  marketplaces?: string[];
  totalSellingUnits?: number;
  totalRevenue?: number;
  createdAt: string;
  updatedAt?: string;
  services?: {
    coverPage?: boolean;
    designing?: boolean;
    formatting?: boolean;
    copyright?: boolean;
  };
  payment?: {
    totalAmount?: number;
    paidAmount?: number;
    pendingAmount?: number;
    installmentOption?: number;
    lastPaymentDate?: string;
  };
  paymentStatus?: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    paymentCompletionPercentage: number;
  };
  platformWiseSales?: Record<string, { sellingUnits: number; productLink?: string; rating?: number }>;
}

interface PriceField { main: number; discount: number; }
interface PricingConfig {
  _id?: string;
  language?: string;
  publishingPrice?: PriceField;
  coverDesignPrice?: PriceField;
  formattingPrice?: PriceField;
  copyrightPrice?: PriceField;
  distributionPrice?: PriceField;
  perBookCopyPrice?: PriceField;
  benefits?: string[];
  referralConfig?: { firstBookBonus: number; perReferralBonus: number };
  platforms?: string[];
  installmentOptions?: any[];
}

interface WizardFormData {
  // Step 1
  bookName: string;
  language: string;
  bookType: string;
  subtitle: string;
  targetAudience: string;
  expectedLaunchDate: string;
  // Step 2
  needCoverPage: boolean;
  coverPageFile: File | null;
  needFormatting: boolean;
  needCopyright: boolean;
  needDesigning: boolean;
  physicalCopies: number;
  manuscriptFiles: File[];
  // Step 3
  selectedPlatforms: string[];
  // Step 4
  paymentPlan: '100' | '50' | '25' | 'later';
}

type ViewMode = 'listing' | 'detail' | 'add';

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

const StepIndicator: React.FC<{ currentStep: number; steps: string[] }> = ({ currentStep, steps }) => (
  <div className="w-full mb-8">
    <div className="flex items-center justify-between">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isComplete = stepNum < currentStep;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isComplete
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/40'
                    : 'bg-neutral-200 dark:bg-dark-300 text-neutral-500 dark:text-dark-500'
                }`}
              >
                {isComplete ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center hidden sm:block ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : isComplete
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-neutral-400 dark:text-dark-400'
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                  stepNum < currentStep
                    ? 'bg-emerald-500'
                    : 'bg-neutral-200 dark:bg-dark-300'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const Books: React.FC = () => {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('listing');
  const [selectedBook, setSelectedBook] = useState<BookData | null>(null);

  // Listing state
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail state
  const [detailLoading, setDetailLoading] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WizardFormData>({
    bookName: '',
    language: '',
    bookType: '',
    subtitle: '',
    targetAudience: '',
    expectedLaunchDate: '',
    needCoverPage: false,
    coverPageFile: null,
    needFormatting: false,
    needCopyright: false,
    needDesigning: false,
    physicalCopies: 2,
    manuscriptFiles: [],
    selectedPlatforms: [],
    paymentPlan: '100',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Pricing
  const [availableLanguages, setAvailableLanguages] = useState<PricingConfig[]>([]);
  const [dynamicBookTypes, setDynamicBookTypes] = useState<string[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Expand states
  const [showBenefits, setShowBenefits] = useState(false);

  // Drag state for file upload
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Razorpay payment state
  const [payingBook, setPayingBook] = useState<BookData | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ===========================================================================
  // Data fetching
  // ===========================================================================

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_MY_BOOKS);
      const data = res.data?.data || res.data || {};
      const booksArr = data.books || data.data || data || [];
      setBooks(Array.isArray(booksArr) ? booksArr : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to fetch books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookDetail = useCallback(async (bookId: string) => {
    setDetailLoading(true);
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_BOOK_DETAIL(bookId));
      const bookData = res.data?.data?.book || res.data?.data || res.data;
      setSelectedBook(bookData);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to fetch book details');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchPaymentConfigs = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.PAYMENT_CONFIG.GET_PUBLIC);
      const data = res.data?.data;
      const configs = data?.configs || data || res.data || [];
      setAvailableLanguages(Array.isArray(configs) ? configs : [configs]);
      if (data?.bookTypes) setDynamicBookTypes(data.bookTypes);
    } catch {
      setAvailableLanguages([]);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // ===========================================================================
  // Price calculation helpers
  // ===========================================================================

  const disc = (p?: PriceField) => {
    if (!p) return 0;
    return p.main - Math.round((p.main * p.discount) / 100);
  };

  const priceBreakdown = useMemo(() => {
    if (!pricingConfig) return null;
    const p = pricingConfig;
    const freeCopies = 2;
    const extraCopies = Math.max(0, formData.physicalCopies - freeCopies);

    const rows: Array<{ label: string; original: number; discountedPrice: number; show: boolean }> = [
      {
        label: 'Book Publishing',
        original: p.publishingPrice?.main || 0,
        discountedPrice: disc(p.publishingPrice),
        show: true,
      },
      {
        label: 'Cover Design',
        original: p.coverDesignPrice?.main || 0,
        discountedPrice: disc(p.coverDesignPrice),
        show: formData.needCoverPage,
      },
      {
        label: 'Book Designing',
        original: p.formattingPrice?.main || 0,
        discountedPrice: disc(p.formattingPrice),
        show: formData.needDesigning,
      },
      {
        label: 'Copyright',
        original: p.copyrightPrice?.main || 0,
        discountedPrice: disc(p.copyrightPrice),
        show: formData.needCopyright,
      },
      {
        label: `Physical Copies (${extraCopies} extra)`,
        original: extraCopies * (p.perBookCopyPrice?.main || 0),
        discountedPrice: extraCopies * disc(p.perBookCopyPrice),
        show: true,
      },
      {
        label: 'Distribution',
        original: p.distributionPrice?.main || 0,
        discountedPrice: disc(p.distributionPrice),
        show: true,
      },
    ];

    const visibleRows = rows.filter((r) => r.show);
    const totalOriginal = visibleRows.reduce((sum, r) => sum + r.original, 0);
    const totalDiscounted = visibleRows.reduce((sum, r) => sum + r.discountedPrice, 0);
    const totalDiscount = totalOriginal - totalDiscounted;
    const referralDiscount = 0;
    const netPayable = totalDiscounted - referralDiscount;

    return { rows: visibleRows, totalOriginal, totalDiscounted, totalDiscount, referralDiscount, netPayable };
  }, [pricingConfig, formData.needCoverPage, formData.needCopyright, formData.needDesigning, formData.physicalCopies]);

  // ===========================================================================
  // Handlers
  // ===========================================================================

  const openAddWizard = () => {
    setFormData({
      bookName: '',
      language: '',
      bookType: '',
      subtitle: '',
      targetAudience: '',
      expectedLaunchDate: '',
      needCoverPage: false,
      coverPageFile: null,
      needFormatting: false,
      needCopyright: false,
      needDesigning: false,
      physicalCopies: 2,
      manuscriptFiles: [],
      selectedPlatforms: [],
      paymentPlan: '100',
    });
    setFormErrors({});
    setWizardStep(1);
    setPricingConfig(null);
    setShowBenefits(false);
    fetchPaymentConfigs();
    setViewMode('add');
  };

  const openDetail = (book: BookData) => {
    setSelectedBook(book);
    setShowFiles(false);
    setViewMode('detail');
    fetchBookDetail(book.bookId || book._id);
  };

  const backToListing = () => {
    setViewMode('listing');
    setSelectedBook(null);
    fetchBooks();
  };

  // Wizard navigation
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.bookName.trim()) errs.bookName = 'Book name is required';
    if (!formData.language) errs.language = 'Language is required';
    if (!formData.bookType) errs.bookType = 'Book type is required';
    if (!formData.expectedLaunchDate) errs.expectedLaunchDate = 'Launch date is required';
    const minDate = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; })();
    if (formData.expectedLaunchDate && formData.expectedLaunchDate < minDate) {
      errs.expectedLaunchDate = 'Launch date must be at least 7 days from today';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (formData.needCoverPage && formData.coverPageFile) {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowed.includes(formData.coverPageFile.type)) {
        errs.coverPageFile = 'Only JPG/PNG files are allowed';
      }
      if (formData.coverPageFile.size > 10 * 1024 * 1024) {
        errs.coverPageFile = 'Cover image must be less than 10MB';
      }
    }
    if (formData.physicalCopies < 2) errs.physicalCopies = 'Minimum 2 physical copies required';
    // Validate total manuscript file size
    const totalSize = formData.manuscriptFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 200 * 1024 * 1024) {
      errs.manuscriptFiles = 'Total file size cannot exceed 200MB';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (wizardStep === 1) {
      if (!validateStep1()) {
        toast.error('Please fill all required fields');
        return;
      }
      // Fetch pricing for the selected language
      const selectedConfig = availableLanguages.find(
        (c) => c.language?.toLowerCase() === formData.language.toLowerCase()
      );
      if (selectedConfig) {
        setPricingConfig(selectedConfig);
      } else if (formData.language) {
        // Try fetching from API with language param
        fetchPricingForLanguage(formData.language);
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      if (!validateStep2()) {
        toast.error('Please fix the errors before continuing');
        return;
      }
      setWizardStep(3);
    } else if (wizardStep === 3) {
      setWizardStep(4);
    }
  };

  const handlePrevStep = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  const fetchPricingForLanguage = async (language: string) => {
    setPricingLoading(true);
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.PAYMENT_CONFIG.GET_PUBLIC);
      const data = res.data?.data;
      const configs = data?.configs || data || [];
      const list = Array.isArray(configs) ? configs : [configs];
      const match = list.find((c: any) => c.language?.toLowerCase() === language.toLowerCase());
      setPricingConfig(match || null);
    } catch {
      setPricingConfig(null);
    } finally {
      setPricingLoading(false);
    }
  };

  // File handling
  const handleManuscriptFiles = (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    const validFiles = fileArr.filter((f) => {
      if (!allowedTypes.includes(f.type)) {
        toast.error(`${f.name}: Only PDF, DOC, DOCX and image files are allowed`);
        return false;
      }
      return true;
    });

    const newFiles = [...formData.manuscriptFiles, ...validFiles];
    const totalSize = newFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 200 * 1024 * 1024) {
      toast.error('Total file size cannot exceed 200MB');
      return;
    }

    setFormData((prev) => ({ ...prev, manuscriptFiles: newFiles }));
  };

  const removeManuscriptFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      manuscriptFiles: prev.manuscriptFiles.filter((_, i) => i !== index),
    }));
  };

  // Drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleManuscriptFiles(e.dataTransfer.files);
    }
  };

  // Platform toggle
  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platform)
        ? prev.selectedPlatforms.filter((p) => p !== platform)
        : [...prev.selectedPlatforms, platform],
    }));
  };

  const toggleAllPlatforms = () => {
    if (formData.selectedPlatforms.length === DEFAULT_PLATFORMS.length) {
      setFormData((prev) => ({ ...prev, selectedPlatforms: [] }));
    } else {
      setFormData((prev) => ({ ...prev, selectedPlatforms: [...DEFAULT_PLATFORMS] }));
    }
  };

  // Submit
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        bookName: formData.bookName,
        subtitle: formData.subtitle || undefined,
        bookType: formData.bookType,
        targetAudience: formData.targetAudience || undefined,
        language: formData.language,
        needFormatting: formData.needFormatting,
        needCopyright: formData.needCopyright,
        needDesigning: formData.needDesigning,
        needCoverPage: formData.needCoverPage,
        physicalCopies: formData.physicalCopies,
        royaltyPercentage: 70,
        expectedLaunchDate: formData.expectedLaunchDate,
        marketplaces: formData.selectedPlatforms,
        services: {
          coverPage: formData.needCoverPage,
          designing: formData.needDesigning,
          formatting: formData.needFormatting,
          copyright: formData.needCopyright,
        },
        platforms: formData.selectedPlatforms,
        paymentPlan: formData.paymentPlan === '100' ? 'full'
          : formData.paymentPlan === '50' ? '2_installments'
          : formData.paymentPlan === '25' ? '4_installments'
          : 'pay_later',
        hasCover: formData.needCoverPage,
      };

      let res;
      if (editingBookId) {
        res = await axiosInstance.put(API_ENDPOINTS.BOOKS.UPDATE_BOOK(editingBookId), payload);
      } else {
        res = await axiosInstance.post(API_ENDPOINTS.BOOKS.CREATE_BOOK, payload);
      }
      const createdBook = res.data?.data?.book || res.data?.data || res.data;
      const bookId = editingBookId || createdBook?.bookId || createdBook?._id;

      // Upload cover if provided
      if (bookId && formData.needCoverPage && formData.coverPageFile) {
        try {
          await bookService.uploadCover(bookId, formData.coverPageFile);
        } catch {
          toast.error('Book created but cover upload failed. You can upload it later.');
        }
      }

      // Upload manuscript files if any
      if (bookId && formData.manuscriptFiles.length > 0) {
        try {
          await bookService.uploadFiles(bookId, formData.manuscriptFiles);
        } catch {
          toast.error('Book created but file upload failed. You can upload files later.');
        }
      }

      toast.success(editingBookId ? 'Book updated successfully!' : 'Book submitted successfully! Payment processing...');
      setEditingBookId(null);
      setViewMode('listing');
      fetchBooks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit book');
    } finally {
      setSubmitting(false);
    }
  };

  // Razorpay payment handler
  const handlePayNow = async (book: BookData) => {
    setPayingBook(book);
    setPaymentLoading(true);
    try {
      const res = await axiosInstance.post(API_ENDPOINTS.PAYMENT.CREATE_ORDER, { bookId: book.bookId });
      const { orderId, amount, currency, keyId, bookName, authorName } = res.data.data;

      const options: any = {
        key: keyId,
        amount: amount * 100,
        currency,
        name: 'POVITAL',
        description: `Payment for "${bookName}"`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            await axiosInstance.post(API_ENDPOINTS.PAYMENT.VERIFY, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookId: book.bookId,
            });
            toast.success('Payment successful! Book submitted for approval.');
            fetchBooks();
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: authorName },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => { setPayingBook(null); setPaymentLoading(false); },
        },
      };

      // Load Razorpay script dynamically if not present
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay'));
          document.head.appendChild(script);
        });
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
      setPayingBook(null);
    }
  };

  // Helpers
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getPaymentInfo = (book: BookData) => {
    const payment = book.payment || book.paymentStatus;
    if (!payment) return { isPaid: false, paidAmount: 0, pendingAmount: 0, totalAmount: 0 };
    const total = payment.totalAmount || 0;
    const paid = payment.paidAmount || 0;
    const pending = payment.pendingAmount || total - paid;
    return { isPaid: pending <= 0, paidAmount: paid, pendingAmount: pending, totalAmount: total };
  };

  const minLaunchDate = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; })();

  // ===========================================================================
  // VIEW 1: Books Listing
  // ===========================================================================

  const renderListing = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Loading your books..." />
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">Books Listing</h1>
          <button
            onClick={openAddWizard}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-body-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            New Book
          </button>
        </div>

        {/* Books Table / Empty State */}
        {books.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-dark-200 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-neutral-400 dark:text-dark-400" />
            </div>
            <h3 className="text-h4 font-semibold text-neutral-700 dark:text-dark-700 mb-2">
              No books yet
            </h3>
            <p className="text-body-sm text-neutral-500 dark:text-dark-500 mb-6">
              Click 'New Book' to submit your first book!
            </p>
            <button
              onClick={openAddWizard}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-body-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              New Book
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-dark-100 border-b border-neutral-200 dark:border-dark-300">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">
                      Book ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">
                      Book Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">
                      Selling Units
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">
                      Net Earnings
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">
                      Launch Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase tracking-wider">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-dark-200">
                  {books.map((book) => {
                    const payInfo = getPaymentInfo(book);
                    return (
                      <React.Fragment key={book._id || book.bookId}>
                        {/* Main row */}
                        <tr className="hover:bg-neutral-50 dark:hover:bg-dark-100/50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-body-xs font-mono text-neutral-500 dark:text-dark-500">
                              {book.bookId || '--'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openDetail(book)}
                              className="text-body-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline text-left"
                            >
                              {book.bookName}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={book.status} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-body-sm text-neutral-700 dark:text-dark-700">
                              {book.totalSellingUnits || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-body-sm text-neutral-700 dark:text-dark-700">
                              Rs {formatCurrency(book.totalRevenue || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-body-sm text-neutral-600 dark:text-dark-600">
                              {formatDate(book.expectedLaunchDate || book.actualLaunchDate)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {payInfo.isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                <CheckCircle2 className="w-3 h-3" />
                                Paid
                              </span>
                            ) : (
                              <button
                                onClick={() => handlePayNow(book)}
                                disabled={paymentLoading && payingBook?.bookId === book.bookId}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white transition-colors"
                              >
                                {paymentLoading && payingBook?.bookId === book.bookId
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <IndianRupee className="w-3 h-3" />
                                }
                                Pay Now
                              </button>
                            )}
                          </td>
                        </tr>
                        {/* Platform sales sub-row */}
                        <tr className="bg-neutral-50/50 dark:bg-dark-100/30">
                          <td colSpan={7} className="px-4 py-2">
                            <div className="flex flex-wrap items-center gap-4 text-body-xs text-neutral-500 dark:text-dark-500">
                              <span className="font-medium text-neutral-400 dark:text-dark-400">Platform Sales:</span>
                              {SALE_PLATFORMS.map((platform) => {
                                const sales =
                                  book.platformWiseSales &&
                                  typeof book.platformWiseSales === 'object'
                                    ? (book.platformWiseSales as any)[platform]?.sellingUnits || 0
                                    : 0;
                                return (
                                  <span key={platform} className="inline-flex items-center gap-1">
                                    <span className="font-medium">{platform}</span>
                                    <span className="text-neutral-400 dark:text-dark-400">{sales}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ===========================================================================
  // VIEW 2: Book Detail
  // ===========================================================================

  const renderDetail = () => {
    if (detailLoading && !selectedBook) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Loading book details..." />
        </div>
      );
    }

    if (!selectedBook) return null;

    const book = selectedBook;
    const payInfo = getPaymentInfo(book);
    const services = book.services || {
      coverPage: !!book.coverPage,
      designing: book.needDesigning ?? false,
      formatting: book.needFormatting ?? false,
      copyright: book.needCopyright ?? false,
    };

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={backToListing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-body-sm font-medium text-neutral-600 dark:text-dark-600 hover:text-neutral-900 dark:hover:text-dark-900 hover:bg-neutral-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Books
          </button>
          {(book.status === 'draft' || book.status === 'rejected') && (
            <button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  bookName: book.bookName || '',
                  language: book.language || '',
                  bookType: book.bookType || '',
                  subtitle: book.subtitle || '',
                  targetAudience: book.targetAudience || '',
                  expectedLaunchDate: book.expectedLaunchDate ? new Date(book.expectedLaunchDate).toISOString().split('T')[0] : '',
                  physicalCopies: book.physicalCopies ?? 2,
                  needCoverPage: !!book.coverPage,
                  coverPageFile: null,
                  manuscriptFiles: [],
                  needFormatting: book.needFormatting ?? false,
                  needCopyright: book.needCopyright ?? false,
                  needDesigning: book.needDesigning ?? false,
                  paymentPlan: '100',
                  selectedPlatforms: book.marketplaces || [],
                }));
                setEditingBookId(book.bookId);
                setWizardStep(1);
                setViewMode('add');
              }}
              className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit Book
            </button>
          )}
        </div>

        {/* Book info card */}
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cover image */}
            <div className="flex-shrink-0">
              {book.coverPage ? (
                <img
                  src={book.coverPage}
                  alt={book.bookName}
                  className="w-40 h-56 object-cover rounded-xl border border-neutral-200 dark:border-dark-300 shadow-sm"
                />
              ) : (
                <div className="w-40 h-56 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-neutral-200 dark:border-dark-300 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-indigo-300 dark:text-indigo-600" />
                </div>
              )}
            </div>

            {/* Book details */}
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-body-xs font-mono text-neutral-500 dark:text-dark-500 bg-neutral-100 dark:bg-dark-200 px-2 py-0.5 rounded">
                    {book.bookId || '--'}
                  </span>
                  <StatusBadge status={book.status} />
                </div>
                <h2 className="text-h3 font-bold text-neutral-900 dark:text-dark-900">
                  {book.bookName}
                </h2>
                {book.subtitle && (
                  <p className="text-body text-neutral-600 dark:text-dark-600 mt-1">
                    {book.subtitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-body-xs text-neutral-400 dark:text-dark-400 uppercase tracking-wide font-medium">
                    Language
                  </p>
                  <p className="text-body-sm font-medium text-neutral-800 dark:text-dark-800">
                    {book.language || '--'}
                  </p>
                </div>
                <div>
                  <p className="text-body-xs text-neutral-400 dark:text-dark-400 uppercase tracking-wide font-medium">
                    Type
                  </p>
                  <p className="text-body-sm font-medium text-neutral-800 dark:text-dark-800">
                    {book.bookType || '--'}
                  </p>
                </div>
                <div>
                  <p className="text-body-xs text-neutral-400 dark:text-dark-400 uppercase tracking-wide font-medium">
                    Entry Date
                  </p>
                  <p className="text-body-sm font-medium text-neutral-800 dark:text-dark-800">
                    {formatDate(book.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-body-xs text-neutral-400 dark:text-dark-400 uppercase tracking-wide font-medium">
                    Launch Date
                  </p>
                  <p className="text-body-sm font-medium text-neutral-800 dark:text-dark-800">
                    {formatDate(book.expectedLaunchDate || book.actualLaunchDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Including */}
        <div className="card p-6">
          <h3 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900 mb-4">
            Services Including
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-body-xs text-neutral-500 dark:text-dark-500">Language:</span>
              <span className="text-body-sm font-medium text-neutral-800 dark:text-dark-800">
                {book.language || '--'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-xs text-neutral-500 dark:text-dark-500">Cover Page:</span>
              {services.coverPage ? (
                <span className="text-green-600 dark:text-green-400 text-body-sm font-medium">Yes</span>
              ) : (
                <span className="text-neutral-400 dark:text-dark-400 text-body-sm">No</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-xs text-neutral-500 dark:text-dark-500">Designing:</span>
              {services.designing ? (
                <span className="text-green-600 dark:text-green-400 text-body-sm font-medium">Yes</span>
              ) : (
                <span className="text-neutral-400 dark:text-dark-400 text-body-sm">No</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-xs text-neutral-500 dark:text-dark-500">Formatting:</span>
              {services.formatting ? (
                <span className="text-green-600 dark:text-green-400 text-body-sm font-medium">Yes</span>
              ) : (
                <span className="text-neutral-400 dark:text-dark-400 text-body-sm">No</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-xs text-neutral-500 dark:text-dark-500">Copyright:</span>
              {services.copyright ? (
                <span className="text-green-600 dark:text-green-400 text-body-sm font-medium">Yes</span>
              ) : (
                <span className="text-neutral-400 dark:text-dark-400 text-body-sm">No</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-xs text-neutral-500 dark:text-dark-500">Royalty %:</span>
              <span className="text-body-sm font-medium text-neutral-800 dark:text-dark-800">
                {book.royaltyPercentage ?? 70}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-xs text-neutral-500 dark:text-dark-500">Net Payment %:</span>
              <span className="text-body-sm font-medium text-neutral-800 dark:text-dark-800">
                {100 - (book.royaltyPercentage ?? 70)}%
              </span>
            </div>
          </div>

          {/* View Files */}
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-dark-200">
            <button
              onClick={() => setShowFiles(!showFiles)}
              className="inline-flex items-center gap-2 text-body-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showFiles ? 'Hide Files' : 'View Files'}
              {showFiles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showFiles && (
              <div className="mt-3 space-y-2">
                {book.uploadedFiles && book.uploadedFiles.length > 0 ? (
                  book.uploadedFiles.map((file, idx) => {
                    const fileUrl = typeof file === 'string' ? file : file.url;
                    const fileName = typeof file === 'string' ? `File ${idx + 1}` : file.name || `File ${idx + 1}`;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 bg-neutral-50 dark:bg-dark-100 rounded-lg"
                      >
                        <FileText className="w-4 h-4 text-neutral-400 dark:text-dark-400 flex-shrink-0" />
                        <span className="text-body-sm text-neutral-700 dark:text-dark-700 flex-1 truncate">
                          {fileName}
                        </span>
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-body-sm text-neutral-400 dark:text-dark-400">
                    No files uploaded yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="card p-6">
          <h3 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900 mb-4">
            Payment Details
          </h3>

          {/* Price breakdown table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-dark-300">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase">
                    Detail
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-dark-200">
                <tr>
                  <td className="px-3 py-2 text-body-sm text-neutral-700 dark:text-dark-700">
                    Total Amount
                  </td>
                  <td className="px-3 py-2 text-body-sm text-right font-medium text-neutral-800 dark:text-dark-800">
                    Rs {formatCurrency(payInfo.totalAmount)}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-body-sm text-neutral-700 dark:text-dark-700">
                    Paid Amount
                  </td>
                  <td className="px-3 py-2 text-body-sm text-right font-medium text-green-600 dark:text-green-400">
                    Rs {formatCurrency(payInfo.paidAmount)}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-body-sm text-neutral-700 dark:text-dark-700">
                    Pending Amount
                  </td>
                  <td className="px-3 py-2 text-body-sm text-right font-medium text-orange-600 dark:text-orange-400">
                    Rs {formatCurrency(payInfo.pendingAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Last Payment info */}
          {book.payment?.lastPaymentDate && (
            <p className="text-body-xs text-neutral-500 dark:text-dark-500 mb-4">
              Last Payment: {formatDate(book.payment.lastPaymentDate)} - Rs{' '}
              {formatCurrency(book.payment.paidAmount || 0)}
            </p>
          )}

          {/* Pay button */}
          {!payInfo.isPaid && payInfo.pendingAmount > 0 && (
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-body-sm font-medium rounded-lg shadow-sm transition-colors duration-200">
              <IndianRupee className="w-4 h-4" />
              Pay Rs {formatCurrency(payInfo.pendingAmount)}
            </button>
          )}
        </div>

        {/* Platform Selling Stats */}
        <div className="card p-6">
          <h3 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900 mb-4">
            Platform Selling Stats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SALE_PLATFORMS.map((platform) => {
              const sales =
                book.platformWiseSales && typeof book.platformWiseSales === 'object'
                  ? (book.platformWiseSales as any)[platform]?.sellingUnits || 0
                  : 0;
              return (
                <div
                  key={platform}
                  className="p-4 bg-neutral-50 dark:bg-dark-100 rounded-xl text-center"
                >
                  <p className="text-body-xs text-neutral-500 dark:text-dark-500 font-medium mb-1">
                    {platform}
                  </p>
                  <p className="text-h4 font-bold text-neutral-900 dark:text-dark-900">{sales}</p>
                  <p className="text-body-xs text-neutral-400 dark:text-dark-400">units sold</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ===========================================================================
  // VIEW 3: Add Book - Multi-Step Wizard
  // ===========================================================================

  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Book Name */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
          Book Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.bookName}
          onChange={(e) => setFormData((p) => ({ ...p, bookName: e.target.value }))}
          placeholder="Enter your book name"
          className={`w-full px-4 py-2.5 rounded-lg border ${
            formErrors.bookName
              ? 'border-red-400 focus:ring-red-500'
              : 'border-neutral-300 dark:border-dark-300 focus:ring-indigo-500'
          } bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
        />
        {formErrors.bookName && (
          <p className="text-red-500 text-xs mt-1">{formErrors.bookName}</p>
        )}
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
          Book Language <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={formData.language}
            onChange={(e) => setFormData((p) => ({ ...p, language: e.target.value }))}
            className={`w-full px-4 py-2.5 rounded-lg border ${
              formErrors.language
                ? 'border-red-400 focus:ring-red-500'
                : 'border-neutral-300 dark:border-dark-300 focus:ring-indigo-500'
            } bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:border-transparent appearance-none transition-all duration-200`}
          >
            <option value="">-- Select Language --</option>
            {availableLanguages.map((cfg, idx) => (
              <option key={cfg._id || cfg.language || idx} value={cfg.language || ''}>
                {cfg.language || `Language ${idx + 1}`}
              </option>
            ))}
            {availableLanguages.length === 0 && (
              <>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Odia">Odia</option>
                <option value="Bengali">Bengali</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
                <option value="Kannada">Kannada</option>
                <option value="Marathi">Marathi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Other">Other</option>
              </>
            )}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
        {formErrors.language && (
          <p className="text-red-500 text-xs mt-1">{formErrors.language}</p>
        )}
      </div>

      {/* Book Type */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
          Book Type <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={formData.bookType}
            onChange={(e) => setFormData((p) => ({ ...p, bookType: e.target.value }))}
            className={`w-full px-4 py-2.5 rounded-lg border ${
              formErrors.bookType
                ? 'border-red-400 focus:ring-red-500'
                : 'border-neutral-300 dark:border-dark-300 focus:ring-indigo-500'
            } bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:border-transparent appearance-none transition-all duration-200`}
          >
            <option value="">-- Select Book Type --</option>
            {dynamicBookTypes.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
        {formErrors.bookType && (
          <p className="text-red-500 text-xs mt-1">{formErrors.bookType}</p>
        )}
        {formData.bookType === 'Other' && (
          <input
            type="text"
            value={(formData as any).customBookType || ''}
            onChange={(e) => setFormData((p) => ({ ...p, customBookType: e.target.value }))}
            placeholder="Enter custom book type"
            className="w-full mt-2 px-4 py-2.5 text-sm border border-neutral-300 dark:border-dark-300 rounded-xl bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
      </div>

      {/* Title / Subtitle */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
          Book Title / Subtitle
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData((p) => ({ ...p, subtitle: e.target.value }))}
          placeholder="Enter subtitle (optional)"
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-dark-300 bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
          Target Audience
        </label>
        <input
          type="text"
          value={formData.targetAudience}
          onChange={(e) => setFormData((p) => ({ ...p, targetAudience: e.target.value }))}
          placeholder="e.g., Young Adults, Students, Professionals..."
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-dark-300 bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Expected Launch Date */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
          Expected Launch Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.expectedLaunchDate}
          min={minLaunchDate}
          onChange={(e) => setFormData((p) => ({ ...p, expectedLaunchDate: e.target.value }))}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            formErrors.expectedLaunchDate
              ? 'border-red-400 focus:ring-red-500'
              : 'border-neutral-300 dark:border-dark-300 focus:ring-indigo-500'
          } bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
        />
        {formErrors.expectedLaunchDate && (
          <p className="text-red-500 text-xs mt-1">{formErrors.expectedLaunchDate}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Cover Page */}
      <div className="p-4 bg-neutral-50 dark:bg-dark-100 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-dark-700">
              Book Cover
            </label>
            {formData.needCoverPage && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                Admin will design the cover for you
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, needCoverPage: false, coverPageFile: null }))}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                !formData.needCoverPage
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-neutral-200 dark:bg-dark-300 text-neutral-500 dark:text-dark-500 hover:bg-neutral-300'
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, needCoverPage: true }))}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                formData.needCoverPage
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-neutral-200 dark:bg-dark-300 text-neutral-500 dark:text-dark-500 hover:bg-neutral-300'
              }`}
            >
              Yes
            </button>
          </div>
        </div>
      </div>

      {/* Service toggles */}
      {[
        { key: 'needFormatting' as const, label: 'Need Formatting?' },
        { key: 'needCopyright' as const, label: 'Need Copyright?' },
        { key: 'needDesigning' as const, label: 'Need Book Designing?' },
      ].map((svc) => (
        <div
          key={svc.key}
          className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-dark-100 rounded-xl"
        >
          <label className="text-sm font-medium text-neutral-700 dark:text-dark-700">
            {svc.label}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, [svc.key]: false }))}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                !formData[svc.key]
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-neutral-200 dark:bg-dark-300 text-neutral-500 dark:text-dark-500 hover:bg-neutral-300'
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, [svc.key]: true }))}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                formData[svc.key]
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-neutral-200 dark:bg-dark-300 text-neutral-500 dark:text-dark-500 hover:bg-neutral-300'
              }`}
            >
              Yes
            </button>
          </div>
        </div>
      ))}

      {/* Physical Copies */}
      <div className="p-4 bg-neutral-50 dark:bg-dark-100 rounded-xl">
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
          Physical Copies Needed
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={2}
            value={formData.physicalCopies}
            onChange={(e) =>
              setFormData((p) => ({ ...p, physicalCopies: Math.max(2, parseInt(e.target.value) || 2) }))
            }
            className={`w-28 px-4 py-2.5 rounded-lg border ${
              formErrors.physicalCopies
                ? 'border-red-400 focus:ring-red-500'
                : 'border-neutral-300 dark:border-dark-300 focus:ring-indigo-500'
            } bg-white dark:bg-dark-50 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
          />
          <span className="text-body-xs text-emerald-600 dark:text-emerald-400 font-medium">
            2 copies free
          </span>
        </div>
        {formErrors.physicalCopies && (
          <p className="text-red-500 text-xs mt-1">{formErrors.physicalCopies}</p>
        )}
      </div>

      {/* Manuscript Upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-2">
          Upload Manuscript Files
        </label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleManuscriptFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full py-8 px-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-neutral-300 dark:border-dark-400 hover:border-indigo-400 hover:bg-neutral-50 dark:hover:bg-dark-100'
          }`}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-400 dark:text-dark-400" />
          <p className="text-body-sm text-neutral-600 dark:text-dark-600">
            <span className="font-medium text-indigo-600 dark:text-indigo-400">Click to upload</span>{' '}
            or drag and drop
          </p>
          <p className="text-body-xs text-neutral-400 dark:text-dark-400 mt-1">
            PDF, DOC, DOCX, Images - Max 200MB total
          </p>
        </div>

        {formErrors.manuscriptFiles && (
          <p className="text-red-500 text-xs mt-1">{formErrors.manuscriptFiles}</p>
        )}

        {/* Uploaded files list */}
        {formData.manuscriptFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {formData.manuscriptFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-dark-100 rounded-lg border border-neutral-200 dark:border-dark-300"
              >
                <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-neutral-800 dark:text-dark-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-body-xs text-neutral-400 dark:text-dark-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeManuscriptFile(idx);
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <p className="text-body-xs text-neutral-400 dark:text-dark-400">
              Total:{' '}
              {formatFileSize(
                formData.manuscriptFiles.reduce((sum, f) => sum + f.size, 0)
              )}{' '}
              / 200MB
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-indigo-500" />
        <h3 className="text-h4 font-bold text-neutral-900 dark:text-dark-900">
          Unlock the Earning Potential by Authorize to Selling
        </h3>
        <p className="text-body-sm text-neutral-500 dark:text-dark-500 mt-1">
          Select the platforms where you want your book to be available
        </p>
      </div>

      {/* Select All */}
      <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <span className="text-body-sm font-medium text-indigo-700 dark:text-indigo-300">
          Select All Platforms
        </span>
        <button
          type="button"
          onClick={toggleAllPlatforms}
          className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${
            formData.selectedPlatforms.length === DEFAULT_PLATFORMS.length
              ? 'bg-indigo-600'
              : 'bg-neutral-300 dark:bg-dark-400'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              formData.selectedPlatforms.length === DEFAULT_PLATFORMS.length
                ? 'translate-x-5'
                : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Platform list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEFAULT_PLATFORMS.map((platform) => {
          const isSelected = formData.selectedPlatforms.includes(platform);
          return (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-neutral-200 dark:border-dark-300 hover:border-neutral-300 dark:hover:border-dark-400 bg-white dark:bg-dark-100'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-200 dark:bg-dark-300'
                }`}
              >
                {isSelected && <Check className="w-4 h-4" />}
              </div>
              <span
                className={`text-body-sm font-medium ${
                  isSelected
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-neutral-700 dark:text-dark-700'
                }`}
              >
                {platform}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Price Breakdown */}
      <div>
        <h3 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900 mb-4">
          Price Breakdown
        </h3>

        {pricingLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader size="md" text="Loading pricing..." />
          </div>
        ) : priceBreakdown ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-dark-300">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase">
                    Service
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase">
                    Discounted Price
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-dark-500 uppercase">
                    Original Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-dark-200">
                {priceBreakdown.rows.map((row) => (
                  <tr key={row.label}>
                    <td className="px-3 py-2.5 text-body-sm text-neutral-700 dark:text-dark-700">
                      {row.label}
                    </td>
                    <td className="px-3 py-2.5 text-body-sm text-right font-medium text-neutral-900 dark:text-dark-900">
                      Rs {formatCurrency(row.discountedPrice)}
                    </td>
                    <td className="px-3 py-2.5 text-body-sm text-right text-neutral-400 dark:text-dark-400 line-through">
                      Rs {formatCurrency(row.original)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-body-sm">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Pricing information is not available for the selected language. The final price will be calculated after submission.</span>
            </div>
          </div>
        )}
      </div>

      {/* Summary Box */}
      {priceBreakdown && (
        <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-neutral-600 dark:text-dark-600">Net Amount</span>
              <span className="text-body-sm font-bold text-neutral-900 dark:text-dark-900">
                Rs {formatCurrency(priceBreakdown.totalDiscounted)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-neutral-600 dark:text-dark-600">Discount</span>
              <span className="text-body-sm text-red-500 line-through">
                Rs {formatCurrency(priceBreakdown.totalDiscount)}
              </span>
            </div>
            {priceBreakdown.referralDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-neutral-600 dark:text-dark-600">
                  Referral Discount
                </span>
                <span className="text-body-sm text-green-600 dark:text-green-400 font-medium">
                  - Rs {formatCurrency(priceBreakdown.referralDiscount)}
                </span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-indigo-200 dark:border-indigo-700 flex items-center justify-between">
              <span className="text-body font-bold text-indigo-700 dark:text-indigo-300">
                Net Payable
              </span>
              <span className="text-h4 font-bold text-indigo-700 dark:text-indigo-300">
                Rs {formatCurrency(priceBreakdown.netPayable)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Benefits expandable */}
      {pricingConfig?.benefits && pricingConfig.benefits.length > 0 && (
        <div>
          <button
            onClick={() => setShowBenefits(!showBenefits)}
            className="flex items-center gap-2 text-body-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <Info className="w-4 h-4" />
            Check what's free with the price
            {showBenefits ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showBenefits && (
            <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
              <ul className="space-y-2">
                {pricingConfig.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-body-sm text-green-700 dark:text-green-300">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Payment Options */}
      <div>
        <h3 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900 mb-4">
          Payment Options
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: '100' as const, label: 'Pay 100%', desc: 'Full payment', color: 'emerald' },
            { value: '50' as const, label: 'Pay 50%', desc: 'Two installments', color: 'blue' },
            { value: '25' as const, label: 'Pay 25%', desc: 'Four installments', color: 'purple' },
            { value: 'later' as const, label: 'Pay Later', desc: 'Due in 7 days', color: 'amber' },
          ].map((option) => {
            const isSelected = formData.paymentPlan === option.value;
            const colorMap: Record<string, string> = {
              emerald: isSelected
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : '',
              blue: isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : '',
              purple: isSelected
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : '',
              amber: isSelected
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                : '',
            };
            const dotColor: Record<string, string> = {
              emerald: 'bg-emerald-500',
              blue: 'bg-blue-500',
              purple: 'bg-purple-500',
              amber: 'bg-amber-500',
            };

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, paymentPlan: option.value }))}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? colorMap[option.color]
                    : 'border-neutral-200 dark:border-dark-300 hover:border-neutral-300 bg-white dark:bg-dark-100'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex-shrink-0 ${
                    isSelected
                      ? dotColor[option.color]
                      : 'bg-neutral-300 dark:bg-dark-400'
                  }`}
                />
                <div>
                  <p
                    className={`text-body-sm font-semibold ${
                      isSelected
                        ? 'text-neutral-900 dark:text-dark-900'
                        : 'text-neutral-700 dark:text-dark-700'
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-body-xs text-neutral-400 dark:text-dark-400">{option.desc}</p>
                  {priceBreakdown && option.value !== 'later' && (
                    <p className="text-body-xs font-medium text-neutral-600 dark:text-dark-600 mt-0.5">
                      Rs{' '}
                      {formatCurrency(
                        Math.round(
                          priceBreakdown.netPayable *
                            (parseInt(option.value) / 100)
                        )
                      )}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderWizard = () => {
    const steps = ['Book Details', 'Services & Files', 'Marketplace', 'Price & Payment'];

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={backToListing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-body-sm font-medium text-neutral-600 dark:text-dark-600 hover:text-neutral-900 dark:hover:text-dark-900 hover:bg-neutral-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </button>
          <h1 className="text-h3 font-bold text-neutral-900 dark:text-dark-900">Add New Book</h1>
        </div>

        {/* Wizard Card */}
        <div className="card p-6 sm:p-8">
          <StepIndicator currentStep={wizardStep} steps={steps} />

          {/* Step Content */}
          {wizardStep === 1 && renderStep1()}
          {wizardStep === 2 && renderStep2()}
          {wizardStep === 3 && renderStep3()}
          {wizardStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-dark-300">
            <div>
              {wizardStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-body-sm font-medium text-neutral-600 dark:text-dark-600 hover:text-neutral-900 dark:hover:text-dark-900 hover:bg-neutral-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>
            <div>
              {wizardStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-body-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-body-sm font-medium rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit & Pay
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===========================================================================
  // Main Render
  // ===========================================================================

  return (
    <div>
      {viewMode === 'listing' && renderListing()}
      {viewMode === 'detail' && renderDetail()}
      {viewMode === 'add' && renderWizard()}
    </div>
  );
};

export default Books;
