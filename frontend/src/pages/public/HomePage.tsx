import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="text-center py-20">
        <h1 className="text-display-1 font-bold text-neutral-900 dark:text-dark-900 mb-6">
          Home Page
        </h1>
        <p className="text-body-lg text-neutral-600 dark:text-dark-600">
          Welcome to POVITAL - Author Platform Management
        </p>
      </div>
    </div>
  );
};

export default HomePage;
