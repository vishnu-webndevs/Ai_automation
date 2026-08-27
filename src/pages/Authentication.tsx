import { useMemo, useState } from 'react';
import axios from 'axios';
import { getAdminToken, loginAdmin, logoutAdmin, apiBaseUrl } from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // viewState: 'login' | 'forgot_email' | 'forgot_otp'
  const [viewState, setViewState] = useState<'login' | 'forgot_email' | 'forgot_otp'>('login');

  const token = useMemo(() => getAdminToken(), []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginAdmin({ email, password });
      window.location.href = '/web-admin';
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await axios.post(`${apiBaseUrl}/auth/forgot-password`, { email });
      setSuccessMsg(res.data?.message || 'A 6-digit OTP code has been sent to your email.');
      setViewState('forgot_otp');
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to send OTP email.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }
    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await axios.post(`${apiBaseUrl}/auth/reset-password`, {
        email,
        otp,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setSuccessMsg('Password has been reset successfully! You can now login with your new password.');
      setPassword(newPassword);
      setViewState('login');
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to reset password. Check your OTP.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutAdmin();
      window.location.reload();
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Logout failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Authentication</h1>
      <p className="text-gray-600 mb-8">Admin login for Totan.ai backend APIs.</p>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          {viewState === 'login' ? 'Admin Session' : viewState === 'forgot_email' ? 'Forgot Password' : 'Enter 6-Digit OTP'}
        </h2>

        {token ? (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-700">Status: Logged in</div>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button onClick={handleLogout} disabled={loading} className="w-full">
              {loading ? 'Working...' : 'Logout'}
            </Button>
          </div>
        ) : viewState === 'forgot_email' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Enter your email address to receive a 6-digit password reset OTP.</p>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {successMsg && <div className="text-sm text-emerald-600 font-medium">{successMsg}</div>}
            <Button onClick={handleSendOtp} disabled={loading} className="w-full">
              {loading ? 'Sending OTP...' : 'Send 6-Digit OTP'}
            </Button>
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setViewState('login'); setError(null); setSuccessMsg(null); }}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : viewState === 'forgot_otp' ? (
          <div className="space-y-4">
            {successMsg && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg mb-2">{successMsg}</div>}
            <div>
              <label className="block text-sm font-medium mb-1">Enter 6-Digit OTP</label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button onClick={handleResetPassword} disabled={loading} className="w-full">
              {loading ? 'Resetting Password...' : 'Reset & Save Password'}
            </Button>
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setViewState('login'); setError(null); setSuccessMsg(null); }}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
              />
              <div className="text-right -mt-2 mb-3">
                <button
                  type="button"
                  onClick={() => { setViewState('forgot_email'); setError(null); setSuccessMsg(null); }}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {successMsg && <div className="text-sm text-emerald-600 font-medium mb-2">{successMsg}</div>}
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Authentication;
