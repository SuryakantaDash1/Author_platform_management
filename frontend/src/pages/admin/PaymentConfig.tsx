import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  Globe,
  Gift,
  Tag,
  Percent,
  X,
  Loader2,
  Languages,
  CreditCard,
  BookOpen,
} from 'lucide-react';
import Modal from '../../components/common/Modal';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SERVICE_KEYS = [
  'publishing',
  'coverDesign',
  'distribution',
  'copyright',
  'formatting',
  'perBookCopy',
] as const;

type ServiceKey = (typeof SERVICE_KEYS)[number];


const DEFAULT_PLATFORMS = [
  'Amazon',
  'Flipkart',
  'Meesho',
  'Snapdeal',
  'Myntra',
  '150+ Other Sellers',
  '1200 Offline Channels',
];

const INSTALLMENT_OPTIONS = [
  { key: 'full', label: 'Pay 100%', description: 'Full payment' },
  { key: 'two', label: '2 Installments', description: '50% + 50%' },
  { key: 'three', label: '3 Installments', description: '25% + 50% + 25%' },
  { key: 'four', label: '4 Installments', description: '25% + 50% + 25% + 0%' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ServicePrice {
  price: number;
  discount: number;
}

interface PaymentConfigData {
  _id: string;
  language: string;
  services: Record<ServiceKey, ServicePrice>;
  installmentOptions: string[];
  referral: {
    firstBookBonus: number;
    perReferralBonus: number;
  };
  platforms: string[];
  benefits: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface FormService {
  price: string;
  discount: string;
}

interface FormState {
  language: string;
  services: Record<ServiceKey, FormService>;
  installmentOptions: string[];
  referral: {
    firstBookBonus: string;
    perReferralBonus: string;
  };
  platforms: string[];
  customPlatform: string;
  benefits: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calcFinalPrice(price: number, discount: number): number {
  return Math.round(price - price * (discount / 100));
}


const emptyFormServices = (): Record<ServiceKey, FormService> => {
  const s: Record<string, FormService> = {};
  for (const k of SERVICE_KEYS) {
    s[k] = { price: '', discount: '0' };
  }
  return s as Record<ServiceKey, FormService>;
};

const initialForm: FormState = {
  language: '',
  services: emptyFormServices(),
  installmentOptions: ['full'],
  referral: { firstBookBonus: '', perReferralBonus: '' },
  platforms: [],
  customPlatform: '',
  benefits: [''],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PaymentConfig: React.FC = () => {
  // ---- State ----
  const [configs, setConfigs] = useState<PaymentConfigData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ---- Panel state (replaces modal) ----
  const [showPanel, setShowPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---- Delete confirm ----
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentConfigData | null>(null);

  // ---- Book Types ----
  const [bookTypes, setBookTypes] = useState<string[]>([]);
  const [newBookType, setNewBookType] = useState('');
  const [savingBookTypes, setSavingBookTypes] = useState(false);

  // =========================================================================
  // Data Fetching
  // =========================================================================

  // Normalize DB shape -> frontend shape
  const normalizeConfig = (raw: any): PaymentConfigData => {
    const mapPrice = (key: string): ServicePrice => {
      // Try frontend shape first (services.xxx.price), then DB shape (xxxPrice.main)
      const svc = raw.services?.[key];
      const dbKeyMap: Record<string, string> = {
        publishing: 'publishingPrice',
        coverDesign: 'coverDesignPrice',
        distribution: 'distributionPrice',
        copyright: 'copyrightPrice',
        formatting: 'formattingPrice',
        perBookCopy: 'perBookCopyPrice',
      };
      const dbObj = raw[dbKeyMap[key] || ''];
      return {
        price: svc?.price ?? dbObj?.main ?? 0,
        discount: svc?.discount ?? dbObj?.discount ?? 0,
      };
    };

    const services: Record<ServiceKey, ServicePrice> = {} as any;
    for (const k of SERVICE_KEYS) services[k] = mapPrice(k);

    // Normalize installmentOptions: DB has [{label, splits}], frontend uses string keys
    const rawOpts = raw.installmentOptions || [];
    const installmentOptions = rawOpts.map((opt: any) => {
      if (typeof opt === 'string') return opt;
      // Map label back to key
      const labelToKey: Record<string, string> = {
        'Full Payment': 'full', '2 Installments': 'two',
        '3 Installments': 'three', '4 Installments': 'four',
      };
      return labelToKey[opt.label] || opt.label || 'full';
    });

    const ref = raw.referral || raw.referralConfig || {};

    return {
      _id: raw._id,
      language: raw.language,
      services,
      installmentOptions,
      referral: {
        firstBookBonus: ref.firstBookBonus ?? 0,
        perReferralBonus: ref.perReferralBonus ?? 0,
      },
      platforms: raw.platforms || [],
      benefits: raw.benefits || [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  };

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_PAYMENT_CONFIG);
      const data = response.data?.data;
      const rawConfigs = data?.configs || data || [];
      setConfigs(Array.isArray(rawConfigs) ? rawConfigs.map(normalizeConfig) : []);
      if (data?.bookTypes) setBookTypes(data.bookTypes);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch payment configurations');
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // =========================================================================
  // Form Helpers
  // =========================================================================

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setErrors({});
  };

  const openCreatePanel = () => {
    resetForm();
    setShowPanel(true);
  };

  const openEditModal = (config: PaymentConfigData) => {
    const services: Record<string, FormService> = {};
    for (const k of SERVICE_KEYS) {
      const svc = config.services?.[k];
      services[k] = {
        price: svc?.price?.toString() ?? '',
        discount: svc?.discount?.toString() ?? '0',
      };
    }

    setForm({
      language: config.language,
      services: services as Record<ServiceKey, FormService>,
      installmentOptions: config.installmentOptions || ['full'],
      referral: {
        firstBookBonus: config.referral?.firstBookBonus?.toString() ?? '',
        perReferralBonus: config.referral?.perReferralBonus?.toString() ?? '',
      },
      platforms: config.platforms || [],
      customPlatform: '',
      benefits: config.benefits?.length ? [...config.benefits] : [''],
    });
    setEditingId(config._id);
    setErrors({});
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    resetForm();
  };

  // =========================================================================
  // Validation
  // =========================================================================

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.language.trim()) {
      errs.language = 'Language name is required';
    } else {
      const duplicate = configs.find(
        (c) =>
          c.language.toLowerCase() === form.language.trim().toLowerCase() && c._id !== editingId
      );
      if (duplicate) errs.language = 'A configuration for this language already exists';
    }

    for (const k of SERVICE_KEYS) {
      const svc = form.services[k];
      const price = parseFloat(svc.price);
      const discount = parseFloat(svc.discount);
      if (svc.price !== '' && (isNaN(price) || price < 0)) {
        errs[`service_${k}_price`] = 'Price must be >= 0';
      }
      if (svc.discount !== '' && (isNaN(discount) || discount < 0 || discount > 100)) {
        errs[`service_${k}_discount`] = 'Discount must be 0-100';
      }
    }

    if (form.platforms.length === 0) {
      errs.platforms = 'Select at least one platform';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // =========================================================================
  // Submit
  // =========================================================================

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      const services: Record<string, { price: number; discount: number }> = {};
      for (const k of SERVICE_KEYS) {
        services[k] = {
          price: parseFloat(form.services[k].price) || 0,
          discount: parseFloat(form.services[k].discount) || 0,
        };
      }

      const payload = {
        language: form.language.trim(),
        services,
        installmentOptions: form.installmentOptions,
        referral: {
          firstBookBonus: parseFloat(form.referral.firstBookBonus) || 0,
          perReferralBonus: parseFloat(form.referral.perReferralBonus) || 0,
        },
        platforms: form.platforms,
        benefits: form.benefits.map((b) => b.trim()).filter(Boolean),
      };

      if (editingId) {
        const response = await axiosInstance.put(
          API_ENDPOINTS.ADMIN.UPDATE_PAYMENT_CONFIG(editingId),
          payload
        );
        if (response.data?.success !== false) {
          toast.success('Payment configuration updated successfully');
        }
      } else {
        const response = await axiosInstance.post(
          API_ENDPOINTS.ADMIN.CREATE_PAYMENT_CONFIG,
          payload
        );
        if (response.data?.success !== false) {
          toast.success('Payment configuration created successfully');
        }
      }

      closePanel();
      fetchConfigs();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to save payment configuration';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // Delete
  // =========================================================================

  const openDeleteConfirm = (config: PaymentConfigData) => {
    setDeleteTarget(config);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(deleteTarget._id);
    try {
      await axiosInstance.delete(API_ENDPOINTS.ADMIN.DELETE_PAYMENT_CONFIG(deleteTarget._id));
      toast.success(`Configuration for "${deleteTarget.language}" deleted`);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchConfigs();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete configuration');
    } finally {
      setDeleting(null);
    }
  };

  // =========================================================================
  // Form Field Handlers
  // =========================================================================

  const updateService = (key: ServiceKey, field: 'price' | 'discount', value: string) => {
    setForm((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [key]: { ...prev.services[key], [field]: value },
      },
    }));
    // Clear related error
    const errKey = `service_${key}_${field}`;
    if (errors[errKey]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[errKey];
        return n;
      });
    }
  };

  const toggleInstallment = (key: string) => {
    setForm((prev) => ({
      ...prev,
      installmentOptions: prev.installmentOptions.includes(key)
        ? prev.installmentOptions.filter((k) => k !== key)
        : [...prev.installmentOptions, key],
    }));
  };

  const togglePlatform = (platform: string) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
    if (errors.platforms) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n.platforms;
        return n;
      });
    }
  };

  const addCustomPlatform = () => {
    const name = form.customPlatform.trim();
    if (!name) return;
    if (form.platforms.includes(name)) {
      toast.error('Platform already added');
      return;
    }
    setForm((prev) => ({
      ...prev,
      platforms: [...prev.platforms, name],
      customPlatform: '',
    }));
    if (errors.platforms) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n.platforms;
        return n;
      });
    }
  };

  // =========================================================================
  // Book Types Management
  // =========================================================================

  const saveBookTypesToServer = async (types: string[]) => {
    setSavingBookTypes(true);
    try {
      await axiosInstance.put('/admin/payment-config/book-types', { bookTypes: types });
      toast.success('Book types updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save book types');
    } finally {
      setSavingBookTypes(false);
    }
  };

  const addBookType = () => {
    const val = newBookType.trim();
    if (!val) return;
    if (bookTypes.some(t => t.toLowerCase() === val.toLowerCase())) {
      toast.error('This book type already exists');
      return;
    }
    const updated = [...bookTypes, val];
    setBookTypes(updated);
    setNewBookType('');
    saveBookTypesToServer(updated);
  };

  const removeBookType = (index: number) => {
    const updated = bookTypes.filter((_, i) => i !== index);
    setBookTypes(updated);
    saveBookTypesToServer(updated);
  };

  // =========================================================================
  // Table price helper
  // =========================================================================

  const renderPriceCell = (svc: ServicePrice | undefined) => {
    if (!svc || svc.price === 0) {
      return <span className="text-gray-400 dark:text-gray-600">--</span>;
    }
    const discounted = calcFinalPrice(svc.price, svc.discount);
    if (svc.discount > 0 && discounted !== svc.price) {
      return (
        <span className="whitespace-nowrap">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{discounted}</span>
          <span className="text-gray-400 dark:text-gray-500 mx-0.5">/</span>
          <span className="line-through text-gray-400 dark:text-gray-500 text-xs">{svc.price}</span>
        </span>
      );
    }
    return <span className="font-semibold text-gray-900 dark:text-gray-100">{svc.price}</span>;
  };

  // =========================================================================
  // Render: Book Types Card
  // =========================================================================

  const renderBookTypesCard = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Book Types</h3>
        {savingBookTypes && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Manage book types that authors can select when adding a book. These appear in the Book Type dropdown.
      </p>

      {/* Add new type */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newBookType}
          onChange={e => setNewBookType(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addBookType()}
          placeholder="Enter new book type..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={addBookType}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Types list */}
      {bookTypes.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4">
          No book types added yet. Add your first book type above.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {bookTypes.map((type, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800"
            >
              {type}
              <button
                onClick={() => removeBookType(i)}
                className="ml-0.5 text-indigo-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // =========================================================================
  // Render: Left Panel - Table
  // =========================================================================

  const renderLeftPanel = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Payment Configuration
        </h2>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : configs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500 dark:text-gray-400">
          <Languages className="w-10 h-10 opacity-40" />
          <p className="text-sm">No configurations found</p>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Book Language
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Onboard Package
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cover Page
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Distribution
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Master Copy
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Copyrights
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {configs.map((config) => {
                const svc = config.services || ({} as Record<ServiceKey, ServicePrice>);
                return (
                  <tr
                    key={config._id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                      editingId === config._id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {config.language}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {renderPriceCell(svc.publishing)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {renderPriceCell(svc.coverDesign)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {renderPriceCell(svc.distribution)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {renderPriceCell(svc.perBookCopy)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {renderPriceCell(svc.copyright)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(config)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(config)}
                          className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add More button */}
      <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          onClick={openCreatePanel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add More
        </button>
      </div>
    </div>
  );

  // =========================================================================
  // Render: Right Panel - Form
  // =========================================================================

  const renderFormPanel = () => {
    // Find the config being edited (for updatedAt)
    const editingConfig = editingId ? configs.find((c) => c._id === editingId) : null;
    const lastModify = editingConfig?.updatedAt
      ? new Date(editingConfig.updatedAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : null;

    // Form field service rows for the 2-column grid
    const formServiceFields: { key: ServiceKey; label: string }[] = [
      { key: 'publishing', label: 'Book Publish Main Price' },
      { key: 'coverDesign', label: 'Cover Page Main Price' },
      { key: 'distribution', label: 'Distribution Main Price' },
      { key: 'copyright', label: 'Copy Rights Main Price' },
      { key: 'formatting', label: 'Designing Price' },
      { key: 'perBookCopy', label: 'Book Per Piece Price Author' },
    ];

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Payment Configuration for Authors
            </h2>
            <button
              onClick={closePanel}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {lastModify && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last modify: {lastModify}
            </p>
          )}
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-2">
            Standard activation plan
          </p>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Book Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Book Language <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.language}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, language: e.target.value }));
                if (errors.language) {
                  setErrors((prev) => {
                    const n = { ...prev };
                    delete n.language;
                    return n;
                  });
                }
              }}
              placeholder="e.g. English, Hindi, Odia..."
              className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.language
                  ? 'border-red-400 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.language && (
              <p className="mt-1 text-xs text-red-500">{errors.language}</p>
            )}
          </div>

          {/* Service Prices - 2-column grid (Price + Discount per row) */}
          {formServiceFields.map(({ key, label }) => {
            const svc = form.services[key];
            const priceErr = errors[`service_${key}_price`];
            const discountErr = errors[`service_${key}_discount`];

            return (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {label}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={svc.price}
                      onChange={(e) => updateService(key, 'price', e.target.value)}
                      placeholder="Main Price"
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        priceErr
                          ? 'border-red-400 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  </div>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={svc.discount}
                      onChange={(e) => updateService(key, 'discount', e.target.value)}
                      placeholder="Discount %"
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        discountErr
                          ? 'border-red-400 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  </div>
                </div>
                {(priceErr || discountErr) && (
                  <p className="mt-1 text-xs text-red-500">{priceErr || discountErr}</p>
                )}
              </div>
            );
          })}

          {/* Benefits (textarea) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              List of Benefits
            </h3>
            <textarea
              value={form.benefits.join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n');
                setForm((prev) => ({ ...prev, benefits: lines }));
              }}
              rows={5}
              placeholder="Enter each benefit on a new line..."
              className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Each line will be treated as a separate benefit.
            </p>
          </div>

          {/* Referral Configuration */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-indigo-500" />
              Referral Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  1st Bonus Published Bonus
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.referral.firstBookBonus}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        referral: { ...prev.referral, firstBookBonus: e.target.value },
                      }))
                    }
                    placeholder="Example: Rs 500"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Per Referral Bonus
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.referral.perReferralBonus}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        referral: { ...prev.referral, perReferralBonus: e.target.value },
                      }))
                    }
                    placeholder="Example: Rs 500"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Installment Options */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              Installment Options
            </h3>
            <div className="space-y-2">
              {INSTALLMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    form.installmentOptions.includes(opt.key)
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.installmentOptions.includes(opt.key)}
                    onChange={() => toggleInstallment(opt.key)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500" />
              Platforms <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {DEFAULT_PLATFORMS.map((platform) => (
                <label
                  key={platform}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                    form.platforms.includes(platform)
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.platforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="truncate">{platform}</span>
                </label>
              ))}
            </div>

            {/* Custom Platform */}
            <div className="flex gap-2">
              <input
                type="text"
                value={form.customPlatform}
                onChange={(e) => setForm((prev) => ({ ...prev, customPlatform: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomPlatform())}
                placeholder="Add custom platform..."
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={addCustomPlatform}
                className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>

            {/* Show custom platforms as removable chips */}
            {form.platforms.filter((p) => !DEFAULT_PLATFORMS.includes(p)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.platforms
                  .filter((p) => !DEFAULT_PLATFORMS.includes(p))
                  .map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                    >
                      {platform}
                      <button
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className="ml-0.5 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            {errors.platforms && (
              <p className="mt-1 text-xs text-red-500">{errors.platforms}</p>
            )}
          </div>
        </div>

        {/* Footer - Save button */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save & Submit'}
          </button>
        </div>
      </div>
    );
  };

  // =========================================================================
  // Render: Empty Right Panel
  // =========================================================================

  const renderEmptyPanel = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Languages className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        No Configuration Selected
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        Select a language to edit or click &lsquo;+ Add More&rsquo; to create a new payment configuration.
      </p>
    </div>
  );

  // =========================================================================
  // Render: Delete Confirmation Modal
  // =========================================================================

  const renderDeleteConfirm = () => (
    <Modal
      isOpen={showDeleteConfirm}
      onClose={() => {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
      }}
      title="Delete Configuration"
      size="sm"
      footer={
        <>
          <button
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeleteTarget(null);
            }}
            className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!!deleting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Are you sure you want to delete the payment configuration for{' '}
        <strong className="text-gray-900 dark:text-gray-100">{deleteTarget?.language}</strong>?
        This action cannot be undone.
      </p>
    </Modal>
  );

  // =========================================================================
  // Main Render
  // =========================================================================

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Book Types Management - Top Section */}
      {!loading && renderBookTypesCard()}

      {/* Main Section: Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - 1/3 width */}
        <div className="lg:col-span-1">
          {renderLeftPanel()}
        </div>

        {/* Right Panel - 2/3 width */}
        <div className="lg:col-span-2">
          {showPanel ? renderFormPanel() : renderEmptyPanel()}
        </div>
      </div>

      {renderDeleteConfirm()}
    </div>
  );
};

export default PaymentConfig;
