import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, ArrowRight, Loader2, AlertCircle, KeyRound, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// API URL - should come from env or constant
const API_URL = 'http://127.0.0.1:8000/api/v1/auth';

export const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [step, setStep] = useState<'PHONE' | 'PASSWORD' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Note: we can access dispatch here if we want to manually set user state, 
  // but StoreContext is set to auto-fetch profile on "token" presence. 
  // Ideally, after login, we might want to manually trigger that or just reload/navigate.
  // Changes to localStorage + navigate usually sufficient if StoreContext listens or re-mounts?
  // StoreContext checks on mount. Navigating to Dashboard (protected route) should work if the component mounts?
  // Actually, standard practice is to dispatch LOGIN action here too or have StoreContext listen to storage event (unreliable).
  // Better: Dispatch LOGIN or force a check. 
  // Simple approach: navigate, and let the destination component's data fetching relying on api.ts work. 
  // But StoreContext needs to know user is logged in to show correct UI.
  // We can just rely on `window.location.href` to force reload to ensure clean state, or dispatch(LOGIN) manually if we have user object.
  // Since we don't have full user object here without another fetch, force reload or simple navigate might rely on App wrapper.

  // Let's rely on navigating to /expert/dashboard. The dashboard layouts usually check store.
  // If store is empty, it might redirect back.
  // So we should probably fetch profile here or trigger context update.
  const { dispatch } = useStore();
  const navigate = useNavigate();

  const handleSuccess = async (token: string, isNewUser: boolean = false) => {
    localStorage.setItem('token', token);

    // Fetch profile to update Context immediately
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile = res.data;
      dispatch({
        type: 'LOGIN',
        payload: {
          id: profile.id || 'unknown',
          name: profile.personalDetails?.name || 'Expert',
          email: '',
          phone: profile.personalDetails?.phone || '',
          role: 'expert',
          region: profile.personalDetails?.district || '',
          qualification: '',
          experience: '',
          isVerified: profile.verified,
          avatar: profile.personalDetails?.profilePicture,
          bio: profile.personalDetails?.bio
        }
      });

      if (isNewUser) navigate('/complete-profile');
      else navigate('/expert/dashboard');

    } catch (e) {
      console.error("Profile fetch failed after login", e);
      // Fallback
      navigate('/expert/dashboard');
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format Phone
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('01')) formattedPhone = `+88${formattedPhone}`;
        else if (formattedPhone.startsWith('880')) formattedPhone = `+${formattedPhone}`;
        else formattedPhone = `+880${formattedPhone}`;
      }

      setPhone(formattedPhone);

      const res = await axios.post(`${API_URL}/check-user`, {
        phone: formattedPhone,
        role: 'expert'
      });

      if (res.data.exists && res.data.hasPassword) {
        setStep('PASSWORD');
      } else {
        setStep('OTP');
        toast.success("OTP sent! (Use 123456)");
      }

    } catch (err: any) {
      console.error(err);
      setError("Failed to verify number. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/login`, {
        phone,
        password,
        role: 'expert'
      });

      const { token } = res.data;
      await handleSuccess(token);

    } catch (err: any) {
      console.error(err);
      setError("Invalid password or login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/verify-otp`, {
        phone,
        otp,
        role: 'expert'
      });

      const { token, isNewUser } = res.data;
      await handleSuccess(token, isNewUser);

    } catch (err: any) {
      console.error(err);
      setError("Invalid OTP or verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 relative overflow-hidden">

      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/50 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo.png" alt="Shonali Desh Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Shonali Desh Expert</h1>
          <p className="text-gray-500 mt-2">Secure access for agricultural specialists</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {step === 'PHONE' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="+8801700000000"
                  required
                  autoFocus
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {step === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div className="text-center mb-2">
              <p className="text-sm text-gray-600">Welcome back! Please enter your password.</p>
              <p className="text-xs text-green-600 font-mono mt-1">{phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="******"
                  required
                  autoFocus
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep('OTP')}
              className="w-full text-sm text-gray-500 hover:text-green-600 mt-2"
            >
              Forgot Password? Login via OTP
            </button>
          </form>
        )}

        {step === 'OTP' && (
          <form onSubmit={handleOtpVerify} className="space-y-6">
            <div className="text-center mb-2">
              <p className="text-sm text-gray-600">Enter the verification code sent to</p>
              <p className="text-xs text-green-600 font-mono mt-1">{phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="123456"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Use <span className="font-mono text-gray-600 border px-1 rounded">123456</span> for testing</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Login"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          {step !== 'PHONE' && (
            <button onClick={() => { setStep('PHONE'); setError(''); }} className="text-green-600 hover:underline">
              Change Phone Number
            </button>
          )}
          {step === 'PHONE' && (
            <Link to="/register" className="text-green-600 font-semibold hover:underline">
              Create New Account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
