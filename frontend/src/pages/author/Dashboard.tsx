import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  Clock,
  Percent,
  IndianRupee,
  HelpCircle,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Camera,
  Book,
  ExternalLink,
  Bell,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';
import ProfileUpdateModal from '../../components/author/ProfileUpdateModal';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

// ---------- Types ----------
interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: string;
  tier: string;
  isActive: boolean;
  isRestricted: boolean;
}

interface AuthorProfile {
  authorId: string;
  publishedArticles?: Array<{ bookName: string; isbn?: string; bookPhoto?: string; links?: Array<{ platform: string; url: string }> }>;
  profilePicture: string;
  referralCode: string;
  totalBooks: number;
  totalEarnings: number;
  totalSoldUnits: number;
  isRestricted: boolean;
  createdAt: string;
  address: {
    pinCode: string;
    city: string;
    district: string;
    state: string;
    country: string;
    housePlot: string;
    landmark: string;
  };
}

interface DashboardStats {
  totalBooks: number;
  ongoingBooks: number;
  authorRoyaltyPercent: number;
  lastMonthRoyalty: number;
}

// ---------- Component ----------
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    ongoingBooks: 0,
    authorRoyaltyPercent: 70,
    lastMonthRoyalty: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showArticles, setShowArticles] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [payingBookId, setPayingBookId] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_PROFILE);
      if (response.data?.success) {
        const { user: userData, author: authorData } = response.data.data;
        setUser(userData);
        setAuthor(authorData);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load profile');
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_DASHBOARD);
      if (response.data?.success) {
        const data = response.data.data;
        setStats({
          totalBooks: data.totalBooks ?? data.overview?.totalBooks ?? 0,
          ongoingBooks: data.ongoingBooks ?? data.overview?.pendingBooks ?? 0,
          authorRoyaltyPercent: data.authorRoyaltyPercent ?? 70,
          lastMonthRoyalty: data.lastMonthRoyalty ?? 0,
        });
      }
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error);
    }
  }, []);

  const fetchPaymentRequests = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.PAYMENT.PENDING_REQUESTS);
      setPaymentRequests(res.data?.data?.requests || []);
    } catch {
      // non-critical
    }
  }, []);

  const handlePayFromDashboard = async (request: any) => {
    setPayingBookId(request.bookId);
    setPaymentLoading(true);
    try {
      const res = await axiosInstance.post(API_ENDPOINTS.PAYMENT.CREATE_ORDER, { bookId: request.bookId });
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
              bookId: request.bookId,
            });
            toast.success('Payment successful!');
            fetchPaymentRequests();
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: authorName },
        theme: { color: LIME },
      };

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
      setPayingBookId(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchDashboardStats(), fetchPaymentRequests()]);
      setLoading(false);
    };
    loadData();
  }, [fetchProfile, fetchDashboardStats, fetchPaymentRequests]);

  const handleProfileUpdated = () => { fetchProfile(); };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { toast.error('Only image files are allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }

    const formData = new FormData();
    formData.append('profilePicture', file);
    setUploadingPhoto(true);
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTHOR.UPLOAD_PROFILE_PICTURE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.success) {
        toast.success('Profile photo updated!');
        fetchProfile();
        window.dispatchEvent(new Event('profile-updated'));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatCurrency = (amount: number): string => new Intl.NumberFormat('en-IN').format(amount);

  const getFullAddress = (): string => {
    if (!author?.address) return 'Address not provided';
    const { housePlot, landmark, city, district, state, country, pinCode } = author.address;
    const parts = [housePlot, landmark, city, district, state, country, pinCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not provided';
  };

  const getInitials = (): string => {
    if (!user) return '??';
    const first = user.firstName?.charAt(0)?.toUpperCase() || '';
    const last = user.lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || '??';
  };

  const isRestricted = user?.isRestricted || author?.isRestricted;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'text-lime-700 dark:text-lime-400',
      bg: 'rgba(132,204,22,0.10)',
      iconStyle: { color: LIME_DARK },
    },
    {
      label: 'Ongoing Books',
      value: stats.ongoingBooks,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'rgba(245,158,11,0.10)',
      iconStyle: { color: '#d97706' },
    },
    {
      label: 'Author Royalty',
      value: `${stats.authorRoyaltyPercent}%`,
      icon: Percent,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'rgba(16,185,129,0.10)',
      iconStyle: { color: '#059669' },
    },
    {
      label: 'Last Month Royalty',
      value: stats.lastMonthRoyalty,
      icon: TrendingUp,
      color: 'text-lime-700 dark:text-lime-400',
      bg: 'rgba(132,204,22,0.10)',
      iconStyle: { color: LIME_DARK },
      prefix: '₹',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Author Dashboard</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Welcome back, {user?.firstName}!</p>
        </div>
      </div>

      {/* Restricted Banner */}
      {isRestricted && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300 font-medium text-sm">
            Account Restricted — Please contact admin support
          </p>
        </div>
      )}

      {/* Payment Requests */}
      {paymentRequests.length > 0 && (
        <div className="space-y-3">
          {paymentRequests.map((req, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 px-5 py-4 rounded-xl border ${
                req.status === 'overdue'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              }`}
            >
              <Bell className={`w-5 h-5 flex-shrink-0 mt-0.5 ${req.status === 'overdue' ? 'text-red-500' : 'text-amber-500'}`} />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${req.status === 'overdue' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
                  {req.status === 'overdue' ? `Payment Overdue — "${req.bookName}" publishing paused` : `Payment Request — "${req.bookName}"`}
                </p>
                <p className={`text-xs mt-0.5 ${req.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {req.description || `Amount due: ₹${formatCurrency(req.amount)}`}
                </p>
              </div>
              <button
                onClick={() => handlePayFromDashboard(req)}
                disabled={paymentLoading && payingBookId === req.bookId}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 rounded-lg transition-colors"
                style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
              >
                {paymentLoading && payingBookId === req.bookId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <IndianRupee className="w-3.5 h-3.5" />}
                Pay ₹{formatCurrency(req.amount)}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Top lime accent bar */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${LIME}, ${LIME_DARK})` }} />

        <div className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Avatar + Info */}
            <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
              {/* Avatar */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to change photo"
                >
                  {author?.profilePicture ? (
                    <img
                      src={author.profilePicture}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="w-24 h-24 rounded-2xl object-cover shadow-md"
                      style={{ border: `2px solid ${LIME}` }}
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-md"
                      style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
                    >
                      <span className="text-2xl font-bold text-white">{getInitials()}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {uploadingPhoto
                      ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Camera className="w-6 h-6 text-white" />
                    }
                  </div>
                </div>
                {uploadingPhoto ? (
                  <span className="text-xs font-medium animate-pulse" style={{ color: LIME_DARK }}>Uploading...</span>
                ) : (
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-2.5 py-1">
                    {author?.authorId || 'N/A'}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="min-w-0 space-y-2.5 flex-1">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  {author?.publishedArticles && author.publishedArticles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowArticles(prev => !prev)}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
                      style={{ background: 'rgba(132,204,22,0.12)', color: LIME_DARK }}
                    >
                      Published Author ({author.publishedArticles.length} {author.publishedArticles.length === 1 ? 'book' : 'books'})
                      <span className="text-[10px]">{showArticles ? '▲' : '▼'}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-400" />
                    <span className="break-words">{getFullAddress()}</span>
                  </div>
                  {user?.mobile && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Phone className="w-4 h-4 flex-shrink-0 text-neutral-400" />
                      <span>{user.mobile}</span>
                    </div>
                  )}
                  {user?.email && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Mail className="w-4 h-4 flex-shrink-0 text-neutral-400" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  {author?.referralCode && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Referral Code:</span>
                      <span
                        className="text-xs font-mono font-bold px-2 py-0.5 rounded-md"
                        style={{ background: 'rgba(132,204,22,0.12)', color: LIME_DARK }}
                      >
                        {author.referralCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Earnings + Actions */}
            <div className="flex flex-col items-start lg:items-end justify-between gap-5 flex-shrink-0 lg:min-w-[200px]">
              {/* Update Profile */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
              >
                <Pencil className="w-3.5 h-3.5" />
                Update Profile
              </button>

              {/* Net Royalty Earning */}
              <div className="rounded-xl p-4 w-full lg:text-right" style={{ background: 'rgba(132,204,22,0.08)', border: '1px solid rgba(132,204,22,0.20)' }}>
                <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: LIME_DARK }}>
                  Net Royalty Earning
                </p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                  <span className="text-lg mr-0.5 text-neutral-500">₹</span>
                  {formatCurrency(author?.totalEarnings ?? 0)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full lg:justify-end">
                <button
                  onClick={() => navigate('/author/tickets')}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  style={{ color: LIME_DARK, borderColor: 'rgba(132,204,22,0.35)' }}
                >
                  <HelpCircle className="w-4 h-4" />
                  Help Desk
                </button>
                <button
                  onClick={() => navigate('/author/books')}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                  style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
                >
                  <PlusCircle className="w-4 h-4" />
                  New Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Published Articles Expandable */}
      {showArticles && author?.publishedArticles && author.publishedArticles.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Published Books / Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {author.publishedArticles.map((article: any, idx: number) => (
              <div key={idx} className="flex gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-700">
                {article.bookPhoto ? (
                  <img src={article.bookPhoto} alt={article.bookName} className="w-14 h-18 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-14 h-18 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(132,204,22,0.10)' }}>
                    <Book className="w-6 h-6" style={{ color: LIME_DARK }} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{article.bookName}</p>
                  {article.isbn && <p className="text-xs text-neutral-500 dark:text-neutral-400">ISBN: {article.isbn}</p>}
                  {article.links && article.links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {article.links.map((link: any, lIdx: number) => (
                        <a
                          key={lIdx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded transition-colors"
                          style={{ color: LIME_DARK, background: 'rgba(132,204,22,0.10)' }}
                        >
                          {link.platform}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: card.bg }}
              >
                <Icon className="w-6 h-6" style={card.iconStyle} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white truncate mt-0.5">
                  {card.prefix ?? ''}{typeof card.value === 'number' ? formatCurrency(card.value) : card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Update Modal */}
      {user && author && (
        <ProfileUpdateModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userData={{
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email || '',
            mobile: user.mobile || '',
          }}
          authorData={{
            authorId: author.authorId,
            publishedArticles: (author.publishedArticles || []) as any,
            createdAt: author.createdAt || '',
            address: {
              pinCode: author.address?.pinCode || '',
              city: author.address?.city || '',
              district: author.address?.district || '',
              state: author.address?.state || '',
              country: author.address?.country || '',
              housePlot: author.address?.housePlot || '',
              landmark: author.address?.landmark || '',
            },
          }}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default Dashboard;
