import React from 'react';
import { MapPin, Calendar, BookOpen, TrendingUp } from 'lucide-react';

const placeholderAuthors = [
  { id: 1, name: 'Ravi Sharma', location: 'Mumbai, India', joinDate: 'Jan 2022', booksPublished: 5, netRoyalty: '1,24,000', gradient: 'from-blue-400 to-indigo-500' },
  { id: 2, name: 'Priya Patel', location: 'Delhi, India', joinDate: 'Mar 2021', booksPublished: 8, netRoyalty: '2,56,000', gradient: 'from-purple-400 to-pink-500' },
  { id: 3, name: 'Amit Verma', location: 'Bangalore, India', joinDate: 'Jul 2023', booksPublished: 3, netRoyalty: '89,000', gradient: 'from-teal-400 to-emerald-500' },
  { id: 4, name: 'Neha Gupta', location: 'Pune, India', joinDate: 'Nov 2022', booksPublished: 6, netRoyalty: '1,78,000', gradient: 'from-orange-400 to-amber-500' },
  { id: 5, name: 'Suresh Kumar', location: 'Chennai, India', joinDate: 'Feb 2023', booksPublished: 4, netRoyalty: '96,000', gradient: 'from-rose-400 to-red-500' },
  { id: 6, name: 'Anjali Desai', location: 'Hyderabad, India', joinDate: 'Sep 2021', booksPublished: 10, netRoyalty: '3,45,000', gradient: 'from-cyan-400 to-blue-500' },
  { id: 7, name: 'Vikram Singh', location: 'Jaipur, India', joinDate: 'May 2022', booksPublished: 7, netRoyalty: '2,10,000', gradient: 'from-lime-400 to-green-500' },
  { id: 8, name: 'Kavita Rao', location: 'Kolkata, India', joinDate: 'Aug 2023', booksPublished: 2, netRoyalty: '45,000', gradient: 'from-fuchsia-400 to-purple-500' },
];

const AuthorsPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-white via-indigo-50/40 to-primary-50 dark:from-bg-dark-primary dark:via-bg-dark-secondary dark:to-bg-dark-primary">
        <div className="container-custom py-14 lg:py-20 text-center">
          <p className="text-body-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
            Our Authors
          </p>
          <h1 className="text-h1 lg:text-display-3 font-extrabold text-neutral-900 dark:text-dark-900 mb-4">
            Meet the Published Authors
          </h1>
          <p className="max-w-xl mx-auto text-body-lg text-neutral-600 dark:text-dark-600">
            Discover the talented writers who trust POVITAL to bring their stories to readers across India and beyond.
          </p>
        </div>
      </section>

      {/* Authors Grid */}
      <section className="bg-white dark:bg-dark-100 py-14 lg:py-20">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {placeholderAuthors.map((author) => (
              <div
                key={author.id}
                className="bg-neutral-50 dark:bg-dark-50 rounded-2xl p-6 border border-neutral-100 dark:border-dark-300 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${author.gradient} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{author.name.charAt(0)}</span>
                </div>
                <h3 className="text-body font-semibold text-neutral-900 dark:text-dark-900">{author.name}</h3>
                <p className="text-body-xs text-neutral-500 dark:text-dark-500 flex items-center justify-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {author.location}
                </p>
                <div className="mt-4 space-y-1.5 text-body-xs text-neutral-600 dark:text-dark-600">
                  <p className="flex items-center justify-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary-500" /> Joined {author.joinDate}</p>
                  <p className="flex items-center justify-center gap-1"><BookOpen className="w-3.5 h-3.5 text-primary-500" /> {author.booksPublished} Books Published</p>
                  <p className="flex items-center justify-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-green-500" /> ₹{author.netRoyalty} Net Royalty</p>
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-body-sm font-medium rounded-lg transition-colors">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthorsPage;
