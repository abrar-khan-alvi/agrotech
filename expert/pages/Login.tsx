import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Phone, ArrowRight, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { dispatch } = useStore();

    // Steps: 'PHONE' -> 'PASSWORD' (if exists) or 'OTP' (if new)
    const [step, setStep] = useState<'PHONE' | 'PASSWORD' | 'OTP'>('PHONE');
    const [loading, setLoading] = useState(false);

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    // Check if user exists
    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 11) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/v1/experts/auth/check-status/', { phone });
            if (res.data.exists) {
                setStep('PASSWORD');
                toast.success("Welcome back! Please enter your password.");
            } else {
                // Determine if we should send OTP immediately or ask user to requesting it
                // Flow says: "if not exists -> tell expert to give otp" 
                // Let's auto-trigger send OTP here for better UX
                await axios.post('http://127.0.0.1:8000/api/v1/experts/auth/otp/send/', { phone });
                setStep('OTP');
                toast('Sending OTP...', { icon: '📩' });
                toast.success("OTP sent to your mobile (Mock: 5678)");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error checking phone status");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/v1/experts/auth/login/', { phone, password });

            // Success
            const { access, user, name, role, uid } = res.data;
            localStorage.setItem('token', access); // Store mock token

            // Dispatch to context
            dispatch({
                type: 'LOGIN',
                payload: {
                    id: uid,
                    name: name,
                    phone: phone,
                    role: 'expert',
                    isVerified: true
                }
            });

            toast.success("Login Successful!");
            navigate('/expert/dashboard');

        } catch (error) {
            console.error(error);
            toast.error("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/v1/experts/auth/otp/verify/', { phone, code: otp });

            toast.success("OTP Verified! Please complete your profile.");
            // Redirect to registration/complete-profile with state
            navigate('/complete-profile', { state: { phone } });

        } catch (error) {
            console.error(error);
            toast.error("Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Expert Portal</h1>
                    <p className="text-gray-500 mt-2">
                        {step === 'PHONE' && "Enter your mobile number to continue"}
                        {step === 'PASSWORD' && "Enter your password to login"}
                        {step === 'OTP' && "Enter the OTP sent to your mobile"}
                    </p>
                </div>

                {step === 'PHONE' && (
                    <form onSubmit={handlePhoneSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="01XXXXXXXXX"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || phone.length < 11}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={20} /></>}
                        </button>
                    </form>
                )}

                {step === 'PASSWORD' && (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="******"
                                    required
                                />
                            </div>
                            <div className="flex justify-end mt-1">
                                <button type="button" onClick={() => setStep('PHONE')} className="text-xs text-green-600 hover:underline">Change Number</button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Login"}
                        </button>
                    </form>
                )}

                {step === 'OTP' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                placeholder="----"
                                maxLength={4}
                                required
                            />
                            <div className="flex justify-between mt-2">
                                <button type="button" onClick={() => setStep('PHONE')} className="text-xs text-gray-500 hover:text-green-600">Wrong Number?</button>
                                <button type="button" className="text-xs text-green-600 hover:underline">Resend OTP</button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || otp.length < 4}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Verify & Register"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
