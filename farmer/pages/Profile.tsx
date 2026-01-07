import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Profile: React.FC = () => {
    const { user, logout, login } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState(user?.name || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    if (!user) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('name', name);
            if (selectedFile) {
                data.append('profile_picture', selectedFile);
            }

            const response = await api.patch('profile/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update App Context with new user data
            login(response.data.user);
            setIsEditing(false);
            alert('প্রোফাইল আপডেট হয়েছে!');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert('দুঃখিত, আপডেট করা যায়নি। আবার চেষ্টা করুন।');
        } finally {
            setIsLoading(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setName(user.name);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    return (
        <div className="min-h-screen bg-leaf-50 pb-20">
            {/* Header */}
            <div className="bg-leaf-600 text-white p-6 rounded-b-3xl shadow-lg relative">
                <div className="flex justify-between items-center mb-6">
                    <Link to="/fields" className="text-white"><i className="fa-solid fa-arrow-left text-xl"></i></Link>
                    <h1 className="text-xl font-bold">আমার প্রোফাইল</h1>
                    <button onClick={logout} className="text-white text-sm bg-red-500/20 px-3 py-1 rounded-full backdrop-blur-sm border border-red-200/30">
                        লগআউট
                    </button>
                </div>

                <div className="flex flex-col items-center">
                    <div className="relative mb-3 group">
                        <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white relative">
                            {previewUrl || user.profile_picture ? (
                                <img src={previewUrl || user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-leaf-300 text-4xl bg-leaf-100">
                                    <i className="fa-solid fa-user"></i>
                                </div>
                            )}

                            {/* Edit Overlay */}
                            {isEditing && (
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-100 transition-opacity">
                                    <i className="fa-solid fa-camera text-white text-xl"></i>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="flex flex-col items-center gap-3 w-full max-w-xs animate-fade-in">
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="text-center font-bold text-gray-800 rounded px-3 py-1 outline-none focus:ring-2 ring-leaf-400 w-full"
                                placeholder="আপনার নাম"
                            />
                            <div className="flex space-x-2 w-full justify-center">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="bg-white text-leaf-700 px-4 py-1 rounded-full text-sm font-bold shadow-sm hover:bg-gray-100"
                                >
                                    {isLoading ? 'সেভ...' : 'সেভ'}
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-bold hover:bg-white/30"
                                >
                                    বাতিল
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-2 text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
                            >
                                <i className="fa-solid fa-pen mr-1"></i> এডিট করুন
                            </button>
                        </>
                    )}

                    <p className="opacity-90 mt-1">{user.phone}</p>
                </div>
            </div>

            <div className="p-4 space-y-4 -mt-4">
                {/* Location Info */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-leaf-100 relative">
                    <div className="flex justify-between items-center mb-3 border-b border-leaf-100 pb-2">
                        <h3 className="text-leaf-800 font-semibold">
                            <i className="fa-solid fa-location-dot mr-2"></i> ঠিকানা
                        </h3>
                    </div>

                    <div className="space-y-3 text-gray-600 text-sm">
                        <div className="flex justify-between">
                            <span>বিভাগ:</span>
                            <span className="font-medium text-gray-800">{user.division || '--'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>জেলা:</span>
                            <span className="font-medium text-gray-800">{user.district || '--'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>উপজেলা:</span>
                            <span className="font-medium text-gray-800">{user.upazila || '--'}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-gray-500 text-xs">বিস্তারিত ঠিকানা:</p>
                            <p className="font-medium text-gray-800 mt-1">{user.address || 'ঠিকানা নেই'}</p>
                        </div>
                    </div>
                </div>

                <div className="text-center text-xs text-gray-400 mt-6">
                    এগ্রিকানেক্ট আইডি: {user.id}
                </div>
            </div>
        </div>
    );
};

export default Profile;

