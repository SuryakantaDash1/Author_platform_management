import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@/components/common';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-50">
      <Card variant="default" padding="lg" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-h2 font-bold text-neutral-900 dark:text-dark-900 mb-2">
            Welcome to POVITAL
          </h1>
          <p className="text-body text-neutral-600 dark:text-dark-600">
            Select your role to continue
          </p>
        </div>

        <div className="space-y-4">
          {/* Admin Login */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => navigate('/admin/login')}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">👨‍💼</span>
              <span className="text-left">
                <div className="font-semibold">Admin Login</div>
                <div className="text-sm opacity-90">For Super Admin & Sub Admin</div>
              </span>
            </span>
            <span>→</span>
          </Button>

          {/* Author Login */}
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={() => navigate('/author/login')}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">✍️</span>
              <span className="text-left">
                <div className="font-semibold">Author Login</div>
                <div className="text-sm opacity-90">For Authors & Publishers</div>
              </span>
            </span>
            <span>→</span>
          </Button>
        </div>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-body-sm text-neutral-600 dark:text-dark-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary-DEFAULT hover:text-primary-dark font-semibold"
            >
              Register as Author
            </button>
          </p>
        </div>

        {/* Help Link */}
        <div className="mt-4 text-center">
          <a
            href="/help"
            className="text-body-sm text-neutral-500 dark:text-dark-500 hover:text-neutral-700"
          >
            Need help? Contact Support
          </a>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
