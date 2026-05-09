import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  MessageSquare,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Eye,
  Trash2,
  RefreshCw,
  X,
} from 'lucide-react';
import axiosInstance from '../../api/interceptors';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

// Types
interface Ticket {
  _id: string;
  ticketId: string;
  authorId: string;
  title: string;
  category: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: string;
  discussionDay: string;
  discussionTimeSlot1: string;
  discussionTimeSlot2: string;
  createdAt: string;
}

interface TicketWithAuthor extends Ticket {
  authorName: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalTickets: number;
  limit: number;
}

interface Filters {
  search: string;
  status: string;
  fromDate: string;
  toDate: string;
}

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      label: 'Pending',
    },
    'in_progress': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      label: 'In Progress',
    },
    resolved: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      label: 'Resolved',
    },
    closed: {
      bg: 'bg-neutral-100 dark:bg-neutral-700/30',
      text: 'text-neutral-700 dark:text-neutral-300',
      label: 'Closed',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'pending'
            ? 'bg-yellow-500'
            : status === 'in_progress'
            ? 'bg-blue-500'
            : status === 'resolved'
            ? 'bg-green-500'
            : 'bg-neutral-500'
        }`}
      />
      {config.label}
    </span>
  );
};

// Ticket Detail Modal with messaging
const TicketDetailModal: React.FC<{
  ticket: TicketWithAuthor;
  onClose: () => void;
  onStatusUpdate: (status: string) => Promise<void>;
}> = ({ ticket, onClose, onStatusUpdate }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/support/tickets/${ticket.ticketId}`);
      const data = res.data?.data;
      setMessages(data?.messages || []);
    } catch { setMessages([]); }
    finally { setLoadingMsgs(false); }
  }, [ticket.ticketId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await axiosInstance.post(`/support/tickets/${ticket.ticketId}/messages`, { message: newMessage.trim() });
      setNewMessage('');
      fetchMessages();
      toast.success('Message sent');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
    } finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Ticket Details</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: LIME_DARK, background: 'rgba(132,204,22,0.12)' }}>{ticket.ticketId}</span>
            <StatusBadge status={ticket.status} />
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Info */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-neutral-500">Author</p><p className="text-sm font-medium text-neutral-900 dark:text-white">{ticket.authorName || 'Unknown'}</p></div>
            <div><p className="text-xs text-neutral-500">Category</p><p className="text-sm font-medium text-neutral-900 dark:text-white">{ticket.category || ticket.title}</p></div>
          </div>
          <div><p className="text-xs text-neutral-500">Description</p><p className="text-sm text-neutral-700 dark:text-neutral-300">{ticket.description || '—'}</p></div>
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-xs text-neutral-500">Discussion Day</p><p className="text-sm">{ticket.discussionDay ? new Date(ticket.discussionDay).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p></div>
            <div><p className="text-xs text-neutral-500">Time</p><p className="text-sm">{ticket.discussionTimeSlot1 || '—'}</p></div>
            <div><p className="text-xs text-neutral-500">Created</p><p className="text-sm">{new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
          </div>
          {/* Status buttons */}
          <div className="flex gap-2">
            {ticket.status !== 'in_progress' && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
              <button onClick={() => onStatusUpdate('in_progress')} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">In Progress</button>
            )}
            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
              <button onClick={() => onStatusUpdate('resolved')} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">Resolve</button>
            )}
            {ticket.status !== 'closed' && (
              <button onClick={() => onStatusUpdate('closed')} className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-600 hover:bg-neutral-700 rounded-lg">Close</button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[150px] max-h-[300px] bg-neutral-50 dark:bg-neutral-800/30">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Messages</h3>
          {loadingMsgs ? (
            <p className="text-xs text-neutral-400 text-center py-4">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">No messages yet. Send a reply below.</p>
          ) : (
            messages.map((msg: any, i: number) => (
              <div key={i} className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                    msg.senderRole === 'admin'
                      ? 'text-white rounded-br-sm'
                      : msg.senderRole === 'system'
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs italic rounded-bl-sm'
                      : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-bl-sm'
                  }`}
                  style={msg.senderRole === 'admin' ? { background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` } : undefined}
                >
                  <p>{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${msg.senderRole === 'admin' ? 'text-white/70' : 'text-neutral-400'}`}>
                    {msg.senderRole === 'admin' ? 'Admin' : msg.senderRole === 'system' ? 'System' : (ticket.authorName || 'Author')} · {new Date(msg.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send message */}
        {ticket.status !== 'closed' && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder="Type your reply to the author..."
                className="flex-1 px-4 py-2.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
                className="px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Support: React.FC = () => {
  // State
  const [tickets, setTickets] = useState<TicketWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalTickets: 0,
    limit: 10,
  });
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    fromDate: '',
    toDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    search: '',
    status: '',
    fromDate: '',
    toDate: '',
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLTableCellElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch tickets
  const fetchTickets = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.fromDate) params.fromDate = appliedFilters.fromDate;
      if (appliedFilters.toDate) params.toDate = appliedFilters.toDate;

      const response = await axiosInstance.get('/admin/tickets', { params });
      const { tickets: ticketData, pagination: paginationData } = response.data.data;

      // Author names are now included in the API response
      const ticketsWithAuthors: TicketWithAuthor[] = (ticketData || []).map((ticket: any) => ({
        ...ticket,
        authorName: ticket.authorName || 'Unknown Author',
      }));

      setTickets(ticketsWithAuthors);
      if (paginationData) {
        setPagination({
          currentPage: paginationData.page || paginationData.currentPage || 1,
          totalPages: paginationData.pages || paginationData.totalPages || 1,
          totalTickets: paginationData.total || paginationData.totalTickets || 0,
          limit: paginationData.limit || 10,
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch support tickets';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchTickets(pagination.currentPage);
  }, [fetchTickets]);

  // Handlers
  const handleSearch = () => {
    setAppliedFilters({ ...filters });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchTickets(page);
  };

  const [viewingTicket, setViewingTicket] = useState<TicketWithAuthor | null>(null);

  const handleViewTicket = (ticket: TicketWithAuthor) => {
    setViewingTicket(ticket);
  };

  const handleDeleteTicket = async (ticket: TicketWithAuthor) => {
    try {
      await axiosInstance.put(`/support/tickets/${ticket.ticketId}/status`, { status: 'closed' });
      toast.success('Ticket closed successfully');
      fetchTickets(pagination.currentPage);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to close ticket';
      toast.error(message);
    }
  };

  const handleUpdateStatus = async (ticket: TicketWithAuthor, newStatus: string) => {
    try {
      await axiosInstance.put(`/support/tickets/${ticket.ticketId}/status`, { status: newStatus });
      toast.success(`Ticket status updated to ${newStatus}`);
      setActiveDropdown(null);
      fetchTickets(pagination.currentPage);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update ticket status';
      toast.error(message);
    }
  };

  // Format discussion time display
  const formatDiscussionTime = (ticket: TicketWithAuthor) => {
    const parts: string[] = [];
    if (ticket.discussionDay) parts.push(ticket.discussionDay);
    if (ticket.discussionTimeSlot1) parts.push(ticket.discussionTimeSlot1);
    if (ticket.discussionTimeSlot2) parts.push(`- ${ticket.discussionTimeSlot2}`);
    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr || 'N/A';
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const total = pagination.totalPages;
    const current = pagination.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Help Center in Super Admin
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage and respond to author support tickets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(132,204,22,0.12)', color: LIME_DARK }}>
            <User className="w-4 h-4" />
            Admin Login
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          {/* Author Name/ID Search */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Author Name / ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="Search author..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all"
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all"
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* From Date */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              From Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all"
              />
            </div>
          </div>

          {/* To Date */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              To Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="lg:col-span-1">
            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-lime-400/40"
              style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Refresh Button */}
          <div className="lg:col-span-1">
            <button
              onClick={() => fetchTickets(pagination.currentPage)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
              style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-neutral-200 rounded-full animate-spin" style={{ borderTopColor: LIME }} />
              <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                Loading tickets...
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-500 dark:text-neutral-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-lg font-medium">No support tickets found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  {['No', 'Ticket ID', 'Author Name', 'Support Title', 'Discussion Time', 'Date', 'Status', 'Actions'].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {tickets.map((ticket, index) => (
                  <tr
                    key={ticket._id || ticket.ticketId}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                      {(pagination.currentPage - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: LIME_DARK }}>
                      {ticket.ticketId}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100">
                      {ticket.authorName}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 max-w-[200px] truncate">
                      {ticket.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDiscussionTime(ticket)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-4 py-3 relative">
                      <select
                        value={ticket.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          if (newStatus !== ticket.status) {
                            await handleUpdateStatus(ticket, newStatus);
                          }
                        }}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-lime-400/40 focus:outline-none ${
                          ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : ticket.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-300'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm relative" ref={activeDropdown === ticket._id ? dropdownRef : null}>
                      <button
                        onClick={() =>
                          setActiveDropdown(activeDropdown === ticket._id ? null : ticket._id)
                        }
                        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === ticket._id && (
                        <div className="absolute right-4 top-10 z-20 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1">
                          <button
                            onClick={() => {
                              handleViewTicket(ticket);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>

                          {/* Status update options */}
                          {ticket.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket, 'resolved')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Mark Resolved
                            </button>
                          )}
                          {ticket.status !== 'in_progress' && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket, 'in_progress')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Mark In Progress
                            </button>
                          )}
                          {ticket.status !== 'closed' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket, 'closed')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Mark Closed
                            </button>
                          )}

                          <div className="border-t border-neutral-200 dark:border-neutral-700 my-1" />
                          <button
                            onClick={() => {
                              handleDeleteTicket(ticket);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Ticket
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && tickets.length > 0 && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing{' '}
              <span className="font-medium">
                {(pagination.currentPage - 1) * pagination.limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalTickets)}
              </span>{' '}
              of <span className="font-medium">{pagination.totalTickets}</span> tickets
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageNumbers().map((page, idx) => {
                if (page === '...') {
                  return (
                    <span key={`dots-${idx}`} className="px-2 text-neutral-400">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      pagination.currentPage === page
                        ? 'text-white'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                    style={pagination.currentPage === page ? { background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` } : undefined}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {viewingTicket && <TicketDetailModal
        ticket={viewingTicket}
        onClose={() => setViewingTicket(null)}
        onStatusUpdate={async (status: string) => {
          await handleUpdateStatus(viewingTicket, status);
          setViewingTicket({ ...viewingTicket, status: status as any });
        }}
      />}
    </div>
  );
};

export default Support;
