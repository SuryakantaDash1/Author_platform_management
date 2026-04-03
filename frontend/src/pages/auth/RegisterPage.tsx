import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Card } from '@/components';
import OTPInput from '@/components/auth/OTPInput';
import { BookIcon, MailIcon, UserIcon } from '@/assets/icons';
import axiosInstance from '@/api/axios.config';

type Step = 'email' | 'otp' | 'profile' | 'password';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Timer for resend OTP
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle Send OTP
  const handleSendOTP = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Validate email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // API call to send OTP
      const response = await axiosInstance.post('/author/auth/send-signup-otp', {
        email
      });

      const data = response.data;

      if (data.success) {
        setStep('otp');
        setResendTimer(120); // 2 minutes
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify OTP - just validate and move to profile step
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    // Just move to profile completion step
    // OTP will be verified when completing registration
    setStep('profile');
  };

  // Handle Google OAuth
  const handleGoogleSignup = () => {
    // Redirect to Google OAuth
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  // Handle Microsoft OAuth
  const handleMicrosoftSignup = () => {
    // Redirect to Microsoft OAuth
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/microsoft`;
  };

  // Handle Profile Completion - move to password step
  const handleCompleteProfile = () => {
    setError('');

    // Validation
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!lastName.trim()) {
      setError('Last name is required');
      return;
    }

    // Move to password step
    setStep('password');
  };

  // Handle Complete Registration - verify OTP and create account with password
  const handleCompleteRegistration = async () => {
    setError('');

    // Validation
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    // Check if password contains first name
    if (!password.toLowerCase().includes(firstName.toLowerCase())) {
      setError('Password must include your first name');
      return;
    }
    // Check if password has at least 3 numbers
    const numbers = password.match(/\d/g);
    if (!numbers || numbers.length < 3) {
      setError('Password must include at least 3 numbers');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/author/auth/verify-otp-signup', {
        email,
        otp,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        referralCode: referralCode.trim() || undefined
      });

      const data = response.data;

      if (data.success) {
        // Store tokens
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Navigate to dashboard
        navigate('/author/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render email input with OAuth options
  const renderEmailInput = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-h2 font-bold text-neutral-900 dark:text-dark-900 mb-2">
          Create Your Account
        </h1>
        <p className="text-body text-neutral-600 dark:text-dark-600">
          Get started with POVITAL for free
        </p>
      </div>

      {error && (
        <div className="p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-DEFAULT rounded-lg">
          <p className="text-body-sm text-error-DEFAULT">{error}</p>
        </div>
      )}

      {/* OAuth Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleGoogleSignup}
          className="w-full p-4 border-2 border-neutral-200 dark:border-dark-300 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:bg-neutral-50 dark:hover:bg-dark-200 transition-all group"
        >
          <div className="flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-body font-semibold text-neutral-900 dark:text-dark-900">
              Continue with Google
            </span>
          </div>
        </button>

        <button
          onClick={handleMicrosoftSignup}
          className="w-full p-4 border-2 border-neutral-200 dark:border-dark-300 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:bg-neutral-50 dark:hover:bg-dark-200 transition-all group"
        >
          <div className="flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f35325" d="M0 0h11v11H0z"/>
              <path fill="#81bc06" d="M12 0h11v11H12z"/>
              <path fill="#05a6f0" d="M0 12h11v11H0z"/>
              <path fill="#ffba08" d="M12 12h11v11H12z"/>
            </svg>
            <span className="text-body font-semibold text-neutral-900 dark:text-dark-900">
              Continue with Microsoft
            </span>
          </div>
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-300 dark:border-dark-400"></div>
        </div>
        <div className="relative flex justify-center text-body-sm">
          <span className="px-4 bg-white dark:bg-dark-100 text-neutral-500 dark:text-dark-500">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email Input */}
      <Input
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<MailIcon className="w-5 h-5" />}
        autoFocus
      />

      <Button
        variant="primary"
        fullWidth
        onClick={handleSendOTP}
        isLoading={isLoading}
        size="lg"
      >
        Continue with Email
      </Button>

      <div className="text-center mt-6">
        <p className="text-body-sm text-neutral-600 dark:text-dark-600">
          Already have an account?{' '}
          <Link to="/author/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );


  // Render OTP verification
  const renderOTPVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-h2 font-bold text-neutral-900 dark:text-dark-900 mb-2">
          Verify OTP
        </h1>
        <p className="text-body text-neutral-600 dark:text-dark-600">
          Enter the 6-digit code sent to{' '}
          <span className="font-semibold">{email}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-DEFAULT rounded-lg">
          <p className="text-body-sm text-error-DEFAULT">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <OTPInput
          length={6}
          value={otp}
          onChange={setOtp}
          onComplete={handleVerifyOTP}
          error={!!error}
        />

        {resendTimer > 0 ? (
          <p className="text-body-sm text-neutral-600 dark:text-dark-600 text-center">
            Resend OTP in {resendTimer}s
          </p>
        ) : (
          <button
            onClick={handleSendOTP}
            className="text-body-sm text-primary-600 dark:text-primary-400 hover:underline w-full"
          >
            Resend OTP
          </button>
        )}
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={handleVerifyOTP}
        isLoading={isLoading}
        disabled={otp.length !== 6}
        size="lg"
      >
        Verify OTP
      </Button>
    </div>
  );

  // Render profile completion
  const renderProfileCompletion = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-h2 font-bold text-neutral-900 dark:text-dark-900 mb-2">
          Complete Your Profile
        </h1>
        <p className="text-body text-neutral-600 dark:text-dark-600">
          Just a few more details to get started
        </p>
      </div>

      {error && (
        <div className="p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-DEFAULT rounded-lg">
          <p className="text-body-sm text-error-DEFAULT">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="First Name"
          placeholder="John"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          leftIcon={<UserIcon className="w-5 h-5" />}
          autoFocus
        />

        <Input
          label="Last Name"
          placeholder="Doe"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          leftIcon={<UserIcon className="w-5 h-5" />}
        />

        <Input
          label="Referral Code (Optional)"
          placeholder="Enter referral code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          helperText="Get 5% earnings on your referrer's sales"
        />
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={handleCompleteProfile}
        isLoading={isLoading}
        size="lg"
      >
        Continue
      </Button>
    </div>
  );

  // Render password setup
  const renderPasswordSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-h2 font-bold text-neutral-900 dark:text-dark-900 mb-2">
          Set Your Password
        </h1>
        <p className="text-body text-neutral-600 dark:text-dark-600">
          Create a secure password for your account
        </p>
      </div>

      {error && (
        <div className="p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-DEFAULT rounded-lg">
          <p className="text-body-sm text-error-DEFAULT">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <Input
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText={`Must include your first name (${firstName}) + at least 3 numbers (min 4 chars)`}
          autoFocus
        />

        <Input
          type="password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="p-3 bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-DEFAULT/30 rounded-lg">
          <p className="text-body-sm text-neutral-700 dark:text-dark-700 font-medium mb-2">
            Password Requirements:
          </p>
          <ul className="text-body-sm text-neutral-600 dark:text-dark-600 space-y-1">
            <li className="flex items-center gap-2">
              <span className={password.toLowerCase().includes(firstName.toLowerCase()) ? 'text-success-DEFAULT' : 'text-neutral-500'}>
                {password.toLowerCase().includes(firstName.toLowerCase()) ? '✓' : '○'}
              </span>
              Must include your first name ({firstName})
            </li>
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
        onClick={handleCompleteRegistration}
        isLoading={isLoading}
        size="lg"
      >
        Create Account
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-50">
      <Card variant="default" padding="lg" className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
              <BookIcon className="w-7 h-7 text-white" />
            </div>
            <span className="text-h3 font-bold text-neutral-900 dark:text-dark-900">
              POVITAL
            </span>
          </div>
        </div>

        {/* Render current step */}
        {step === 'email' && renderEmailInput()}
        {step === 'otp' && renderOTPVerification()}
        {step === 'profile' && renderProfileCompletion()}
        {step === 'password' && renderPasswordSetup()}
      </Card>
    </div>
  );
};

export default RegisterPage;
