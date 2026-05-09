import React, { useState, useEffect, useCallback } from 'react';
import {
  Gift,
  Copy,
  Check,
  IndianRupee,
  Users,
  Wallet,
  RefreshCw,
  AlertCircle,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

// ---------- Types ----------
interface Referral {
  _id?: string;
  referredAuthorId?: string;
  commissionAmount?: number;
  status?: string;
  createdAt?: string;
  referredAuthorDetails?: {
    authorId?: string;
    firstName?: string;
    lastName?: string;
    totalBooks?: number;
    totalEarnings?: number;
    createdAt?: string;
  } | null;
}

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  referrals: Referral[];
}

// ---------- Component ----------
const Referrals: React.FC = () => {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // ---------- Fetch referrals ----------
  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.REFERRALS.GET_MY_REFERRALS);
      if (response.data?.success) {
        const resData = response.data.data;
        setData({
          referralCode: resData.referralCode || '',
          totalReferrals: resData.totalReferrals ?? resData.referrals?.length ?? 0,
          totalEarnings: resData.totalEarnings ?? 0,
          pendingEarnings: resData.pendingEarnings ?? 0,
          referrals: resData.referrals || [],
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  // ---------- Copy referral code ----------
  const handleCopy = async () => {
    if (!data?.referralCode) return;
    try {
      await navigator.clipboard.writeText(data.referralCode);
      setCopied(true);
      toast.success('Referral code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  // ---------- Format currency ----------
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  // ---------- Format date ----------
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ---------- Get referral name ----------
  const getReferralName = (referral: Referral): string => {
    const d = referral.referredAuthorDetails;
    if (!d) return referral.referredAuthorId || 'N/A';
    const name = [d.firstName, d.lastName].filter(Boolean).join(' ');
    return name || d.authorId || 'N/A';
  };

  // ---------- Get referral author ID ----------
  const getReferralAuthorId = (referral: Referral): string => {
    return referral.referredAuthorDetails?.authorId || referral.referredAuthorId || '-';
  };

  // ---------- Get status badge ----------
  const getStatusBadge = (referral: Referral) => {
    const status = (referral.status || 'pending').toLowerCase();
    if (status === 'completed') return <Badge variant="success" size="sm">Completed</Badge>;
    return <Badge variant="warning" size="sm">Pending</Badge>;
  };

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading referral data..." />
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Referrals</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Earn commissions by referring other authors
          </p>
        </div>
        <button
          onClick={fetchReferrals}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Referral Code Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Lime accent top bar */}
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${LIME}, ${LIME_DARK})` }} />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}>
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide font-medium mb-1">
                Your Referral Code
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold font-mono tracking-wider" style={{ color: LIME_DARK }}>
                  {data?.referralCode || 'N/A'}
                </span>
                {data?.referralCode && (
                  <button
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      copied
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'hover:opacity-90'
                    }`}
                    style={!copied ? { background: 'rgba(132,204,22,0.12)', color: LIME_DARK } : undefined}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                Share this code with other authors. Earn commission when they join and publish!
              </p>
            </div>
            {/* Watermark icon */}
            <TrendingUp className="hidden sm:block w-20 h-20 opacity-5 text-neutral-900 dark:text-white flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Referrals */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(132,204,22,0.12)' }}>
            <Users className="w-6 h-6" style={{ color: LIME_DARK }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wide">
              Total Referrals
            </p>
            <p className="text-xl font-bold text-neutral-900 dark:text-white">
              {data?.totalReferrals ?? 0}
            </p>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wide">
              Total Earnings
            </p>
            <p className="text-xl font-bold text-neutral-900 dark:text-white">
              <span className="text-sm mr-0.5 text-neutral-500 dark:text-neutral-400">{'\u20B9'}</span>
              {formatCurrency(data?.totalEarnings ?? 0)}
            </p>
          </div>
        </div>

        {/* Pending Commission */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wide">
              Pending Commission
            </p>
            <p className="text-xl font-bold text-neutral-900 dark:text-white">
              {data?.referrals.filter(r => r.status === 'pending').length ?? 0}
              <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400 ml-1">referral(s)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Referral List Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Referral History
          </h2>
        </div>

        {!data?.referrals || data.referrals.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(132,204,22,0.10)' }}>
              <AlertCircle className="w-8 h-8" style={{ color: LIME_DARK }} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
                No Referrals Yet
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Share your referral code with other authors to start earning commissions.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Referred Author
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Author ID
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {data.referrals.map((referral, index) => (
                  <tr
                    key={referral._id || index}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {getReferralName(referral)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium" style={{ color: LIME_DARK }}>
                        {getReferralAuthorId(referral)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(referral)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {'\u20B9'}{formatCurrency(referral.commissionAmount ?? 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 inline-flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(referral.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
