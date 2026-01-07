import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { login } = useAppContext();
  const navigate = useNavigate();

  // Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // UI State
  const [step, setStep] = useState<'PHONE' | 'PASSWORD' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Submit Phone to Check Status
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const status = await authService.checkStatus(phone);
      console.log("User Status:", status);

      if (status.exists && status.is_password_set) {
        // Old User with Password -> Go to Password Login
        setStep('PASSWORD');
      } else {
        // New User or No Password -> Send OTP -> Go to OTP
        await authService.sendOtp(phone);
        toast.success("OTP Sent! (Mock: 1234)");
        setStep('OTP');
      }
    } catch (err) {
      console.error(err);
      setError("ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  // Step 2A: Submit Password (Old User)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.loginWithPassword(phone, password);
      // Login Success
      handleLoginSuccess(response);
    } catch (err: any) {
      console.error(err);
      setError("পাসওয়ার্ড ভুল হয়েছে।");
      toast.error("Invalid Password");
    } finally {
      setLoading(false);
    }
  };

  // Step 2B: Submit OTP (New User / OTP Flow)
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyOtp(phone, otp);

      if (response.action === 'login') {
        handleLoginSuccess(response);
      } else if (response.action === 'register') {
        toast.success("New User! Redirecting to Registration...");
        navigate('/register', { state: { phone, token: response.pre_auth_token } });
      }
    } catch (err: any) {
      console.error(err);
      setError("ভুল ওটিপি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (response: any) => {
    const backendUser = response.user;
    const mappedUser = {
      id: backendUser.farmerID || backendUser.id,
      name: backendUser.farmerName || backendUser.name,
      phone: backendUser.farmerPhoneNumber || backendUser.phone,
      division: backendUser.farmerDivision || '',
      district: backendUser.farmerDistrict || '',
      upazila: backendUser.farmerUpazila || '',
      address: backendUser.farmerAddress || '',
      verified: true,
      role: 'farmer'
    };

    login(mappedUser as any, response.access);
    toast.success("লগিন সফল হয়েছে!");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-lg w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/50 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 text-green-600">
            <i className="fa-solid fa-wheat-awn text-5xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">সোনালী দেশ</h1>
          <p className="text-gray-500 mt-2">কৃষক লগিন</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        {/* STEP 1: PHONE INPUT */}
        {step === 'PHONE' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মোবাইল নম্বর</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">
                  <i className="fa-solid fa-phone"></i>
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="01700000000"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : (
                <>পরবর্তী ধাপ <i className="fa-solid fa-arrow-right"></i></>
              )}
            </button>
          </form>
        )}

        {/* STEP 2A: PASSWORD INPUT */}
        {step === 'PASSWORD' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">পাসওয়ার্ড দিন</label>
                <button type="button" onClick={() => setStep('PHONE')} className="text-xs text-green-600 hover:underline">নম্বর পরিবর্তন?</button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="********"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "লগিন করুন"}
            </button>
          </form>
        )}

        {/* STEP 2B: OTP INPUT */}
        {step === 'OTP' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">ওটিপি কোড (Mock: 1234)</label>
                <button type="button" onClick={() => setStep('PHONE')} className="text-xs text-green-600 hover:underline">নম্বর পরিবর্তন?</button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">
                  <i className="fa-solid fa-envelope-open-text"></i>
                </span>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="1234"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "যাচাই করুন"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;