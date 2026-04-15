import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Trash2,
  Building2,
  CreditCard,
  Shield,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

// ---------- Types ----------
interface BankAccount {
  _id: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountType: 'primary' | 'secondary';
  createdAt?: string;
}

interface FormData {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  branchName: string;
  isPrimary: boolean;
}

interface FormErrors {
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
  ifscCode?: string;
  branchName?: string;
}

const initialFormData: FormData = {
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifscCode: '',
  branchName: '',
  isPrimary: false,
};

const INDIAN_BANKS = [
  'Allahabad Bank',
  'Andhra Bank',
  'Axis Bank',
  'Bandhan Bank',
  'Bank of Baroda',
  'Bank of India',
  'Bank of Maharashtra',
  'Canara Bank',
  'Central Bank of India',
  'City Union Bank',
  'Corporation Bank',
  'DCB Bank',
  'Dena Bank',
  'Deutsche Bank',
  'Dhanlaxmi Bank',
  'Federal Bank',
  'HDFC Bank',
  'HSBC Bank',
  'ICICI Bank',
  'IDBI Bank',
  'IDFC First Bank',
  'Indian Bank',
  'Indian Overseas Bank',
  'IndusInd Bank',
  'J&K Bank',
  'Jammu & Kashmir Bank',
  'Karnataka Bank',
  'Karur Vysya Bank',
  'Kotak Mahindra Bank',
  'Lakshmi Vilas Bank',
  'Nainital Bank',
  'Oriental Bank of Commerce',
  'Punjab & Sind Bank',
  'Punjab National Bank',
  'RBL Bank',
  'Saraswat Bank',
  'South Indian Bank',
  'Standard Chartered Bank',
  'State Bank of Bikaner and Jaipur',
  'State Bank of Hyderabad',
  'State Bank of India',
  'State Bank of Mysore',
  'State Bank of Patiala',
  'State Bank of Travancore',
  'Syndicate Bank',
  'Tamilnad Mercantile Bank',
  'UCO Bank',
  'Union Bank of India',
  'United Bank of India',
  'Vijaya Bank',
  'Yes Bank',
];

