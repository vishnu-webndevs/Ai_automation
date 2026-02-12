import { useMemo, useState } from 'react';
import { getAdminToken, loginAdmin, logoutAdmin } from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        <h2 className="text-xl font-bold mb-4">Admin Session</h2>

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
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@totan.ai" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
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
