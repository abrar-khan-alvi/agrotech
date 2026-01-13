import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { User, MapPin, Mail, FileText, Loader2, Lock, Upload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { useStore } from '../context/StoreContext';

const CompleteProfile: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    // Initial phone from navigation state
    const initialPhone = location.state?.phone || '';

    // Check if we came from OTP verify
    useEffect(() => {
        if (!initialPhone) {
            toast.error("Unauthorized access");
            navigate('/login');
        }
    }, [initialPhone, navigate]);

    // File States
    const [nidFile, setNidFile] = useState<File | null>(null);
    const [certFile, setCertFile] = useState<File | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        password: '',
        email: '',
        division: '',
        district: '',
        upazila: '',
        address: '',
        bio: '',
        nid: '', // Added NID text field if needed, or file implies it
        specialization: 'General Agriculture'
    });

    const { dispatch } = useStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    canvas.height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                    } else {
                        reject(new Error("Canvas context not found"));
                    }
                };
                img.onerror = (e) => reject(e);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Prepare Base64 strings
            let nidUrl = null;
            let certUrl = null;
            let avatarUrl = null;

            if (avatarFile) {
                avatarUrl = await compressImage(avatarFile);
            }
            if (nidFile) {
                nidUrl = await compressImage(nidFile);
            }
            if (certFile) {
                certUrl = await compressImage(certFile);
            }

            // 2. Build Payload
            const payload = {
                expertName: formData.name,
                expertDivision: formData.division,
                expertDistrict: formData.district,
                expertUpazila: formData.upazila,
                expertAddress: formData.address,
                expertPhoneNumber: initialPhone,
                expertEmail: formData.email,
                expertProfilePicture: avatarUrl,
                expertNID: nidUrl, // Assuming storing base64 for now or needs text?
                expertDigitalCertificate: certUrl,
                expertBio: formData.bio,
                expertPassword: formData.password
            };

            // 3. Register Call
            const res = await axios.post('http://127.0.0.1:8000/api/v1/experts/auth/register/', payload);

            if (res.status === 200) {
                toast.success("Registration Successful! Please Login.");
                navigate('/login');
            }

        } catch (error: any) {
            console.error("Registration failed", error);
            const msg = error.response?.data?.detail || "Registration failed. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
            <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl p-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-green-800">Expert Registration</h1>
                    <p className="text-gray-500 mt-2">Please provide your professional details</p>
                    <p className="text-green-600 font-medium mt-1">Mobile: {initialPhone}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex justify-center mb-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                {avatarFile ? (
                                    <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-gray-400" />
                                )}
                            </div>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, setAvatarFile)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*"
                            />
                            <div className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full text-white">
                                <Upload size={12} />
                            </div>
                        </div>
                        <div className="ml-4 flex flex-col justify-center">
                            <span className="text-sm font-medium text-gray-700">Profile Picture</span>
                            <span className="text-xs text-gray-500">Tap to upload</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Dr. Firstname Lastname"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="expert@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Set Login Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="******"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                            <input
                                type="text"
                                name="division"
                                value={formData.division}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Dhaka"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Dhaka"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upazila</label>
                            <input
                                type="text"
                                name="upazila"
                                value={formData.upazila}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Savar"
                                required
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="House, Road, Village"
                                required
                            />
                        </div>
                    </div>

                    {/* Documents Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload NID (Image/PDF)</label>
                            <div className="relative flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {nidFile ? (
                                            <div className="flex flex-col items-center text-green-600">
                                                <CheckCircle className="w-8 h-8 mb-2" />
                                                <p className="text-xs text-gray-500">{nidFile.name}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                                <p className="text-xs text-gray-500">Click to upload NID</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, setNidFile)} accept="image/*,application/pdf" />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Certificate</label>
                            <div className="relative flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {certFile ? (
                                            <div className="flex flex-col items-center text-green-600">
                                                <CheckCircle className="w-8 h-8 mb-2" />
                                                <p className="text-xs text-gray-500">{certFile.name}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                                <p className="text-xs text-gray-500">Click to upload Certificate</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, setCertFile)} accept="image/*,application/pdf" />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
                                placeholder="Brief description of your expertise..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
