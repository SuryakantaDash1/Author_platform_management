import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, Award, Globe, TrendingUp, Building2,
  Star, ShoppingCart, MapPin, Calendar, ChevronDown, ChevronUp,
  MessageSquare, Phone, Mail, Send, BookMarked, PenTool,
  Sparkles, ArrowRight
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Placeholder data (no public API yet)                              */
/* ------------------------------------------------------------------ */

const stats = [
  { value: '10+', label: 'Years of Experience Book Publishing', icon: Award },
  { value: '50+', label: 'Team Members Working with Us', icon: Users },
  { value: '1.2k+', label: 'Happy Authors Working with Us', icon: PenTool },
  { value: '10.k+', label: 'Book Published on 100% Author Royalty', icon: BookOpen },
  { value: '570+', label: 'Offline Distribution Channel in India', icon: Building2 },
  { value: '10+', label: 'Selling Online Leading Platforms', icon: Globe },
];

const placeholderBooks = [
  {
    id: 1,
    title: 'The Art of Creative Writing',
    type: 'Paperback',
    author: 'Ravi Sharma',
    unitsSold: 1240,
    price: 299,
    originalPrice: 499,
    rating: 4.5,
    gradient: 'from-indigo-400 to-purple-500',
  },
  {
    id: 2,
    title: 'Digital Marketing Mastery',
    type: 'E-Book',
    author: 'Priya Patel',
    unitsSold: 890,
    price: 199,
    originalPrice: 399,
    rating: 4.8,
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 3,
    title: 'Mindful Leadership',
    type: 'Hardcover',
    author: 'Amit Verma',
    unitsSold: 2100,
    price: 349,
    originalPrice: 599,
    rating: 4.3,
    gradient: 'from-orange-400 to-red-500',
  },
  {
    id: 4,
    title: 'Science of Happiness',
    type: 'Paperback',
    author: 'Neha Gupta',
    unitsSold: 760,
    price: 249,
    originalPrice: 449,
    rating: 4.7,
    gradient: 'from-pink-400 to-rose-500',
  },
];

const placeholderAuthors = [
  {
    id: 1,
    name: 'Ravi Sharma',
    location: 'Mumbai, India',
    joinDate: 'Jan 2022',
    booksPublished: 5,
    netRoyalty: '1,24,000',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    id: 2,
    name: 'Priya Patel',
    location: 'Delhi, India',
    joinDate: 'Mar 2021',
    booksPublished: 8,
    netRoyalty: '2,56,000',
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    id: 3,
    name: 'Amit Verma',
    location: 'Bangalore, India',
    joinDate: 'Jul 2023',
    booksPublished: 3,
    netRoyalty: '89,000',
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    id: 4,
    name: 'Neha Gupta',
    location: 'Pune, India',
    joinDate: 'Nov 2022',
    booksPublished: 6,
    netRoyalty: '1,78,000',
    gradient: 'from-orange-400 to-amber-500',
  },
];

const faqItems = [
  {
    question: 'How do I enroll as School Admin?',
    answer:
      'You can enroll as a School Admin by visiting our registration page and selecting the "School Admin" option. Fill in the required details and our team will verify your institution within 24 hours.',
  },
  {
    question: 'Can a student enroll independently?',
    answer:
      'Yes, students can enroll independently through our platform. They will need a valid email address and can browse and purchase books directly from the marketplace.',
  },
  {
    question: 'Is There any trail for new users?',
    answer:
      'Yes! We offer a free trial period for new authors to explore the platform features. You can publish your first book and experience our distribution network before committing to a plan.',
  },
  {
    question: 'What does an Author should in daily file?',
    answer:
      'Authors should regularly update their book listings, respond to reader reviews, track their royalty earnings, and engage with the author community for better visibility and sales.',
  },
];

/* ------------------------------------------------------------------ */
/*  Star Rating Component                                             */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Item                                                */
/* ------------------------------------------------------------------ */

const FAQItem: React.FC<{
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ question, answer, isOpen, onToggle }) => (
  <div className="border border-neutral-200 dark:border-dark-300 rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-5 py-4 text-left bg-white dark:bg-dark-100 hover:bg-neutral-50 dark:hover:bg-dark-200 transition-colors"
    >
      <span className="text-body font-medium text-neutral-900 dark:text-dark-900 pr-4">
        {question}
      </span>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
      ) : (
        <ChevronDown className="w-5 h-5 text-neutral-400 dark:text-dark-500 shrink-0" />
      )}
    </button>
    {isOpen && (
      <div className="px-5 pb-4 bg-white dark:bg-dark-100">
        <p className="text-body-sm text-neutral-600 dark:text-dark-600 leading-relaxed">
          {answer}
        </p>
      </div>
    )}
  </div>
);

/* ================================================================== */
/*  HOME PAGE                                                         */
/* ================================================================== */

