import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Card } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/api/axios.config';
import OTPInput from '@/components/auth/OTPInput';

type Step = 'form' | 'otp' | 'password';

interface Step1Errors {
  firstName?: string;
  mobile?: string;
  email?: string;
}

interface Step3Errors {
  password?: string;
  confirmPassword?: string;
}

const AuthorSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [step3Errors, setStep3Errors] = useState<Step3Errors>({});

  // ---------- Step 1: validate + send OTP ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors: Step1Errors = {};
    if (!firstName.trim()) errors.firstName = 'First name is required';
    else if (firstName.trim().length < 2) errors.firstName = 'First name must be at least 2 characters';
    if (!mobile) errors.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(mobile)) errors.mobile = 'Mobile number must be 10 digits';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address';

    if (Object.keys(errors).length > 0) {
      setStep1Errors(errors);
      return;
    }
    setStep1Errors({});

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/author/auth/send-signup-otp', { email });
      if (response.data.success) {
        setStep('otp');
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Step 2: verify OTP with backend ----------
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/author/auth/check-otp', { email, otp });
      if (response.data.success) {
        setStep('password');
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Step 3: password validation + register ----------
  const handleRegister = async () => {
    setError('');

    const errors: Step3Errors = {};
    if (!password) errors.password = 'Password is required';
    else if (password.length < 4) errors.password = 'Password must be at least 4 characters';
    else if ((password.match(/\d/g) || []).length < 3) errors.password = 'Password must include at least 3 numbers';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setStep3Errors(errors);
      return;
    }
    setStep3Errors({});

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/author/auth/verify-otp-signup', {
        email,
        otp,
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        mobile: mobile.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
      });

      if (response.data.success) {
        login(response.data.data.user, response.data.data.tokens);
        navigate('/author/dashboard');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────
  // Step: OTP
  // ──────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-50">
        <Card variant="default" padding="lg" className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-h2 font-bold text-neutral-900 dark:text-dark-900 mb-2">Verify OTP</h1>
            <p className="text-body text-neutral-600 dark:text-dark-600">
              Enter the OTP sent to <strong>{email}</strong>
            </p>
          </div>

          {error && (
            <div className="p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-DEFAULT rounded-lg mb-4">
              <p className="text-body-sm text-error-DEFAULT">{error}</p>
            </div>
          )}

          <OTPInput value={otp} onChange={setOtp} length={6} />

          <Button variant="primary" fullWidth onClick={handleVerifyOTP} isLoading={isLoading} size="lg" className="mt-6">
            Verify OTP
          </Button>

          <button
            type="button"
            onClick={() => { setStep('form'); setOtp(''); setError(''); }}
            className="w-full mt-3 text-center text-body-sm text-neutral-500 hover:text-neutral-700 dark:text-dark-500 dark:hover:text-dark-700"
          >
            ← Back to form
          </button>
        </Card>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Step: Password (same as before, with validation here)
  // ──────────────────────────────────────────────
  if (step === 'password') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-50">
        <Card variant="default" padding="lg" className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-h2 font-bold text-neutral-900 dark:text-dark-900 mb-2">
              Set Your Password
            </h1>
            <p className="text-body text-neutral-600 dark:text-dark-600">
              Create a secure password for your account
            </p>
          </div>

          {error && (
            <div className="p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-DEFAULT rounded-lg mb-4">
              <p className="text-body-sm text-error-DEFAULT">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (step3Errors.password) setStep3Errors((p) => ({ ...p, password: undefined }));
                  if (confirmPassword && step3Errors.confirmPassword) setStep3Errors((p) => ({ ...p, confirmPassword: undefined }));
                }}
                helperText="Minimum 4 characters with at least 3 numbers"
              />
              {step3Errors.password && (
                <p className="mt-1 text-xs text-red-600">{step3Errors.password}</p>
              )}
            </div>

            <div>
              <Input
                type="password"
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (step3Errors.confirmPassword) setStep3Errors((p) => ({ ...p, confirmPassword: undefined }));
                }}
              />
              {step3Errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{step3Errors.confirmPassword}</p>
              )}
            </div>

            <div className="p-3 bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-DEFAULT/30 rounded-lg">
              <p className="text-body-sm text-neutral-700 dark:text-dark-700 font-medium mb-2">
                Password Requirements:
              </p>
              <ul className="text-body-sm text-neutral-600 dark:text-dark-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className={(password.match(/\d/g) || []).length >= 3 ? 'text-success-DEFAULT' : 'text-neutral-500'}>
                    {(password.match(/\d/g) || []).length >= 3 ? '✓' : '○'}
                  </span>
                  At least 3 numbers
                </li>
                <li className="flex items-center gap-2">
                  <span className={password.length >= 4 ? 'text-success-DEFAULT' : 'text-neutral-500'}>
                    {password.length >= 4 ? '✓' : '○'}
                  </span>
                  Minimum 4 characters
                </li>
                <li className="flex items-center gap-2">
                  <span className={password && confirmPassword && password === confirmPassword ? 'text-success-DEFAULT' : 'text-neutral-500'}>
                    {password && confirmPassword && password === confirmPassword ? '✓' : '○'}
                  </span>
                  Passwords match
                </li>
              </ul>
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleRegister}
            isLoading={isLoading}
            size="lg"
            className="mt-6"
          >
            Create Account
          </Button>
        </Card>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Step 1: Registration Form (name, mobile, email, referral only)
  // ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-800 flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white">
        <h1 className="text-4xl font-bold mb-6">Hello Author</h1>
        <p className="text-xl mb-8">
          We happy to announce this<br />
          Daily <span className="font-bold">10000+</span> professionals author are getting royalty up to 1 lakh
        </p>
        <ul className="space-y-4">
          <li className="flex items-center gap-3">
            <span className="text-2xl">•</span>
            <span>Start explore the beautiful platform for writing solutions.</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">•</span>
            <span>An analytic dashboard for royalty transparent.</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">•</span>
            <span>Easy to use and fast forwarding.</span>
          </li>
        </ul>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card variant="default" padding="lg" className="w-full max-w-md">
          <h2 className="text-h3 font-bold text-neutral-900 dark:text-dark-900 mb-6">
            Author Sign Up!
          </h2>

          {error && (
            <div className="p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-DEFAULT rounded-lg mb-4">
              <p className="text-body-sm text-error-DEFAULT">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  label="First Name *"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (step1Errors.firstName) setStep1Errors((p) => ({ ...p, firstName: undefined }));
                  }}
                />
                {step1Errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{step1Errors.firstName}</p>
                )}
              </div>
              <div>
                <Input
                  type="text"
                  label="Last Name"
                  placeholder="Last Name (optional)"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <Input
                type="tel"
                label="Mobile No *"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                  if (step1Errors.mobile) setStep1Errors((p) => ({ ...p, mobile: undefined }));
                }}
              />
              {step1Errors.mobile && (
                <p className="mt-1 text-xs text-red-600">{step1Errors.mobile}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Input
                type="email"
                label="Email ID *"
                placeholder="Email ID"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (step1Errors.email) setStep1Errors((p) => ({ ...p, email: undefined }));
                }}
              />
              {step1Errors.email && (
                <p className="mt-1 text-xs text-red-600">{step1Errors.email}</p>
              )}
            </div>

            {/* Referral Code */}
            <Input
              type="text"
              label="Have a Referral Code?"
              placeholder="Have a Referral Code?"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              size="lg"
              className="mt-2"
            >
              Sign Up
            </Button>

            <div className="text-center mt-2">
              <p className="text-body-sm text-neutral-600 dark:text-dark-600">
                I have an account{' '}
                <Link to="/author/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AuthorSignupPage;
