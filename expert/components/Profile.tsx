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
        const userId = state.user?.id;
        const data = await expert.getProfile(userId);

        // Map backend Expert schema to frontend User schema if needed
        const mappedData = {
          ...data,
          name: data.expertName || data.name,
          phone: data.expertPhoneNumber || data.phone,
          email: data.expertEmail || data.email,
          division: data.expertDivision || data.division,
          district: data.expertDistrict || data.district,
          upazila: data.expertUpazila || data.upazila,
          address: data.expertAddress || data.address,
          bio: data.expertBio || data.bio,
          title: data.expertTitle || data.title,
          specialization: data.expertSpecialization || data.specialization,
          education: data.expertQualification || data.education,
          experience_years: data.expertExperience || data.experience_years,
          avatar: data.expertProfilePicture || data.avatar,
          rating: data.expertRating || data.rating || 0,
          reviews: data.expertTotalReviews || data.reviews || 0
        };

        setProfileData((prev: any) => ({ ...prev, ...mappedData }));
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

      const updatedData = updated.data || updated; // Handle both wrapper or direct response

      // Map backend to frontend for local state/store
      const mappedUpdated = {
        ...updatedData,
        name: updatedData.expertName || updatedData.name,
        phone: updatedData.expertPhoneNumber || updatedData.phone,
        email: updatedData.expertEmail || updatedData.email,
        division: updatedData.expertDivision || updatedData.division,
        district: updatedData.expertDistrict || updatedData.district,
        upazila: updatedData.expertUpazila || updatedData.upazila,
        address: updatedData.expertAddress || updatedData.address,
        bio: updatedData.expertBio || updatedData.bio,
        title: updatedData.expertTitle || updatedData.title,
        specialization: updatedData.expertSpecialization || updatedData.specialization,
        education: updatedData.expertQualification || updatedData.education,
        experience_years: updatedData.expertExperience || updatedData.experience_years,
        avatar: updatedData.expertProfilePicture || updatedData.avatar,
        rating: updatedData.expertRating || updatedData.rating || 0,
        reviews: updatedData.expertTotalReviews || updatedData.reviews || 0
      };

      // Merge with properly mapped fields having priority
      const finalUser = { ...profileData, ...mappedUpdated };

      setProfileData(finalUser);

      // Update context user to reflect changes everywhere
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUser = { ...currentUser, ...finalUser };

      localStorage.setItem('user', JSON.stringify(newUser));
      dispatch({ type: 'LOGIN', payload: newUser });

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

  if (!state.user) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 md:pl-80 pb-24 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile</h1>
            <p className="text-gray-500 mt-1">Manage your personal information and expertise.</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Identity Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center">
              <div className="relative group">
                <img
                  src={profileData.profile_picture || profileData.avatar}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                  alt="Profile"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-1">
                <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  {profileData.name}
                  {profileData.isVerified !== false && <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-50" />}
                </h2>
                <p className="text-sm font-medium text-gray-500">{profileData.title || 'Expert Agronomist'}</p>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${state.isOnline ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {state.isOnline ? '● Online' : '○ Offline'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {profileData.experience_years} Years Exp.
                </span>
              </div>

              <div className="mt-8 w-full border-t border-gray-100 pt-6">
                <div className="grid grid-cols-2 divide-x divide-gray-100">
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-gray-900">{profileData.rating || 0}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Rating</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-gray-900">{profileData.reviews || 0}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info (Compact) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">@</div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-gray-900 font-medium truncate">{profileData.email}</p>
                    <p className="text-xs text-gray-500">Email Address</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">#</div>
                  <div>
                    <p className="text-gray-900 font-medium">{profileData.phone}</p>
                    <p className="text-xs text-gray-500">Phone Number</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Edit Form */}
          <div className="lg:col-span-8 space-y-6">

            {/* About Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                About
              </h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profileData.bio || ''}
                  onChange={handleChange}
                  className="w-full text-sm text-gray-700 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl bg-gray-50 p-4 min-h-[120px] transition-all"
                  placeholder="Tell farmers about your expertise..."
                />
              ) : (
                <p className="text-gray-600 leading-relaxed text-sm break-words whitespace-pre-line">
                  {profileData.bio || 'No bio available yet. Click edit to add a professional summary.'}
                </p>
              )}
            </div>

            {/* Professional Info Grid */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Professional Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <ProfileField label="Full Name" name="name" value={profileData.name} isEditing={isEditing} onChange={handleChange} />
                <ProfileField label="Job Title" name="title" value={profileData.title} isEditing={isEditing} onChange={handleChange} placeholder="e.g. Senior Agronomist" />
                <ProfileField label="Specialization" name="specialization" value={profileData.specialization} isEditing={isEditing} onChange={handleChange} />
                <ProfileField label="Highest Education" name="education" value={profileData.education} isEditing={isEditing} onChange={handleChange} />
                <ProfileField label="Affiliation / Organization" name="affiliation" value={profileData.affiliation} isEditing={isEditing} onChange={handleChange} />
                <ProfileField label="Experience (Years)" name="experience_years" value={profileData.experience_years} type="number" isEditing={isEditing} onChange={handleChange} />
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Location & Service Area</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <ProfileField label="Division" name="division" value={profileData.division} isEditing={isEditing} onChange={handleChange} />
                <ProfileField label="District" name="district" value={profileData.district} isEditing={isEditing} onChange={handleChange} />
                <ProfileField label="Upazila" name="upazila" value={profileData.upazila} isEditing={isEditing} onChange={handleChange} />
                <ProfileField label="Full Address" name="address" value={profileData.address} isEditing={isEditing} onChange={handleChange} fullWidth />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for cleaner code
const ProfileField = ({ label, name, value, isEditing, onChange, type = "text", placeholder, fullWidth }: any) => (
  <div className={fullWidth ? "col-span-1 md:col-span-2" : ""}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
    {isEditing ? (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder || `Enter ${label}`}
        className="w-full text-sm font-medium text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all outline-none"
      />
    ) : (
      <p className="text-sm font-medium text-gray-900 border-b border-gray-50 py-2.5 break-words leading-relaxed">{value || <span className="text-gray-300 italic">Not set</span>}</p>
    )}
  </div>
);
