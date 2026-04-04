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
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';
import ProfileUpdateModal from '../../components/author/ProfileUpdateModal';

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
  qualification: string;
  university: string;
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_PROFILE);
      if (response.data?.success) {
        const { user: userData, author: authorData } = response.data.data;
        setUser(userData);
        setAuthor(authorData);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load profile';
      toast.error(message);
    }
  }, []);

  // Fetch dashboard stats
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
      // Dashboard stats are non-critical; silently handle
      console.error('Failed to load dashboard stats:', error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchDashboardStats()]);
      setLoading(false);
    };
    loadData();
  }, [fetchProfile, fetchDashboardStats]);

  // Handle profile update completion
  const handleProfileUpdated = () => {
    fetchProfile();
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only image files (JPEG, PNG, GIF, WEBP) are allowed');
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    setUploadingPhoto(true);
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.AUTHOR.UPLOAD_PROFILE_PICTURE,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (response.data?.success) {
        toast.success('Profile photo updated!');
        fetchProfile();
        // Notify Header to refresh profile image
        window.dispatchEvent(new Event('profile-updated'));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  // Build full address string
  const getFullAddress = (): string => {
    if (!author?.address) return 'Address not provided';
    const { housePlot, landmark, city, district, state, country, pinCode } = author.address;
    const parts = [housePlot, landmark, city, district, state, country, pinCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not provided';
  };

  // Get initials for avatar fallback
  const getInitials = (): string => {
    if (!user) return '??';
    const first = user.firstName?.charAt(0)?.toUpperCase() || '';
    const last = user.lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || '??';
  };

  // Check if restricted
  const isRestricted = user?.isRestricted || author?.isRestricted;

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  // ---------- Stat Cards Config ----------
  const statCards = [
    {
      label: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Ongoing Books',
      value: stats.ongoingBooks,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'Author Royalty',
      value: `${stats.authorRoyaltyPercent}%`,
      icon: Percent,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Last Month Royalty',
      value: stats.lastMonthRoyalty,
      icon: IndianRupee,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      prefix: '\u20B9',
    },
  ];

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">
        Author Dashboard
      </h1>

      {/* Restricted Account Banner */}
      {isRestricted && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300 font-medium text-body-sm">
            Account Restricted &mdash; Please contact admin support
          </p>
        </div>
      )}

      {/* Profile Card */}
      <div className="card p-6 relative">
        {/* Hidden file input for photo upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Profile Info */}
          <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
            {/* Avatar with photo upload */}
            <div className="flex-shrink-0">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                title="Click to change profile photo"
              >
                {author?.profilePicture ? (
                  <img
                    src={author.profilePicture}
                    alt={`${user?.firstName} ${user?.lastName}`}
                    className="w-24 h-24 rounded-xl object-cover border-2 border-indigo-200 dark:border-indigo-700 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <span className="text-2xl font-bold text-white">{getInitials()}</span>
                  </div>
                )}
                {/* Camera overlay on hover */}
                <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {uploadingPhoto ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              {/* Upload status or Author ID below avatar */}
              {uploadingPhoto ? (
                <p className="mt-2 text-center text-body-xs text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                  Uploading...
                </p>
              ) : (
                <p className="mt-2 text-center text-body-xs font-mono text-neutral-500 dark:text-dark-500 bg-neutral-100 dark:bg-dark-200 rounded px-2 py-1">
                  {author?.authorId || 'N/A'}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="min-w-0 space-y-2">
              <h2 className="text-h3 font-bold text-neutral-900 dark:text-dark-900 truncate">
                {user?.firstName} {user?.lastName}
              </h2>
              {(author?.qualification || author?.university) && (
                <p className="text-body-sm italic text-neutral-600 dark:text-dark-600 truncate">
                  {[author.qualification, author.university].filter(Boolean).join(' - ')}
                </p>
              )}

              <div className="space-y-1.5 pt-1">
                <div className="flex items-start gap-2 text-body-sm text-neutral-600 dark:text-dark-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-400 dark:text-dark-400" />
                  <span className="break-words">{getFullAddress()}</span>
                </div>
                {user?.mobile && (
                  <div className="flex items-center gap-2 text-body-sm text-neutral-600 dark:text-dark-600">
                    <Phone className="w-4 h-4 flex-shrink-0 text-neutral-400 dark:text-dark-400" />
                    <span>{user.mobile}</span>
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center gap-2 text-body-sm text-neutral-600 dark:text-dark-600">
                    <Mail className="w-4 h-4 flex-shrink-0 text-neutral-400 dark:text-dark-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {author?.referralCode && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-body-xs font-medium text-neutral-500 dark:text-dark-500">Referral Code:</span>
                    <span className="text-body-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                      {author.referralCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Earnings & Actions */}
          <div className="flex flex-col items-end justify-between gap-4 flex-shrink-0">
            {/* Update Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-body-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
            >
              <Pencil className="w-4 h-4" />
              Update Profile
            </button>

            {/* Net Royalty */}
            <div className="text-right">
              <p className="text-body-xs text-neutral-500 dark:text-dark-500 uppercase tracking-wide font-medium mb-1">
                Net Royalty Earning
              </p>
              <p className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-dark-900">
                <span className="text-xl mr-1 text-neutral-500 dark:text-dark-500">{'\u20B9'}</span>
                {formatCurrency(author?.totalEarnings ?? 0)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-body-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
                onClick={() => navigate('/author/tickets')}
              >
                <HelpCircle className="w-4 h-4" />
                Help Chart
              </button>
              <button
                onClick={() => navigate('/author/books')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-body-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                New Book
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="card p-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-body-xs text-neutral-500 dark:text-dark-500 font-medium uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-dark-900 truncate">
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
            qualification: author.qualification || '',
            university: author.university || '',
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