// ---------- Component ----------
const BankAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<BankAccount | null>(null);
  const [editForm, setEditForm] = useState<Omit<FormData, 'accountNumber' | 'confirmAccountNumber'>>({
    bankName: '', accountHolderName: '', ifscCode: '', branchName: '', isPrimary: false,
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [bankSuggestionsOpen, setBankSuggestionsOpen] = useState(false);
  const [editBankSuggestionsOpen, setEditBankSuggestionsOpen] = useState(false);
  const bankInputRef = useRef<HTMLDivElement>(null);
  const editBankInputRef = useRef<HTMLDivElement>(null);

  // ---------- Fetch accounts ----------
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_BANK_ACCOUNTS);
      if (response.data?.success) {
        const data = response.data.data;
        setAccounts(Array.isArray(data) ? data : data?.bankAccounts || data?.accounts || []);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Close bank suggestion dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bankInputRef.current && !bankInputRef.current.contains(e.target as Node)) {
        setBankSuggestionsOpen(false);
      }
      if (editBankInputRef.current && !editBankInputRef.current.contains(e.target as Node)) {
        setEditBankSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------- Mask account number ----------
  const maskAccountNumber = (num: string): string => {
    if (!num || num.length < 4) return num || '****';
    return '*'.repeat(num.length - 4) + num.slice(-4);
  };

  // ---------- Validate form ----------
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!form.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    if (!form.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d+$/.test(form.accountNumber.trim())) {
      newErrors.accountNumber = 'Account number must contain only digits';
    }

    if (!form.confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Please re-enter the account number';
    } else if (form.accountNumber.trim() !== form.confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    if (!form.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.trim().toUpperCase())) {
      newErrors.ifscCode = 'Invalid IFSC code format (e.g., SBIN0001234)';
    }

    if (!form.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Handle input change ----------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ---------- Submit new account ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        bankName: form.bankName.trim(),
        accountHolderName: form.accountHolderName.trim(),
        accountNumber: form.accountNumber.trim(),
        ifscCode: form.ifscCode.trim().toUpperCase(),
        branchName: form.branchName.trim(),
        accountType: form.isPrimary ? 'primary' : 'secondary',
      };

      const response = await axiosInstance.post(API_ENDPOINTS.AUTHOR.ADD_BANK_ACCOUNT, payload);

      if (response.data?.success) {
        toast.success('Bank account added successfully!');
        setShowAddModal(false);
        setForm(initialFormData);
        setErrors({});
        fetchAccounts();
      } else {
        toast.error(response.data?.message || 'Failed to add bank account');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add bank account');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Delete account ----------
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const response = await axiosInstance.delete(
        API_ENDPOINTS.AUTHOR.DELETE_BANK_ACCOUNT(deleteTarget._id)
      );

      if (response.data?.success) {
        toast.success('Bank account deleted successfully!');
        setDeleteTarget(null);
        fetchAccounts();
      } else {
        toast.error(response.data?.message || 'Failed to delete bank account');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete bank account');
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Close add modal ----------
  const closeAddModal = () => {
    setShowAddModal(false);
    setForm(initialFormData);
    setErrors({});
  };

  // ---------- Open edit modal ----------
  const openEditModal = (account: BankAccount) => {
    setEditTarget(account);
    setEditForm({
      bankName: account.bankName,
      accountHolderName: account.accountHolderName,
      ifscCode: account.ifscCode,
      branchName: account.branchName,
      isPrimary: account.accountType === 'primary',
    });
  };

  // ---------- Submit edit ----------
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!editForm.bankName.trim() || !editForm.accountHolderName.trim() || !editForm.ifscCode.trim() || !editForm.branchName.trim()) {
      toast.error('All fields are required');
      return;
    }
    setEditSubmitting(true);
    try {
      const res = await axiosInstance.put(API_ENDPOINTS.BANK_ACCOUNT.EDIT(editTarget._id), {
        bankName: editForm.bankName.trim(),
        accountHolderName: editForm.accountHolderName.trim(),
        ifscCode: editForm.ifscCode.trim().toUpperCase(),
        branchName: editForm.branchName.trim(),
        accountType: editForm.isPrimary ? 'primary' : 'secondary',
      });
      if (res.data?.success) {
        toast.success('Bank account updated successfully!');
        setEditTarget(null);
        fetchAccounts();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update bank account');
    } finally {
      setEditSubmitting(false);
    }
  };

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading bank accounts..." />
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">
          Bank Accounts
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAccounts}
            className="p-2.5 rounded-lg text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-dark-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-body-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Bank Account
          </button>
        </div>
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="card p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-dark-200 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-neutral-400 dark:text-dark-400" />
            </div>
            <div>
              <h3 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900 mb-1">
                No Bank Accounts
              </h3>
              <p className="text-body-sm text-neutral-500 dark:text-dark-500">
                Add your bank account details to receive royalty payments.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-body-sm font-medium rounded-lg shadow-sm transition-colors duration-200 mt-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Account
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account._id}
              className="card p-5 hover:shadow-md transition-all duration-200 relative"
            >
              {/* Primary Badge */}
              {account.accountType === 'primary' && (
                <div className="absolute top-4 right-4">
                  <Badge variant="success" size="sm" dot>
                    Primary
                  </Badge>
                </div>
              )}

              {/* Bank Icon + Name */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-body font-semibold text-neutral-900 dark:text-dark-900 truncate pr-16">
                    {account.bankName}
                  </h3>
                  <p className="text-body-xs text-neutral-500 dark:text-dark-500">
                    {account.branchName}
                  </p>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-2.5 border-t border-neutral-100 dark:border-dark-300 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-body-xs text-neutral-500 dark:text-dark-500">
                    Account Holder
                  </span>
                  <span className="text-body-sm font-medium text-neutral-800 dark:text-dark-800 truncate ml-2 max-w-[60%] text-right">
                    {account.accountHolderName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-xs text-neutral-500 dark:text-dark-500">
                    Account No.
                  </span>
                  <span className="text-body-sm font-mono font-medium text-neutral-800 dark:text-dark-800">
                    {maskAccountNumber(account.accountNumber)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-xs text-neutral-500 dark:text-dark-500">
                    IFSC Code
                  </span>
                  <span className="text-body-sm font-mono font-medium text-neutral-800 dark:text-dark-800">
                    {account.ifscCode}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-neutral-100 dark:border-dark-300">
                <button
                  onClick={() => openEditModal(account)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-body-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/20 rounded-lg transition-colors duration-200"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(account)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-body-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Add Account Modal ---------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeAddModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-100 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-dark-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-h4 font-semibold text-neutral-900 dark:text-dark-900">
                  Add Bank Account
                </h2>
              </div>
              <button
                onClick={closeAddModal}
                className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-dark-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={bankInputRef}>
                  <input
                    type="text"
                    name="bankName"
                    value={form.bankName}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, bankName: e.target.value }));
                      setBankSuggestionsOpen(true);
                      if (errors.bankName) setErrors((prev) => ({ ...prev, bankName: undefined }));
                    }}
                    onFocus={() => setBankSuggestionsOpen(true)}
                    placeholder="e.g., State Bank of India"
                    autoComplete="off"
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.bankName
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                        : 'border-neutral-300 dark:border-dark-300 focus:ring-indigo-500'
                    } bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 placeholder:text-neutral-400 dark:placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                  />
                  {bankSuggestionsOpen && form.bankName.trim().length > 0 && (() => {
                    const filtered = INDIAN_BANKS.filter(b =>
                      b.toLowerCase().includes(form.bankName.toLowerCase())
                    );
                    return filtered.length > 0 ? (
                      <ul className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-dark-100 border border-neutral-200 dark:border-dark-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filtered.map((bank) => (
                          <li
                            key={bank}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setForm((prev) => ({ ...prev, bankName: bank }));
                              setBankSuggestionsOpen(false);
                            }}
                            className="px-4 py-2.5 text-sm text-neutral-800 dark:text-dark-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer transition-colors"
                          >
                            {bank}
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}
                </div>
                {errors.bankName && (
                  <p className="mt-1 text-body-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.bankName}
                  </p>
                )}
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={form.accountHolderName}
                  onChange={handleChange}
                  placeholder="Name as per bank records"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.accountHolderName
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                      : 'border-neutral-300 dark:border-dark-300 focus:ring-indigo-500'
                  } bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 placeholder:text-neutral-400 dark:placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                />
                {errors.accountHolderName && (
                  <p className="mt-1 text-body-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.accountHolderName}
                  </p>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={(e) => {
                    // Only allow numeric input
                    const value = e.target.value.replace(/\D/g, '');
                    setForm((prev) => ({ ...prev, accountNumber: value }));
                    if (errors.accountNumber) {
                      setErrors((prev) => ({ ...prev, accountNumber: undefined }));
                    }
                  }}
                  placeholder="Enter account number"
                  inputMode="numeric"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.accountNumber
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                      : 'border-neutral-300 dark:border-dark-300 focus:ring-indigo-500'
                  } bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 placeholder:text-neutral-400 dark:placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-body-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.accountNumber}
                  </p>
                )}
              </div>

              {/* Re-enter Account Number */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
                  Re-enter Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="confirmAccountNumber"
                  value={form.confirmAccountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setForm((prev) => ({ ...prev, confirmAccountNumber: value }));
                    if (errors.confirmAccountNumber) {
                      setErrors((prev) => ({ ...prev, confirmAccountNumber: undefined }));
                    }
                  }}
                  placeholder="Re-enter account number"
                  inputMode="numeric"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.confirmAccountNumber
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                      : 'border-neutral-300 dark:border-dark-300 focus:ring-indigo-500'
                  } bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 placeholder:text-neutral-400 dark:placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                />
                {errors.confirmAccountNumber && (
                  <p className="mt-1 text-body-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.confirmAccountNumber}
                  </p>
                )}
              </div>

              {/* IFSC Code */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={form.ifscCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().slice(0, 11);
                    setForm((prev) => ({ ...prev, ifscCode: value }));
                    if (errors.ifscCode) {
                      setErrors((prev) => ({ ...prev, ifscCode: undefined }));
                    }
                  }}
                  placeholder="e.g., SBIN0001234"
                  maxLength={11}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.ifscCode
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                      : 'border-neutral-300 dark:border-dark-300 focus:ring-indigo-500'
                  } bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 placeholder:text-neutral-400 dark:placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 uppercase`}
                />
                {errors.ifscCode && (
                  <p className="mt-1 text-body-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.ifscCode}
                  </p>
                )}
              </div>

              {/* Branch Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-1.5">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="branchName"
                  value={form.branchName}
                  onChange={handleChange}
                  placeholder="e.g., Connaught Place, New Delhi"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.branchName
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                      : 'border-neutral-300 dark:border-dark-300 focus:ring-indigo-500'
                  } bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 placeholder:text-neutral-400 dark:placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                />
                {errors.branchName && (
                  <p className="mt-1 text-body-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.branchName}
                  </p>
                )}
              </div>

              {/* Is Primary Account */}
              <div className="flex items-center gap-3 pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPrimary"
                    checked={form.isPrimary}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 dark:bg-dark-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <div>
                  <span className="text-sm font-medium text-neutral-700 dark:text-dark-700">
                    Set as Primary Account
                  </span>
                  <p className="text-body-xs text-neutral-500 dark:text-dark-500">
                    Primary account will be used for royalty payments
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-dark-300">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-5 py-2.5 text-body-sm font-medium text-neutral-700 dark:text-dark-700 bg-neutral-100 dark:bg-dark-200 hover:bg-neutral-200 dark:hover:bg-dark-300 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-body-sm font-medium rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {submitting ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Delete Confirmation Modal ---------- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white dark:bg-dark-100 rounded-2xl shadow-xl p-6">
            <div className="flex flex-col items-center text-center gap-4">
              {/* Warning Icon */}
              <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>

              <div>
                <h3 className="text-h4 font-semibold text-neutral-900 dark:text-dark-900 mb-2">
                  Delete Bank Account
                </h3>
                <p className="text-body-sm text-neutral-600 dark:text-dark-600">
                  Are you sure you want to delete the account at{' '}
                  <span className="font-semibold text-neutral-800 dark:text-dark-800">
                    {deleteTarget.bankName}
                  </span>{' '}
                  ending in{' '}
                  <span className="font-mono font-semibold text-neutral-800 dark:text-dark-800">
                    {deleteTarget.accountNumber?.slice(-4) || '****'}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 px-5 py-2.5 text-body-sm font-medium text-neutral-700 dark:text-dark-700 bg-neutral-100 dark:bg-dark-200 hover:bg-neutral-200 dark:hover:bg-dark-300 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-body-sm font-medium rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ---------- Edit Modal ---------- */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !editSubmitting && setEditTarget(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-100 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-dark-300">
              <h3 className="text-h4 font-semibold text-neutral-900 dark:text-dark-900">Edit Bank Account</h3>
              <button onClick={() => setEditTarget(null)} disabled={editSubmitting} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              {/* Bank Name — searchable dropdown */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-dark-700 mb-1">Bank Name</label>
                <div className="relative" ref={editBankInputRef}>
                  <input
                    type="text"
                    value={editForm.bankName}
                    onChange={e => {
                      setEditForm(prev => ({ ...prev, bankName: e.target.value }));
                      setEditBankSuggestionsOpen(true);
                    }}
                    onFocus={() => setEditBankSuggestionsOpen(true)}
                    placeholder="e.g., State Bank of India"
                    autoComplete="off"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-dark-300 rounded-lg bg-white dark:bg-dark-200 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {editBankSuggestionsOpen && editForm.bankName.trim().length > 0 && (() => {
                    const filtered = INDIAN_BANKS.filter(b =>
                      b.toLowerCase().includes(editForm.bankName.toLowerCase())
                    );
                    return filtered.length > 0 ? (
                      <ul className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-dark-100 border border-neutral-200 dark:border-dark-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filtered.map((bank) => (
                          <li
                            key={bank}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setEditForm(prev => ({ ...prev, bankName: bank }));
                              setEditBankSuggestionsOpen(false);
                            }}
                            className="px-4 py-2.5 text-sm text-neutral-800 dark:text-dark-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer transition-colors"
                          >
                            {bank}
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}
                </div>
              </div>
              {/* Account Holder Name */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-dark-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={editForm.accountHolderName}
                  onChange={e => setEditForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  placeholder="Full name as per bank"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-dark-300 rounded-lg bg-white dark:bg-dark-200 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* IFSC Code */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-dark-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={editForm.ifscCode}
                  onChange={e => setEditForm(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase().slice(0, 11) }))}
                  placeholder="e.g., SBIN0001234"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-dark-300 rounded-lg bg-white dark:bg-dark-200 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>
              {/* Branch Name */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-dark-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={editForm.branchName}
                  onChange={e => setEditForm(prev => ({ ...prev, branchName: e.target.value }))}
                  placeholder="Branch name"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-dark-300 rounded-lg bg-white dark:bg-dark-200 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editForm.isPrimary}
                  onChange={e => setEditForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-neutral-700 dark:text-dark-700">Set as Primary Account</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditTarget(null)} disabled={editSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-dark-200 dark:text-dark-700 dark:hover:bg-dark-300 rounded-lg transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50">
                  {editSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;
