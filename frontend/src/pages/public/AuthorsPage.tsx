import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, BookOpen, TrendingUp, Search, ArrowLeft, Star } from 'lucide-react';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicAuthor {
  authorId: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  location: string;
  booksPublished: number;
  languages: string[];
  totalSoldUnits: number;
  totalEarnings: number;
}

interface PublicBook {
  bookId: string;
  bookName: string;
  subtitle?: string;
  coverPage?: string;
  language: string;
  bookType: string;
  totalSellingUnits: number;
  actualLaunchDate?: string;
}

interface AuthorDetail {
  author: {
    authorId: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    location: string;
    qualification?: string;
    university?: string;
    totalBooks: number;
    totalSoldUnits: number;
    avgRating: number;
    reviewCount: number;
  };
  books: PublicBook[];
  recentReviews: any[];
}

const GRADIENT_MAP = ['from-blue-400 to-indigo-500','from-purple-400 to-pink-500','from-teal-400 to-emerald-500','from-orange-400 to-amber-500','from-rose-400 to-red-500','from-cyan-400 to-blue-500','from-lime-400 to-green-500','from-fuchsia-400 to-purple-500'];
const gradient = (s: string) => GRADIENT_MAP[s.charCodeAt(0) % GRADIENT_MAP.length];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
    ))}
    <span className="ml-1 text-body-xs text-neutral-500">{rating.toFixed(1)}</span>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const AuthorsPage: React.FC = () => {
  const [authors, setAuthors] = useState<PublicAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [language] = useState('');

  // Author detail view
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AuthorDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAuthors = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (language) params.language = language;
      const res = await axiosInstance.get(API_ENDPOINTS.PUBLIC.GET_AUTHORS, { params });
      if (res.data?.success) setAuthors(res.data.data.authors || []);
    } catch {
      // silently fall back
    } finally {
      setLoading(false);
    }
  }, [search, language]);

  useEffect(() => { fetchAuthors(); }, []);

  const handleSearch = () => fetchAuthors();

  const openDetail = async (authorId: string) => {
    try {
      setDetailLoading(true);
      setSelectedAuthorId(authorId);
      const res = await axiosInstance.get(API_ENDPOINTS.PUBLIC.GET_AUTHOR_DETAIL(authorId));
      if (res.data?.success) setDetail(res.data.data);
    } catch {
      setSelectedAuthorId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => { setSelectedAuthorId(null); setDetail(null); };

  // ─── Author Detail View ────────────────────────────────────────────────────
  if (selectedAuthorId) {
    if (detailLoading || !detail) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader size="lg" text="Loading author profile..." />
        </div>
      );
    }
    const { author, books } = detail;
    return (
      <div className="min-h-screen bg-white dark:bg-dark-100">
        <div className="container-custom py-8 md:py-12 max-w-4xl mx-auto">
          <button onClick={closeDetail} className="inline-flex items-center gap-2 mb-6 text-body-sm font-medium text-neutral-600 dark:text-dark-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Authors
          </button>

          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-8">
            {author.profilePicture ? (
              <img src={author.profilePicture} alt={`${author.firstName} ${author.lastName}`} className="w-28 h-28 rounded-full object-cover border-4 border-primary-100 shadow-lg" />
            ) : (
              <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${gradient(author.authorId)} flex items-center justify-center border-4 border-primary-100 shadow-lg`}>
                <span className="text-4xl font-bold text-white">{author.firstName.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">{author.firstName} {author.lastName}</h1>
              {author.location && <p className="flex items-center gap-1 text-body-sm text-neutral-500 mt-1"><MapPin className="w-4 h-4" />{author.location}</p>}
              {author.qualification && <p className="text-body-sm text-neutral-500 mt-0.5">{author.qualification}{author.university ? ` · ${author.university}` : ''}</p>}
              <div className="flex gap-6 mt-4 text-body-sm">
                <div><span className="font-bold text-neutral-900 dark:text-dark-900">{author.totalBooks}</span><span className="text-neutral-500 ml-1">Books</span></div>
                <div><span className="font-bold text-neutral-900 dark:text-dark-900">{author.totalSoldUnits.toLocaleString()}</span><span className="text-neutral-500 ml-1">Units Sold</span></div>
                {author.avgRating > 0 && <StarRating rating={author.avgRating} />}
              </div>
            </div>
          </div>

          {books.length > 0 && (
            <>
              <h2 className="text-h4 font-bold text-neutral-900 dark:text-dark-900 mb-4">Published Books</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {books.map((book) => (
                  <div key={book.bookId} className="bg-neutral-50 dark:bg-dark-50 rounded-xl border border-neutral-100 dark:border-dark-300 overflow-hidden hover:shadow-md transition-all">
                    {book.coverPage ? (
                      <img src={book.coverPage} alt={book.bookName} className="w-full h-40 object-cover" />
                    ) : (
                      <div className={`h-40 bg-gradient-to-br ${gradient(book.bookId)} flex items-center justify-center`}>
                        <BookOpen className="w-12 h-12 text-white/70" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-neutral-900 dark:text-dark-900 line-clamp-1">{book.bookName}</h3>
                      <p className="text-body-xs text-neutral-500 mt-0.5">{book.bookType} · {book.language}</p>
                      <p className="text-body-xs text-neutral-400 mt-1">{book.totalSellingUnits.toLocaleString()} units sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Listing View ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-white via-indigo-50/40 to-primary-50 dark:from-bg-dark-primary dark:via-bg-dark-secondary dark:to-bg-dark-primary">
        <div className="container-custom py-14 lg:py-20 text-center">
          <p className="text-body-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">Our Authors</p>
          <h1 className="text-h1 lg:text-display-3 font-extrabold text-neutral-900 dark:text-dark-900 mb-4">Meet the Published Authors</h1>
          <p className="max-w-xl mx-auto text-body-lg text-neutral-600 dark:text-dark-600">
            Discover the talented writers who trust POVITAL to bring their stories to readers across India and beyond.
          </p>
          {/* Search */}
          <div className="mt-8 max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by author name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button onClick={handleSearch} className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-body-sm font-medium transition-colors">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Authors Grid */}
      <section className="bg-white dark:bg-dark-100 py-14 lg:py-20">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-16"><Loader size="lg" /></div>
          ) : authors.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <p className="text-body-lg">No authors found.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {authors.map((author) => (
                <div
                  key={author.authorId}
                  className="bg-neutral-50 dark:bg-dark-50 rounded-2xl p-6 border border-neutral-100 dark:border-dark-300 hover:shadow-lg transition-all hover:-translate-y-1 text-center cursor-pointer"
                  onClick={() => openDetail(author.authorId)}
                >
                  {author.profilePicture ? (
                    <img src={author.profilePicture} alt={`${author.firstName} ${author.lastName}`} className="w-20 h-20 mx-auto mb-4 rounded-full object-cover shadow-lg" />
                  ) : (
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${gradient(author.authorId)} flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl font-bold text-white">{(author.firstName || 'A').charAt(0)}</span>
                    </div>
                  )}
                  <h3 className="text-body font-semibold text-neutral-900 dark:text-dark-900">{author.firstName} {author.lastName}</h3>
                  {author.location && (
                    <p className="text-body-xs text-neutral-500 dark:text-dark-500 flex items-center justify-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {author.location}
                    </p>
                  )}
                  <div className="mt-4 space-y-1.5 text-body-xs text-neutral-600 dark:text-dark-600">
                    <p className="flex items-center justify-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-primary-500" /> {author.booksPublished} Books Published
                    </p>
                    <p className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {author.totalSoldUnits.toLocaleString()} Units Sold
                    </p>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-body-sm font-medium rounded-lg transition-colors">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AuthorsPage;
