import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAppContext();
    const { phone: initialPhone, token } = location.state || {};

    const [formData, setFormData] = useState({
        name: '',
        phone: initialPhone || '',
        division: '',
        district: '',
        upazila: '',
        address: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock Register Call
            const response = await authService.register(formData);

            // Register returns updated user and tokens similar to login
            login(response.user as any, response.access);
            toast.success("Account Created Successfully!");
            navigate('/');
        } catch (error) {
            console.error("Registration failed", error);
            toast.error("Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">নতুন অ্যাকাউন্ট তৈরি করুন</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">নাম</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">মোবাইল নম্বর</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-100" readOnly />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-1">বিভাগ</label>
                            <input name="division" value={formData.division} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">জেলা</label>
                            <input name="district" value={formData.district} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-1">উপজেলা</label>
                            <input name="upazila" value={formData.upazila} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">ঠিকানা</label>
                            <input name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                        {loading ? 'অপেক্ষা করুন...' : 'নিবন্ধন করুন'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