const HomePage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      {/* ============================================================ */}
      {/*  SECTION 1 — Hero                                           */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/40 to-primary-50 dark:from-bg-dark-primary dark:via-bg-dark-secondary dark:to-bg-dark-primary">
        <div className="container-custom py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <div className="max-w-xl">
              <h1 className="text-display-3 lg:text-display-2 font-extrabold text-neutral-900 dark:text-dark-900 leading-tight mb-6">
                Book Publishing in your{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-500 text-gradient">
                  Finger Tips!
                </span>
              </h1>
              <p className="text-body-lg text-neutral-600 dark:text-dark-600 mb-8 leading-relaxed">
                High-quality digital platform designed to help you learn faster,
                smarter, and at your own pace.
              </p>
              <Link
                to="/author/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5"
              >
                Let's Published
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right — Illustration Placeholder */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-br from-primary-200 via-primary-100 to-secondary-100 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-secondary-900/20 rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookMarked className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex gap-3 justify-center">
                    <div className="w-16 h-20 bg-gradient-to-b from-indigo-300 to-indigo-500 rounded-lg shadow-md" />
                    <div className="w-16 h-20 bg-gradient-to-b from-emerald-300 to-emerald-500 rounded-lg shadow-md -mt-2" />
                    <div className="w-16 h-20 bg-gradient-to-b from-orange-300 to-orange-500 rounded-lg shadow-md" />
                  </div>
                  <p className="text-body-sm font-medium text-primary-700 dark:text-primary-300">
                    Your next bestseller starts here
                  </p>
                </div>
              </div>
              {/* Floating decorations */}
              <div className="absolute top-8 right-8 w-16 h-16 bg-yellow-200 dark:bg-yellow-800/40 rounded-full opacity-60 blur-sm" />
              <div className="absolute bottom-12 left-4 w-12 h-12 bg-pink-200 dark:bg-pink-800/40 rounded-full opacity-60 blur-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — Stats Bar                                      */}
      {/* ============================================================ */}
      <section className="bg-white dark:bg-dark-100 border-y border-neutral-100 dark:border-dark-300">
        <div className="container-custom py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                  <s.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-h3 font-bold text-neutral-900 dark:text-dark-900">
                  {s.value}
                </p>
                <p className="text-body-xs text-neutral-500 dark:text-dark-500 mt-1 leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3 — Explore Books                                  */}
      {/* ============================================================ */}
      <section className="bg-neutral-50 dark:bg-bg-dark-secondary py-16 lg:py-20">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-10">
            <p className="text-body-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
              Explore
            </p>
            <h2 className="text-h2 lg:text-h1 font-bold text-neutral-900 dark:text-dark-900">
              The Books by categories.
            </h2>
          </div>

          {/* Book Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {placeholderBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-dark-100 rounded-2xl shadow-sm hover:shadow-lg border border-neutral-100 dark:border-dark-300 overflow-hidden transition-all hover:-translate-y-1 group"
              >
                {/* Cover placeholder */}
                <div
                  className={`h-48 bg-gradient-to-br ${book.gradient} flex items-center justify-center`}
                >
                  <BookOpen className="w-16 h-16 text-white/80" />
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-body font-semibold text-neutral-900 dark:text-dark-900 line-clamp-1">
                        {book.title}
                      </h3>
                      <p className="text-body-xs text-neutral-400 dark:text-dark-500">
                        {book.type}
                      </p>
                    </div>
                  </div>

                  <p className="text-body-sm text-neutral-600 dark:text-dark-600">
                    by {book.author}
                  </p>

                  <p className="text-body-xs text-neutral-400 dark:text-dark-500">
                    {book.unitsSold.toLocaleString()} units sold
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-body font-bold text-primary-600 dark:text-primary-400">
                      ₹{book.price}
                    </span>
                    <span className="text-body-xs text-neutral-400 line-through">
                      ₹{book.originalPrice}
                    </span>
                  </div>

                  <StarRating rating={book.rating} />

                  <button className="w-full mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-body-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Explore All */}
          <div className="flex justify-end mt-8">
            <Link
              to="/books"
              className="inline-flex items-center gap-1 text-body-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Explore All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 4 — CTA Banner                                     */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 dark:from-primary-950 dark:via-indigo-950 dark:to-primary-950">
        <div className="container-custom py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-h2 lg:text-h1 font-bold text-white mb-4">
                Have a Book Idea and Willing to be an Author?
              </h2>
              <p className="text-body-lg text-indigo-200 mb-8">
                Join thousands of authors who trust POVITAL to bring their books to
                life and reach readers across the globe.
              </p>
              <Link
                to="/author/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl shadow-lg hover:bg-neutral-50 transition-all hover:-translate-y-0.5"
              >
                Enroll Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Illustration placeholder */}
            <div className="hidden lg:flex justify-center">
              <div className="w-72 h-72 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20">
                <div className="text-center space-y-3">
                  <Sparkles className="w-16 h-16 text-yellow-300 mx-auto" />
                  <PenTool className="w-10 h-10 text-indigo-200 mx-auto" />
                  <p className="text-body-sm text-indigo-200 font-medium">
                    Start your journey today
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 5 — Explore Authors                                */}
      {/* ============================================================ */}
      <section className="bg-white dark:bg-dark-100 py-16 lg:py-20">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-10">
            <p className="text-body-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
              Explore Authors
            </p>
            <h2 className="text-h2 lg:text-h1 font-bold text-neutral-900 dark:text-dark-900">
              Touch with our greater authors.
            </h2>
          </div>

          {/* Author Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {placeholderAuthors.map((author) => (
              <div
                key={author.id}
                className="bg-neutral-50 dark:bg-dark-50 rounded-2xl p-6 border border-neutral-100 dark:border-dark-300 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
              >
                {/* Profile placeholder */}
                <div
                  className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${author.gradient} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-2xl font-bold text-white">
                    {author.name.charAt(0)}
                  </span>
                </div>

                <h3 className="text-body font-semibold text-neutral-900 dark:text-dark-900">
                  {author.name}
                </h3>
                <p className="text-body-xs text-neutral-500 dark:text-dark-500 flex items-center justify-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {author.location}
                </p>

                <div className="mt-4 space-y-1.5 text-body-xs text-neutral-600 dark:text-dark-600">
                  <p className="flex items-center justify-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    Joined {author.joinDate}
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                    {author.booksPublished} Books Published
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    ₹{author.netRoyalty} Net Royalty
                  </p>
                </div>

                <button className="mt-4 w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-body-sm font-medium rounded-lg transition-colors">
                  Order Now
                </button>
              </div>
            ))}
          </div>

          {/* Explore All */}
          <div className="flex justify-end mt-8">
            <Link
              to="/authors"
              className="inline-flex items-center gap-1 text-body-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Explore All Author
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 6 — Testimonials                                   */}
      {/* ============================================================ */}
      <section className="bg-neutral-50 dark:bg-bg-dark-secondary py-16 lg:py-20">
        <div className="container-custom">
          <div className="mb-10 text-center">
            <h2 className="text-h2 lg:text-h1 font-bold text-neutral-900 dark:text-dark-900">
              What feedback From Author & Visitor!
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left — Testimonial Card */}
            <div className="bg-white dark:bg-dark-100 rounded-2xl p-8 shadow-sm border border-neutral-100 dark:border-dark-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-white">A</span>
                </div>
                <div>
                  <h4 className="text-body font-semibold text-neutral-900 dark:text-dark-900">
                    Aarav Mehta
                  </h4>
                  <p className="text-body-xs text-neutral-500 dark:text-dark-500">
                    15 March, 2025
                  </p>
                </div>
              </div>
              <StarRating rating={5} />
              <p className="mt-4 text-body-sm text-neutral-600 dark:text-dark-600 leading-relaxed">
                "POVITAL transformed my publishing journey. The platform is incredibly
                easy to use, and the distribution network is outstanding. I reached
                readers across India within weeks of publishing my first book. Highly
                recommended for any aspiring author!"
              </p>

              {/* Carousel dots */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-dark-400" />
                <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-dark-400" />
                <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-dark-400" />
              </div>
            </div>

            {/* Right — Write Review CTA */}
            <div className="bg-white dark:bg-dark-100 rounded-2xl p-8 shadow-sm border border-neutral-100 dark:border-dark-300 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </div>

              <h3 className="text-h4 font-bold text-neutral-900 dark:text-dark-900 mb-2">
                Write Review
              </h3>
              <p className="text-body-sm text-neutral-500 dark:text-dark-500 mb-4">
                Always our user top priority for Us, please write a review
              </p>

              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-8 h-8 text-yellow-400 fill-yellow-400 cursor-pointer hover:scale-110 transition-transform"
                  />
                ))}
              </div>

              <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
                <Send className="w-4 h-4" />
                Write Review
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 7 — FAQ                                            */}
      {/* ============================================================ */}
      <section className="bg-white dark:bg-dark-100 py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left */}
            <div>
              <h2 className="text-h2 lg:text-h1 font-bold text-neutral-900 dark:text-dark-900 mb-4">
                Frequently Ask Questions
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-dark-600 mb-6">
                Ask anything via call, WhatsApp & E-mail also...
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-xl text-body-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call Us
                </a>
                <a
                  href="mailto:support@povital.com"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-xl text-body-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  E-mail
                </a>
              </div>
            </div>

            {/* Right — Accordion */}
            <div className="space-y-3">
              {faqItems.map((item, idx) => (
                <FAQItem
                  key={idx}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFAQ === idx}
                  onToggle={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer is rendered by PublicLayout */}
    </div>
  );
};

export default HomePage;
