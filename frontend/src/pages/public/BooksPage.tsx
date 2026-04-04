import React from 'react';
import { BookOpen, Star, ShoppingCart } from 'lucide-react';

const placeholderBooks = [
  { id: 1, title: 'The Art of Creative Writing', type: 'Paperback', author: 'Ravi Sharma', unitsSold: 1240, price: 299, originalPrice: 499, rating: 4.5, gradient: 'from-indigo-400 to-purple-500' },
  { id: 2, title: 'Digital Marketing Mastery', type: 'E-Book', author: 'Priya Patel', unitsSold: 890, price: 199, originalPrice: 399, rating: 4.8, gradient: 'from-emerald-400 to-teal-500' },
  { id: 3, title: 'Mindful Leadership', type: 'Hardcover', author: 'Amit Verma', unitsSold: 2100, price: 349, originalPrice: 599, rating: 4.3, gradient: 'from-orange-400 to-red-500' },
  { id: 4, title: 'Science of Happiness', type: 'Paperback', author: 'Neha Gupta', unitsSold: 760, price: 249, originalPrice: 449, rating: 4.7, gradient: 'from-pink-400 to-rose-500' },
  { id: 5, title: 'Startup Essentials', type: 'E-Book', author: 'Suresh Kumar', unitsSold: 1560, price: 179, originalPrice: 349, rating: 4.6, gradient: 'from-cyan-400 to-blue-500' },
  { id: 6, title: 'Poetry of the Soul', type: 'Paperback', author: 'Anjali Desai', unitsSold: 430, price: 149, originalPrice: 299, rating: 4.9, gradient: 'from-fuchsia-400 to-purple-500' },
  { id: 7, title: 'History Unfolded', type: 'Hardcover', author: 'Vikram Singh', unitsSold: 980, price: 399, originalPrice: 699, rating: 4.4, gradient: 'from-amber-400 to-orange-500' },
  { id: 8, title: 'Cooking with Love', type: 'Paperback', author: 'Kavita Rao', unitsSold: 670, price: 219, originalPrice: 399, rating: 4.2, gradient: 'from-lime-400 to-green-500' },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars
              ? 'text-yellow-400 fill-yellow-400'
              : i === fullStars && hasHalf
              ? 'text-yellow-400 fill-yellow-400/50'
              : 'text-neutral-300 dark:text-dark-400'
          }`}
        />
      ))}
      <span className="ml-1 text-body-xs text-neutral-500 dark:text-dark-500">{rating}</span>
    </div>
  );
};

const BooksPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-white via-indigo-50/40 to-primary-50 dark:from-bg-dark-primary dark:via-bg-dark-secondary dark:to-bg-dark-primary">
        <div className="container-custom py-14 lg:py-20 text-center">
          <p className="text-body-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
            Book Catalogue
          </p>
          <h1 className="text-h1 lg:text-display-3 font-extrabold text-neutral-900 dark:text-dark-900 mb-4">
            Explore Published Books
          </h1>
          <p className="max-w-xl mx-auto text-body-lg text-neutral-600 dark:text-dark-600">
            Browse our growing catalogue of books across genres, published by talented authors on the POVITAL platform.
          </p>
        </div>
      </section>

      {/* Books Grid */}
      <section className="bg-neutral-50 dark:bg-bg-dark-secondary py-14 lg:py-20">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {placeholderBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-dark-100 rounded-2xl shadow-sm hover:shadow-lg border border-neutral-100 dark:border-dark-300 overflow-hidden transition-all hover:-translate-y-1"
              >
                <div className={`h-48 bg-gradient-to-br ${book.gradient} flex items-center justify-center`}>
                  <BookOpen className="w-16 h-16 text-white/80" />
                </div>
                <div className="p-4 space-y-2">
                  <div>
                    <h3 className="text-body font-semibold text-neutral-900 dark:text-dark-900 line-clamp-1">{book.title}</h3>
                    <p className="text-body-xs text-neutral-400 dark:text-dark-500">{book.type}</p>
                  </div>
                  <p className="text-body-sm text-neutral-600 dark:text-dark-600">by {book.author}</p>
                  <p className="text-body-xs text-neutral-400 dark:text-dark-500">{book.unitsSold.toLocaleString()} units sold</p>
                  <div className="flex items-center gap-2">
                    <span className="text-body font-bold text-primary-600 dark:text-primary-400">₹{book.price}</span>
                    <span className="text-body-xs text-neutral-400 line-through">₹{book.originalPrice}</span>
                  </div>
                  <StarRating rating={book.rating} />
                  <button className="w-full mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-body-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BooksPage;
