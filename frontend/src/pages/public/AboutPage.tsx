import React from 'react';
import {
  BookOpen, Users, Globe, Award, Target, Eye,
  TrendingUp, Heart, Lightbulb, Shield
} from 'lucide-react';

const stats = [
  { value: '10+', label: 'Years of Experience', icon: Award },
  { value: '1.2k+', label: 'Happy Authors', icon: Users },
  { value: '10k+', label: 'Books Published', icon: BookOpen },
  { value: '570+', label: 'Distribution Channels', icon: Globe },
];

const values = [
  {
    icon: Heart,
    title: 'Author First',
    description:
      'We put authors at the center of everything we do, ensuring 100% royalty and transparent processes.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'Continuously improving our platform with cutting-edge technology to make publishing effortless.',
  },
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description:
      'Complete transparency in royalty calculations, sales reports, and distribution metrics.',
  },
  {
    icon: TrendingUp,
    title: 'Growth',
    description:
      'Helping authors grow their readership through our expansive offline and online distribution network.',
  },
];

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/40 to-primary-50 dark:from-bg-dark-primary dark:via-bg-dark-secondary dark:to-bg-dark-primary">
        <div className="container-custom py-16 lg:py-24 text-center">
          <p className="text-body-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
            About Us
          </p>
          <h1 className="text-display-3 lg:text-display-2 font-extrabold text-neutral-900 dark:text-dark-900 mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 text-gradient">
              POVITAL
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-body-lg text-neutral-600 dark:text-dark-600 leading-relaxed">
            POVITAL is a high-quality digital publishing platform designed to empower
            authors to publish, distribute, and earn from their books with complete
            transparency and 100% author royalty.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-dark-100 border-y border-neutral-100 dark:border-dark-300">
        <div className="container-custom py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <s.icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-h2 font-bold text-neutral-900 dark:text-dark-900">
                  {s.value}
                </p>
                <p className="text-body-sm text-neutral-500 dark:text-dark-500 mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-neutral-50 dark:bg-bg-dark-secondary py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-white dark:bg-dark-100 rounded-2xl p-8 border border-neutral-100 dark:border-dark-300 shadow-sm">
              <div className="w-14 h-14 mb-5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-h3 font-bold text-neutral-900 dark:text-dark-900 mb-3">
                Our Mission
              </h2>
              <p className="text-body text-neutral-600 dark:text-dark-600 leading-relaxed">
                To democratize book publishing by providing every author — whether
                first-time writers or seasoned professionals — with the tools,
                distribution channels, and transparency they deserve. We aim to make
                publishing accessible, affordable, and rewarding for creators across
                India and beyond.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white dark:bg-dark-100 rounded-2xl p-8 border border-neutral-100 dark:border-dark-300 shadow-sm">
              <div className="w-14 h-14 mb-5 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-h3 font-bold text-neutral-900 dark:text-dark-900 mb-3">
                Our Vision
              </h2>
              <p className="text-body text-neutral-600 dark:text-dark-600 leading-relaxed">
                To become the leading author-centric publishing platform in Asia,
                connecting millions of readers with diverse voices and stories. We
                envision a world where every story finds its audience, and every author
                is fairly compensated for their creative work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-white dark:bg-dark-100 py-16 lg:py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-body-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
              What We Stand For
            </p>
            <h2 className="text-h2 lg:text-h1 font-bold text-neutral-900 dark:text-dark-900">
              Our Core Values
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 dark:bg-dark-50 rounded-2xl p-6 border border-neutral-100 dark:border-dark-300 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <v.icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-h5 font-bold text-neutral-900 dark:text-dark-900 mb-2">
                  {v.title}
                </h3>
                <p className="text-body-sm text-neutral-600 dark:text-dark-600 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Stats CTA */}
      <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 dark:from-primary-950 dark:via-indigo-950 dark:to-primary-950 py-16">
        <div className="container-custom text-center">
          <h2 className="text-h2 lg:text-h1 font-bold text-white mb-4">
            Join Our Growing Community
          </h2>
          <p className="text-body-lg text-indigo-200 mb-8 max-w-2xl mx-auto">
            With over 50 dedicated team members and a network spanning 570+ offline
            distribution channels, POVITAL is your trusted partner in publishing.
          </p>
          <a
            href="/author/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl shadow-lg hover:bg-neutral-50 transition-all hover:-translate-y-0.5"
          >
            Become an Author
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
