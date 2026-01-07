import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, MapPin, Award, Calendar, ShieldCheck, Edit2, Save, X } from 'lucide-react';
import { expert } from '../services/api';

export const Profile: React.FC = () => {
  const { state, dispatch } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(state.user || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await expert.getProfile();
        setProfileData((prev: any) => ({ ...prev, ...data }));
        // Update store if needed, or just local state
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const updated = await expert.updateProfile(profileData);
      setProfileData(updated.data); // Adjust based on API response structure
      // Update context user to reflect changes everywhere
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUser = { ...currentUser, ...updated.data };
      localStorage.setItem('user', JSON.stringify(newUser));
      // dispatch({ type: 'LOGIN', payload: newUser }); // Optional: if you want to update global state
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  if (!state.user) return <div>Loading...</div>;

  return (
    <div className="p-4 md:p-8 md:pl-72 max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-green-600 relative">
          <div className="absolute -bottom-12 left-6">
            <img src={profileData.profile_picture || profileData.avatar} className="w-24 h-24 rounded-full border-4 border-white object-cover" alt="Profile" />
          </div>
        </div>
        <div className="pt-14 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {profileData.name}
                <ShieldCheck className="w-5 h-5 text-blue-500" />
              </h2>
              <p className="text-gray-500">{profileData.phone}</p>
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-green-600 text-sm font-bold border border-green-600 px-4 py-1.5 rounded-full hover:bg-green-50 transition-colors">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 text-gray-600 text-sm font-bold border border-gray-300 px-4 py-1.5 rounded-full hover:bg-gray-50">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-green-600 text-white text-sm font-bold px-4 py-1.5 rounded-full hover:bg-green-700 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6">
            {/* Editable Fields Container */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                  {isEditing ? (
                    <input name="name" value={profileData.name || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
                  ) : (
                    <p className="font-medium">{profileData.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Title</label>
                  {isEditing ? (
                    <input name="title" value={profileData.title || ''} onChange={handleChange} className="w-full border rounded-lg p-2" placeholder="e.g. Senior Agronomist" />
                  ) : (
                    <p className="font-medium">{profileData.title || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Specialization</label>
                  {isEditing ? (
                    <input name="specialization" value={profileData.specialization || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
                  ) : (
                    <p className="font-medium">{profileData.specialization}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Education</label>
                  {isEditing ? (
                    <input name="education" value={profileData.education || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
                  ) : (
                    <p className="font-medium">{profileData.education || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Experience (Years)</label>
                  {isEditing ? (
                    <input name="experience_years" type="number" value={profileData.experience_years || 0} onChange={handleChange} className="w-full border rounded-lg p-2" />
                  ) : (
                    <p className="font-medium">{profileData.experience_years} Years</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Affiliation</label>
                  {isEditing ? (
                    <input name="affiliation" value={profileData.affiliation || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
                  ) : (
                    <p className="font-medium">{profileData.affiliation || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Bio</label>
                {isEditing ? (
                  <textarea name="bio" value={profileData.bio || ''} onChange={handleChange} className="w-full border rounded-lg p-2 h-24" />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{profileData.bio || 'No bio available.'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Division</label>
                  {isEditing ? (
                    <input name="division" value={profileData.division || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
                  ) : (
                    <p className="font-medium">{profileData.division || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">District</label>
                  {isEditing ? (
                    <input name="district" value={profileData.district || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
                  ) : (
                    <p className="font-medium">{profileData.district || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Upazila</label>
                  {isEditing ? (
                    <input name="upazila" value={profileData.upazila || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
                  ) : (
                    <p className="font-medium">{profileData.upazila || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Address</label>
                  {isEditing ? (
                    <input name="address" value={profileData.address || ''} onChange={handleChange} className="w-full border rounded-lg p-2" />
                  ) : (
                    <p className="font-medium">{profileData.address || '-'}</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
