import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // const { login } = useAppContext(); // No auto-login on register anymore
    const { phone: initialPhone } = location.state || {}; // token not needed for mock reg

    const [formData, setFormData] = useState({
        name: '',
        phone: initialPhone || '',
        division: '',
        district: '',
        upazila: '',
        address: '',
        nid: '',
        password: '',
        profilePicture: '',
        isSmartPhoneUser: true
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePicture: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.password) {
            toast.error("পাসওয়ার্ড দিতে হবে");
            setLoading(false);
            return;
        }

        try {
            // Mock Register Call
            await authService.register(formData);

            toast.success("নিবন্ধন সফল হয়েছে! অনুগ্রহ করে লগিন করুন।");
            navigate('/'); // Redirects to Login if not authenticated
        } catch (error) {
            console.error("Registration failed", error);
            toast.error("নিবন্ধন ব্যর্থ হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-green-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-green-700">নতুন অ্যাকাউন্ট তৈরি</h2>
                    <p className="text-gray-500 mt-2">আপনার তথ্য দিয়ে ফর্মটি পূরণ করুন</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">নাম</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                placeholder="আপনার নাম"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">মোবাইল নম্বর</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Address Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">বিভাগ</label>
                            <input name="division" value={formData.division} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="বিভাগ" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">জেলা</label>
                            <input name="district" value={formData.district} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="জেলা" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">উপজেলা</label>
                            <input name="upazila" value={formData.upazila} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="উপজেলা" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ঠিকানা</label>
                            <input name="address" value={formData.address} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="গ্রাম/রাস্তা" />
                        </div>
                    </div>

                    {/* NID & Smartphone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">জাতীয় পরিচয়পত্র নম্বর (NID)</label>
                            <input
                                name="nid"
                                value={formData.nid}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="NID নম্বর"
                            />
                        </div>
                        <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-xl border border-green-100 mt-6 md:mt-0">
                            <input
                                type="checkbox"
                                name="isSmartPhoneUser"
                                checked={formData.isSmartPhoneUser}
                                onChange={handleChange}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                                id="smartphone"
                            />
                            <label htmlFor="smartphone" className="text-sm font-medium text-gray-700 cursor-pointer">
                                আপনি কি স্মার্টফোন ব্যবহার করেন?
                            </label>
                        </div>
                    </div>

                    {/* Profile Picture */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">প্রোফাইল ছবি</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-green-200 flex-shrink-0">
                                {formData.profilePicture ? (
                                    <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                                        <i className="fa-solid fa-user text-3xl"></i>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">পাসওয়ার্ড সেট করুন</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-gray-400">
                                <i className="fa-solid fa-lock"></i>
                            </span>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="আপনার পাসওয়ার্ড (গোপন রাখুন)"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">পাসওয়ার্ডটি মনে রাখুন, পরবর্তীতে লগিন করতে প্রয়োজন হবে।</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg transform hover:-translate-y-0.5"
                    >
                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "নিবন্ধন সম্পন্ন করুন"}
                    </button>

                    <div className="text-center pt-2">
                        <button type="button" onClick={() => navigate('/')} className="text-sm text-green-600 hover:underline">
                            অ্যাকাউন্ট আছে? লগিন করুন
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
