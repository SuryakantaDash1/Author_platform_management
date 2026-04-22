import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Star, Search, ArrowLeft, MapPin, ExternalLink, Share2 } from 'lucide-react';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicBook {
  bookId: string;
  bookName: string;
  subtitle?: string;
  coverPage?: string;
  language: string;
  bookType: string;
  actualLaunchDate?: string;
  totalSellingUnits: number;
  marketplaces: string[];
  sellingPrice: number;
  authorId: string;
  authorName: string;
}

interface BookDetail {
  book: {
    bookId: string;
    bookName: string;
    subtitle?: string;
    coverPage?: string;
    language: string;
    bookType: string;
    targetAudience?: string;
    actualLaunchDate?: string;
    totalSellingUnits: number;
    marketplaces: string[];
    platformWiseSales: Record<string, { sellingUnits: number; productLink?: string; rating?: number }>;
    sellingPrice: number;
  };
  author: {
    authorId: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    location: string;
  };
}

const GRADIENT_MAP = ['from-indigo-400 to-purple-500','from-emerald-400 to-teal-500','from-orange-400 to-red-500','from-pink-400 to-rose-500','from-cyan-400 to-blue-500','from-fuchsia-400 to-purple-500','from-amber-400 to-orange-500','from-lime-400 to-green-500'];
const gradient = (s: string) => GRADIENT_MAP[s.charCodeAt(0) % GRADIENT_MAP.length];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : i < rating ? 'text-yellow-400 fill-yellow-400/50' : 'text-neutral-300 dark:text-dark-400'}`} />
    ))}
    <span className="ml-1 text-body-xs text-neutral-500 dark:text-dark-500">{rating}</span>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<PublicBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [bookType] = useState('');
  const [language] = useState('');

  // Detail view
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [detail, setDetail] = useState<BookDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (authorName) params.authorName = authorName;
      if (bookType) params.bookType = bookType;
      if (language) params.language = language;
      const res = await axiosInstance.get(API_ENDPOINTS.PUBLIC.GET_BOOKS, { params });
      if (res.data?.success) setBooks(res.data.data.books || []);
    } catch {
      // silently fallback
    } finally {
      setLoading(false);
    }
  }, [search, authorName, bookType, language]);

  useEffect(() => { fetchBooks(); }, []);

  const handleSearch = () => fetchBooks();

  const openDetail = async (bookId: string) => {
    try {
      setDetailLoading(true);
      setSelectedBookId(bookId);
      const res = await axiosInstance.get(API_ENDPOINTS.PUBLIC.GET_BOOK_DETAIL(bookId));
      if (res.data?.success) setDetail(res.data.data);
    } catch {
      setSelectedBookId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => { setSelectedBookId(null); setDetail(null); };

  const handleShare = (title: string) => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  // ─── Book Detail View ──────────────────────────────────────────────────────
  if (selectedBookId) {
    if (detailLoading || !detail) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader size="lg" text="Loading book details..." />
        </div>
      );
    }
    const { book, author } = detail;
    const avgRating = Object.values(book.platformWiseSales)
      .filter((p) => p.rating)
      .reduce((sum, p, _i, arr) => sum + (p.rating || 0) / arr.length, 0);

    return (
      <div className="min-h-screen bg-white dark:bg-dark-100">
        <div className="container-custom py-8 md:py-12 max-w-4xl mx-auto">
          <button onClick={closeDetail} className="inline-flex items-center gap-2 mb-6 text-body-sm font-medium text-neutral-600 dark:text-dark-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Books
          </button>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Cover */}
            <div className="md:col-span-1">
              {book.coverPage ? (
                <img src={book.coverPage} alt={book.bookName} className="w-full rounded-xl shadow-lg" />
              ) : (
                <div className={`h-64 rounded-xl bg-gradient-to-br ${gradient(book.bookId)} flex items-center justify-center shadow-lg`}>
                  <BookOpen className="w-20 h-20 text-white/70" />
                </div>
              )}
            </div>
            {/* Info */}
            <div className="md:col-span-2">
              <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">{book.bookName}</h1>
              {book.subtitle && <p className="text-body-lg text-neutral-600 dark:text-dark-600 mt-1">{book.subtitle}</p>}
              <p className="text-body-sm text-neutral-500 dark:text-dark-500 mt-2">
                by <span className="font-medium text-neutral-700 dark:text-dark-700">{author.firstName} {author.lastName}</span>
                {author.location && <span> · <MapPin className="w-3.5 h-3.5 inline mr-0.5" />{author.location}</span>}
              </p>

              {avgRating > 0 && <div className="mt-3"><StarRating rating={Math.round(avgRating * 10) / 10} /></div>}

              <div className="grid grid-cols-3 gap-4 mt-5">
                {[
                  { label: 'Language', value: book.language },
                  { label: 'Type', value: book.bookType },
                  { label: 'Units Sold', value: book.totalSellingUnits.toLocaleString() },
                ].map((item) => (
                  <div key={item.label} className="bg-neutral-50 dark:bg-dark-200/50 rounded-lg p-3">
                    <p className="text-body-xs text-neutral-500 dark:text-dark-500 mb-0.5">{item.label}</p>
                    <p className="font-semibold text-neutral-900 dark:text-dark-900 text-body-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleShare(book.bookName)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-dark-400 text-neutral-700 dark:text-dark-700 rounded-lg text-body-sm font-medium hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          {/* Platform availability */}
          {Object.keys(book.platformWiseSales).length > 0 && (
            <div className="card p-6">
              <h2 className="text-h5 font-semibold text-neutral-900 dark:text-dark-900 mb-4">Available On</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(book.platformWiseSales).map(([platform, data]) => (
                  <div key={platform} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-dark-200/50 rounded-xl">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-dark-900 text-body-sm">{platform}</p>
                      <p className="text-body-xs text-neutral-500 dark:text-dark-500">{data.sellingUnits.toLocaleString()} units sold</p>
                      {data.rating && (
                        <div className="mt-1"><StarRating rating={data.rating} /></div>
                      )}
                    </div>
                    {data.productLink && (
                      <a href={data.productLink} target="_blank" rel="noreferrer" className="ml-2 p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Book Listing View ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-white via-indigo-50/40 to-primary-50 dark:from-bg-dark-primary dark:via-bg-dark-secondary dark:to-bg-dark-primary">
        <div className="container-custom py-14 lg:py-20 text-center">
          <p className="text-body-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">Book Catalogue</p>
          <h1 className="text-h1 lg:text-display-3 font-extrabold text-neutral-900 dark:text-dark-900 mb-4">Explore Published Books</h1>
          <p className="max-w-xl mx-auto text-body-lg text-neutral-600 dark:text-dark-600">
            Browse our growing catalogue of books across genres, published by talented authors on the POVITAL platform.
          </p>
          {/* Search row */}
          <div className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by book title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <input
              type="text"
              placeholder="Author name…"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button onClick={handleSearch} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-body-sm font-medium transition-colors">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="bg-neutral-50 dark:bg-bg-dark-secondary py-14 lg:py-20">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-16"><Loader size="lg" /></div>
          ) : books.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <p className="text-body-lg">No books found.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book.bookId}
                  className="bg-white dark:bg-dark-100 rounded-2xl shadow-sm hover:shadow-lg border border-neutral-100 dark:border-dark-300 overflow-hidden transition-all hover:-translate-y-1 cursor-pointer"
                  onClick={() => openDetail(book.bookId)}
                >
                  {book.coverPage ? (
                    <img src={book.coverPage} alt={book.bookName} className="w-full h-48 object-cover" />
                  ) : (
                    <div className={`h-48 bg-gradient-to-br ${gradient(book.bookId)} flex items-center justify-center`}>
                      <BookOpen className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className="text-body font-semibold text-neutral-900 dark:text-dark-900 line-clamp-1">{book.bookName}</h3>
                      <p className="text-body-xs text-neutral-400 dark:text-dark-500">{book.bookType}</p>
                    </div>
                    <p className="text-body-sm text-neutral-600 dark:text-dark-600">by {book.authorName}</p>
                    <p className="text-body-xs text-neutral-400 dark:text-dark-500">{book.totalSellingUnits.toLocaleString()} units sold</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); openDetail(book.bookId); }}
                      className="w-full mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-body-sm font-medium rounded-lg transition-colors"
                    >
                      Explore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BooksPage;
