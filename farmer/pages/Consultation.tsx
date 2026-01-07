import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Expert } from '../types';
import api, { API_ROOT } from '../services/api';

const Experts: React.FC = () => {
   const { fieldId } = useParams<{ fieldId: string }>();
   const { requests, addRequest, lastExpertUpdate } = useAppContext();

   // State
   const [experts, setExperts] = useState<Expert[]>([]);
   const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedSpecialty, setSelectedSpecialty] = useState('');

   // Request Form State
   const [showRequestModal, setShowRequestModal] = useState(false);
   const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
   const [requestDescription, setRequestDescription] = useState('');
   const [requestIssueType, setRequestIssueType] = useState('সাধারণ জিজ্ঞাসা');
   const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
      fetchExperts();
   }, []);

   useEffect(() => {
      filterExperts();
   }, [searchQuery, selectedSpecialty, experts]);

   // Real-time Status Update
   useEffect(() => {
      if (lastExpertUpdate) {
         setExperts(prev => prev.map(exp =>
            exp.user.toString() === lastExpertUpdate.expertId
               ? { ...exp, is_online: lastExpertUpdate.isOnline }
               : exp
         ));
         // Also update filtered list if needed, relying on 'experts' dependency in filterExperts usually works but let's be safe
         // The filterExperts effect depends on [experts], so updating 'experts' above triggers filterExperts automatically.
      }
   }, [lastExpertUpdate]);

   const fetchExperts = async () => {
      try {
         const response = await api.get(`${API_ROOT}/experts/`);
         setExperts(response.data);
         setFilteredExperts(response.data);
      } catch (error) {
         console.error("Failed to fetch experts", error);
      } finally {
         setLoading(false);
      }
   };

   const filterExperts = () => {
      let temp = experts;
      if (searchQuery) {
         temp = temp.filter(e =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.specialization.toLowerCase().includes(searchQuery.toLowerCase())
         );
      }
      if (selectedSpecialty) {
         temp = temp.filter(e => e.specialization === selectedSpecialty);
      }
      setFilteredExperts(temp);
   };

   const specialties = Array.from(new Set(experts.map(e => e.specialization)));
   const onlineCount = experts.filter(e => e.is_online).length;

   const handleRequestClick = (expert: Expert) => {
      setSelectedExpert(expert);
      setShowRequestModal(true);
   };

   const submitRequest = async () => {
      if (!selectedExpert) return;
      setSubmitting(true);
      try {
         const payload = {
            expert: selectedExpert.user,
            field: fieldId, // Send specific field ID
            issue_type: requestIssueType,
            description: requestDescription,
            status: 'PENDING'
         };

         const response = await api.post(`${API_ROOT}/consultations/`, payload);

         // Add to local context context
         // Ideally transform the response to match ConsultationRequest type
         // For now just mock it or if backend returns same structure use it
         // addRequest(response.data); 

         alert("আপনার অনুরোধ সফলভাবে পাঠানো হয়েছে!");
         setShowRequestModal(false);
         setRequestDescription('');
         setSelectedExpert(null);
      } catch (error: any) {
         console.error("Failed to send request", error);
         const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : "অনুরোধ পাঠাতে সমস্যা হয়েছে।";
         alert(`ত্রুটি: ${errorMsg}`);
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="space-y-6 relative">
         {/* Header */}
         <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">কৃষি বিশেষজ্ঞ</h2>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">অনলাইন: {onlineCount} জন</span>
         </div>

         {/* Search/Filter */}
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <div className="relative">
               <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
               <input
                  type="text"
                  placeholder="বিশেষজ্ঞ খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-leaf-500 focus:border-leaf-500 text-sm"
               />
            </div>
            <div>
               <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-leaf-500 focus:border-leaf-500 text-sm bg-white"
               >
                  <option value="">সকল বিশেষজ্ঞ</option>
                  {specialties.map((spec, idx) => (
                     <option key={idx} value={spec}>{spec}</option>
                  ))}
               </select>
            </div>
         </div>

         {/* Active Requests */}
         {requests.filter(r => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status)).map(activeReq => (
            <div key={activeReq.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
               <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 text-yellow-600 animate-pulse">
                  <i className="fa-regular fa-clock text-2xl"></i>
               </div>
               <h3 className="font-bold text-gray-800">অনুরোধ প্রক্রিয়াধীন</h3>
               <p className="text-sm text-gray-500 mt-1">একজন বিশেষজ্ঞ শীঘ্রই আপনার সাথে যোগাযোগ করবেন</p>
               <span className="block mt-2 text-xs text-gray-400 font-mono">ID: {activeReq.id}</span>
               {/* <button className="mt-4 text-red-500 text-sm font-medium">বাতিল করুন</button> */}
            </div>
         ))}

         {/* List */}
         <div>
            <h3 className="font-bold text-gray-800 mb-3">আমাদের বিশেষজ্ঞ প্যানেল</h3>
            {loading ? (
               <div className="text-center py-10 text-gray-400">লোড হচ্ছে...</div>
            ) : filteredExperts.length === 0 ? (
               <div className="text-center py-10 text-gray-400">কোনো বিশেষজ্ঞ পাওয়া যায়নি</div>
            ) : (
               <div className="space-y-3">
                  {filteredExperts.map(expert => (
                     <div key={expert.id} className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col space-y-3">
                        <div className="flex items-start space-x-3">
                           <div className="relative shrink-0">
                              <img
                                 src={expert.profile_picture || `https://ui-avatars.com/api/?name=${expert.name}&background=random`}
                                 className="w-14 h-14 rounded-full object-cover border border-gray-100"
                                 alt={expert.name}
                              />
                              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${expert.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                 <h4 className="font-bold text-gray-800 truncate">{expert.name}</h4>
                                 <div className="flex items-center text-yellow-400 text-xs">
                                    <i className="fa-solid fa-star mr-1"></i>
                                    <span className="text-gray-600 font-medium">{expert.rating?.toFixed(1) || 'N/A'}</span>
                                 </div>
                              </div>
                              <p className="text-xs text-leaf-600 font-medium mb-0.5">{expert.title}</p>
                              <p className="text-xs text-gray-500 mb-1">{expert.specialization}</p>
                              <div className="flex items-center space-x-2 text-[10px] text-gray-400">
                                 <span className="bg-gray-100 px-2 py-0.5 rounded flex items-center">
                                    <i className="fa-solid fa-briefcase mr-1"></i>
                                    {expert.experience_years} বছরের অভিজ্ঞতা
                                 </span>
                              </div>
                           </div>
                        </div>

                        <div className="pt-2 border-t border-gray-50">
                           <button
                              onClick={() => handleRequestClick(expert)}
                              className="w-full flex items-center justify-center space-x-2 bg-leaf-50 text-leaf-700 py-2 rounded-lg font-bold text-sm hover:bg-leaf-100 transition-colors"
                           >
                              <i className="fa-regular fa-comment-dots"></i>
                              <span>পরামর্শের অনুরোধ পাঠান</span>
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Request Modal */}
         {showRequestModal && selectedExpert && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
               <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up sm:animate-fade-in shadow-2xl">
                  <div className="text-center mb-6">
                     <div className="w-12 h-12 bg-leaf-100 text-leaf-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fa-solid fa-file-signature text-xl"></i>
                     </div>
                     <h3 className="text-lg font-bold text-gray-800">পরামর্শের অনুরোধ</h3>
                     <p className="text-sm text-gray-500">বিশেষজ্ঞ: <span className="font-bold text-gray-700">{selectedExpert.name}</span></p>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">সমস্যার ধরন</label>
                        <select
                           value={requestIssueType}
                           onChange={e => setRequestIssueType(e.target.value)}
                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-leaf-500 bg-white"
                        >
                           <option>পোকামাকড় আক্রমণ</option>
                           <option>ফসলের রোগ</option>
                           <option>সার ও মাটি ব্যবস্থাপনা</option>
                           <option>সেচ ও পানি</option>
                           <option>সাধারণ জিজ্ঞাসা</option>
                           <option>অন্যান্য</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">বিস্তারিত বিবরণ</label>
                        <textarea
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-leaf-500 min-h-[100px]"
                           placeholder="আপনার সমস্যা বিস্তারিত লিখুন..."
                           value={requestDescription}
                           onChange={e => setRequestDescription(e.target.value)}
                        ></textarea>
                     </div>

                     <div className="flex space-x-3 pt-2">
                        <button
                           onClick={() => setShowRequestModal(false)}
                           className="flex-1 py-1 px-4 border border-gray-300 rounded-lg text-gray-600 font-bold text-sm bg-white hover:bg-gray-50"
                        >
                           বন্ধ করুন
                        </button>
                        <button
                           onClick={submitRequest}
                           disabled={submitting}
                           className="flex-[#2] py-3 px-6 bg-leaf-600 text-white rounded-lg font-bold text-sm hover:bg-leaf-700 shadow-md shadow-leaf-200 disabled:opacity-70 flex items-center justify-center space-x-2"
                        >
                           {submitting && <i className="fa-solid fa-spinner fa-spin"></i>}
                           <span>পাঠান</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Experts;