import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/interceptors';
import { useAuth } from '../../contexts/AuthContext';
import { TICKET_CATEGORIES, TIME_SLOTS } from '../../utils/constants';
import { TICKET_STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  Book,
  MessageSquare,
  Send,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Clock,
  CalendarDays,
  ChevronDown,
  Loader2,
  AlertCircle,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import Badge from '../../components/common/Badge';

// ── Types ──────────────────────────────────────────────────────────────
interface AuthorProfile {
  authorId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  profilePicture?: string;
  qualification?: string;
  university?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface Ticket {
  _id: string;
  ticketId?: string;
  title: string;
  category: string;
  description: string;
  status: string;
  discussionDay?: string;
  discussionTimeSlot1?: string;
  discussionTimeSlot2?: string;
  createdAt: string;
  updatedAt?: string;
}

interface TicketFormData {
  category: string;
  discussionTimeSlot1: string;
  discussionDay: string;
  description: string;
}

// ── Helper: status badge variant ──────────────────────────────────────
const statusBadgeVariant = (status: string) => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'neutral' | 'primary'> = {
    pending: 'warning',
    in_progress: 'info',
    resolved: 'success',
    closed: 'neutral',
  };
  return map[status] || 'primary';
};

const statusLabel = (status: string) => {
  const found = TICKET_STATUSES.find((s) => s.value === status);
  return found ? found.label : status;
};

const categoryLabel = (category: string) => {
  const found = TICKET_CATEGORIES.find((c) => c.value === category);
  return found ? found.label : category;
};

// ── Component ─────────────────────────────────────────────────────────
const Tickets: React.FC = () => {
  const { user } = useAuth();

  // Profile state
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Form state
  const [form, setForm] = useState<TicketFormData>({
    category: '',
    discussionTimeSlot1: '',
    discussionDay: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch author profile ────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const { data } = await axiosInstance.get('/author/profile');
      if (data.success) {
        const authorData = data.data?.author || data.data?.user || data.data;
        setProfile({
          authorId: authorData.authorId || authorData._id || user?.userId,
          firstName: authorData.firstName || user?.firstName,
          lastName: authorData.lastName || user?.lastName,
          email: authorData.email || user?.email,
          mobile: authorData.mobile || user?.mobile,
          profilePicture: authorData.profilePicture,
          qualification: authorData.qualification,
          university: authorData.university,
          address: authorData.address,
          city: authorData.city,
          state: authorData.state,
          pincode: authorData.pincode,
        });
      }
    } catch {
      // Fallback to auth-context user info
      setProfile({
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        mobile: user?.mobile,
      });
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  // ── Fetch tickets ───────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    try {
      setTicketsLoading(true);
      const { data } = await axiosInstance.get('/support/tickets');
      if (data.success) {
        setTickets(data.data?.tickets || []);
      }
    } catch {
      // Silently fail – tickets section will simply be empty
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchTickets();
  }, [fetchProfile, fetchTickets]);

  // ── Form handlers ──────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.category) {
      toast.error('Please select a support category.');
      return;
    }
    if (!form.discussionTimeSlot1) {
      toast.error('Please select a discussion time slot.');
      return;
    }
    if (!form.discussionDay) {
      toast.error('Please select a discussion day.');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Please enter a description.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: categoryLabel(form.category),
        category: form.category,
        description: form.description.trim(),
        discussionDay: form.discussionDay,
        discussionTimeSlot1: form.discussionTimeSlot1,
        discussionTimeSlot2: '',
      };

      const { data } = await axiosInstance.post('/support/tickets', payload);

      if (data.success) {
        toast.success('Support request submitted successfully!');
        setForm({
          category: '',
          discussionTimeSlot1: '',
          discussionDay: '',
          description: '',
        });
        fetchTickets();
      } else {
        toast.error(data.message || 'Failed to submit request.');
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Computed profile fields ─────────────────────────────────────────
  const fullName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Author';
  const addressLine = [profile?.address, profile?.city, profile?.state, profile?.pincode]
    .filter(Boolean)
    .join(', ');

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="animate-fadeIn">
      {/* Page heading */}
      <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900 mb-6">
        Support / Help Chart
      </h1>

      {/* ─── Two-column layout ─────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ═══════════════ LEFT SIDEBAR ═══════════════ */}
        <div className="w-full lg:w-1/3">
          <div className="card p-6 sticky top-24">
            {/* POVITAL logo icon */}
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
                <Book className="w-7 h-7 text-white" />
              </div>
            </div>

            {profileLoading ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <p className="text-body-sm text-neutral-500 dark:text-dark-500">
                  Loading profile...
                </p>
              </div>
            ) : (
              <>
                {/* Profile photo */}
                <div className="flex justify-center mb-4">
                  {profile?.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={fullName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary-100 dark:border-primary-900/40 shadow"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center border-4 border-primary-100 dark:border-primary-900/40 shadow">
                      <span className="text-white text-3xl font-bold">
                        {(profile?.firstName?.charAt(0) || 'A').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Author info */}
                <div className="text-center space-y-1 mb-5">
                  {profile?.authorId && (
                    <p className="text-body-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 inline-block px-3 py-0.5 rounded-full">
                      ID: {profile.authorId}
                    </p>
                  )}
                  <h3 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900">
                    {fullName}
                  </h3>
                </div>

                {/* Detail rows */}
                <div className="space-y-3 border-t border-neutral-200 dark:border-dark-300 pt-4">
                  {profile?.qualification && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                      <span className="text-body-sm text-neutral-700 dark:text-dark-700">
                        {profile.qualification}
                        {profile.university ? `, ${profile.university}` : ''}
                      </span>
                    </div>
                  )}

                  {addressLine && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                      <span className="text-body-sm text-neutral-700 dark:text-dark-700">
                        {addressLine}
                      </span>
                    </div>
                  )}

                  {profile?.mobile && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                      <span className="text-body-sm text-neutral-700 dark:text-dark-700">
                        {profile.mobile}
                      </span>
                    </div>
                  )}

                  {profile?.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                      <span className="text-body-sm text-neutral-700 dark:text-dark-700 break-all">
                        {profile.email}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total Books card */}
                <div className="mt-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-body-xs text-neutral-500 dark:text-dark-500">
                        Total Books
                      </p>
                      <p className="text-h4 font-bold text-indigo-700 dark:text-indigo-300">
                        0
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ═══════════════ RIGHT CONTENT ═══════════════ */}
        <div className="w-full lg:w-2/3 space-y-6">
          {/* ── Contact for Admin Support panel ────────────────────── */}
          <div className="card p-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-h4 font-semibold text-neutral-900 dark:text-dark-900">
                  Contact for Admin Support
                </h2>
              </div>

              {/* Chat Center button (disabled for Phase 1) */}
              <button
                disabled
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white text-body-sm font-medium rounded-lg opacity-50 cursor-not-allowed"
                title="Chat Center will be available in a future update"
              >
                <MessageSquare className="w-4 h-4" />
                Chat Center
              </button>
            </div>

            {/* ── Support form ──────────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select Support For? */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-2">
                  Select Support For? <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-dark-300 bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all duration-200"
                  >
                    <option value="">-- Select a category --</option>
                    {TICKET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Discussion Time */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-2">
                  Discussion Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="discussionTimeSlot1"
                    value={form.discussionTimeSlot1}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-dark-300 bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all duration-200"
                  >
                    <option value="">-- Select a time slot --</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Discussion Day - Date Picker */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-2">
                  Discussion Day <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="discussionDay"
                    value={form.discussionDay}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-dark-300 bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-dark-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your issue or query in detail..."
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-dark-300 bg-white dark:bg-dark-100 text-neutral-900 dark:text-dark-900 placeholder:text-neutral-400 dark:placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
                />
              </div>

              {/* Submit button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-body-sm font-medium rounded-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Existing tickets list ──────────────────────────────── */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900">
                Your Support Tickets
              </h3>
              <button
                onClick={fetchTickets}
                disabled={ticketsLoading}
                className="p-2 rounded-lg text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-dark-200 transition-colors disabled:opacity-50"
                title="Refresh tickets"
              >
                <RefreshCw
                  className={`w-4 h-4 ${ticketsLoading ? 'animate-spin' : ''}`}
                />
              </button>
            </div>

            {ticketsLoading ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <p className="text-body-sm text-neutral-500 dark:text-dark-500">
                  Loading tickets...
                </p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="w-14 h-14 bg-neutral-100 dark:bg-dark-200 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-neutral-400 dark:text-dark-400" />
                </div>
                <p className="text-body-sm text-neutral-500 dark:text-dark-500">
                  No support tickets yet. Submit a request above to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="border border-neutral-200 dark:border-dark-300 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-neutral-50/50 dark:bg-dark-100/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-body font-semibold text-neutral-900 dark:text-dark-900 truncate">
                          {ticket.title}
                        </h4>
                        <p className="text-body-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {categoryLabel(ticket.category)}
                        </p>
                      </div>
                      <Badge
                        variant={statusBadgeVariant(ticket.status)}
                        size="sm"
                        dot
                      >
                        {statusLabel(ticket.status)}
                      </Badge>
                    </div>

                    {ticket.description && (
                      <p className="text-body-sm text-neutral-600 dark:text-dark-600 mt-2 truncate-2">
                        {ticket.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-body-xs text-neutral-500 dark:text-dark-500">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {ticket.discussionDay && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {ticket.discussionDay ? new Date(ticket.discussionDay).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ticket.discussionDay}
                          {ticket.discussionTimeSlot1
                            ? ` | ${ticket.discussionTimeSlot1}`
                            : ''}
                        </span>
                      )}
                      {ticket.ticketId && (
                        <span className="font-mono text-neutral-400 dark:text-dark-400">
                          #{ticket.ticketId}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
