import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';
import { Upload, Check, AlertCircle, Loader2 } from 'lucide-react';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1: OTP
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [preAuthToken, setPreAuthToken] = useState('');

    // Step 2: Details
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        email: '',
        title: '',
        division: '',
        district: '',
        upazila: '',
        address: '',
        education: '',
        affiliation: '',
        experience_years: '',
        specialization: '',
        bio: '',
    });

    const [files, setFiles] = useState<{
        degree_certificate: File | null;
        nid_photo: File | null;
        profile_picture: File | null;
    }>({
        degree_certificate: null,
        nid_photo: null,
        profile_picture: null,
    });

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await auth.sendOtp(phone);
            setOtpSent(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await auth.verifyOtp(phone, otp);
            if (data.pre_auth_token) {
                setPreAuthToken(data.pre_auth_token);
                setStep(2);
            } else {
                // Unexpected state, maybe already registered? 
                // Logic for existing user login prompt could go here.
                setError('Unexpected response. Please try login.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
        if (e.target.files && e.target.files[0]) {
            setFiles({ ...files, [field]: e.target.files[0] });
        }
    };

    const handeRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('pre_auth_token', preAuthToken);
            data.append('phone', phone); // Explicitly adding phone though backend decodes token, helps validation

            // Append text fields
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key as keyof typeof formData]);
            });

            // Append files
            if (files.degree_certificate) data.append('degree_certificate', files.degree_certificate);
            if (files.nid_photo) data.append('nid_photo', files.nid_photo);
            if (files.profile_picture) data.append('profile_picture', files.profile_picture);

            const response = await auth.register(data);

            navigate('/login');
            alert("Registration Successful! Please login.");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Registration failed. Check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">Expert Registration</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-6">
                        {!otpSent ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="+8801700000000"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin" size={20} />}
                                    Send OTP
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="text-center mb-4">
                                    <p className="text-gray-600">OTP sent to {phone}</p>
                                    <button type="button" onClick={() => setOtpSent(false)} className="text-green-600 text-sm hover:underline">Change Number</button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-center text-2xl tracking-widest"
                                        placeholder="1234"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin" size={20} />}
                                    Verify & Continue
                                </button>
                            </form>
                        )}
                        <div className="text-center mt-4">
                            <Link to="/login" className="text-green-600 hover:underline">Already have an account? Login</Link>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handeRegister} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Personal Info */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input name="name" onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input name="email" type="email" onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input name="password" type="password" onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Professional Title</label>
                                <input name="title" placeholder="e.g. Senior Officer" onChange={handleChange} className="w-full p-2 border rounded-lg" />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Division</label>
                                <input name="division" onChange={handleChange} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">District</label>
                                <input name="district" onChange={handleChange} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Upazila</label>
                                <input name="upazila" onChange={handleChange} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address/Location</label>
                                <input name="address" onChange={handleChange} className="w-full p-2 border rounded-lg" />
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Highest Education</label>
                                <input name="education" onChange={handleChange} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Affiliation</label>
                                <input name="affiliation" onChange={handleChange} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                                <input name="experience_years" type="number" onChange={handleChange} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                                <input name="specialization" placeholder="e.g. Crop Disease" onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Short Bio</label>
                            <textarea name="bio" onChange={handleChange} className="w-full p-2 border rounded-lg h-24" />
                        </div>

                        {/* File Uploads */}
                        <div className="space-y-3 border-t pt-4">
                            <h3 className="font-semibold text-gray-700">Documents & Photos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-50">
                                    <label className="cursor-pointer block">
                                        <Upload className="mx-auto text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">Profile Photo</span>
                                        <input type="file" onChange={(e) => handleFileChange(e, 'profile_picture')} className="hidden" accept="image/*" />
                                        {files.profile_picture && <p className="text-xs text-green-600 mt-1 truncate">{files.profile_picture.name}</p>}
                                    </label>
                                </div>
                                <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-50">
                                    <label className="cursor-pointer block">
                                        <Upload className="mx-auto text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">Degree Cert.</span>
                                        <input type="file" onChange={(e) => handleFileChange(e, 'degree_certificate')} className="hidden" accept="image/*,application/pdf" />
                                        {files.degree_certificate && <p className="text-xs text-green-600 mt-1 truncate">{files.degree_certificate.name}</p>}
                                    </label>
                                </div>
                                <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-50">
                                    <label className="cursor-pointer block">
                                        <Upload className="mx-auto text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">NID/Pro ID</span>
                                        <input type="file" onChange={(e) => handleFileChange(e, 'nid_photo')} className="hidden" accept="image/*" />
                                        {files.nid_photo && <p className="text-xs text-green-600 mt-1 truncate">{files.nid_photo.name}</p>}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 mt-6"
                        >
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            Complete Registration
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
