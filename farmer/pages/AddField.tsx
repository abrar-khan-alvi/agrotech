import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Default Icon Issue in React
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
   iconUrl: icon,
   shadowUrl: iconShadow,
   iconSize: [25, 41],
   iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Bangladesh Center
const BANGLADESH_CENTER: [number, number] = [23.8103, 90.4125];

// Fix: Move MapEvents outside to prevent re-creation and ensure valid state updates
const MapEvents: React.FC<{ setCoordinates: React.Dispatch<React.SetStateAction<L.LatLng[]>> }> = ({ setCoordinates }) => {
   useMapEvents({
      click(e) {
         setCoordinates(prev => [...prev, e.latlng]);
      },
   });
   return null;
};

const AddField: React.FC = () => {
   const { addField } = useAppContext();
   const navigate = useNavigate();
   const [step, setStep] = useState<'MAP' | 'INFO'>('MAP');
   const [coordinates, setCoordinates] = useState<L.LatLng[]>([]);

   // Form State
   const [formData, setFormData] = useState({
      name: '',
      crop: '',
      harvestTime: '',
      area: '',
   });

   const resetMap = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCoordinates([]);
   };

   const handleMapSubmit = () => {
      if (coordinates.length < 3) {
         alert("দয়া করে জমির সীমানা নির্ধারণ করতে অন্তত ৩টি পয়েন্ট চিহ্নিত করুন");
         return;
      }
      setStep('INFO');
   };

   const handleFinalSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (coordinates.length < 3) return;

      // Calculate Center
      const latSum = coordinates.reduce((sum, c) => sum + c.lat, 0);
      const lngSum = coordinates.reduce((sum, c) => sum + c.lng, 0);
      const center = {
         lat: latSum / coordinates.length,
         lng: lngSum / coordinates.length
      };

      const payload = {
         name: formData.name,
         crop_type: formData.crop,
         harvest_time: formData.harvestTime || null,
         area_in_acres: parseFloat(formData.area) || 0,
         // Ensure we submit the Sorted Boundary
         boundary: [...coordinates].sort((a, b) => {
            const centerLat = coordinates.reduce((sum, p) => sum + p.lat, 0) / coordinates.length;
            const centerLng = coordinates.reduce((sum, p) => sum + p.lng, 0) / coordinates.length;
            const angleA = Math.atan2(a.lat - centerLat, a.lng - centerLng);
            const angleB = Math.atan2(b.lat - centerLat, b.lng - centerLng);
            return angleA - angleB;
         }).map(c => ({ lat: c.lat, lng: c.lng })),
         center: center
      };

      console.log('Submitting Payload:', payload);
      // alert(`Sending ${coordinates.length} points to backend.`); 

      try {
         const { default: api } = await import('../services/api');
         await api.post('/fields/', payload);
         addField({} as any); // Trigger refresh
         navigate('/fields');
      } catch (error) {
         console.error(error);
         alert("জমি সংরক্ষণ করতে সমস্যা হয়েছে!");
      }
   };

   return (
      <div className="bg-white min-h-[80vh] rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
         {/* Header */}
         <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
            <button onClick={() => step === 'INFO' ? setStep('MAP') : navigate('/fields')} className="text-gray-500 hover:text-gray-800">
               <i className="fa-solid fa-arrow-left"></i>
            </button>
            <h2 className="font-bold text-lg text-gray-800">
               {step === 'MAP' ? 'জমির সীমানা নির্ধারণ' : 'জমির তথ্য'}
            </h2>
         </div>

         {step === 'MAP' ? (
            <div className="flex-1 flex flex-col relative h-[600px]">
               {/* Instructions */}
               <div className="bg-yellow-50 p-3 text-xs text-yellow-800 border-b border-yellow-100 flex justify-between items-center z-[1000] relative">
                  <span><i className="fa-solid fa-info-circle mr-1"></i> ম্যাপে ট্যাপ করে জমির সীমানা চিহ্নিত করুন ({coordinates.length} পয়েন্ট)</span>
                  {coordinates.length > 0 && (
                     <button onClick={resetMap} className="text-red-600 font-bold underline">মুছুন</button>
                  )}
               </div>

               {/* Leaflet Map - Using Standard OSM for Reliability */}
               <MapContainer
                  center={BANGLADESH_CENTER}
                  zoom={13}
                  style={{ height: "500px", width: "100%" }}
                  className="z-0"
               >
                  <TileLayer
                     attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                     url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />

                  <MapEvents setCoordinates={setCoordinates} />

                  {/* Render Points */}
                  {coordinates.map((coord, idx) => (
                     <Marker key={idx} position={coord} />
                  ))}

                  {/* Render Polygon (Sorted to prevent bowtie) */}
                  {coordinates.length > 2 && (
                     <Polygon
                        positions={[...coordinates].sort((a, b) => {
                           // Sort by angle around centroid to ensure convex polygon
                           const centerLat = coordinates.reduce((sum, p) => sum + p.lat, 0) / coordinates.length;
                           const centerLng = coordinates.reduce((sum, p) => sum + p.lng, 0) / coordinates.length;
                           const angleA = Math.atan2(a.lat - centerLat, a.lng - centerLng);
                           const angleB = Math.atan2(b.lat - centerLat, b.lng - centerLng);
                           return angleA - angleB;
                        })}
                        pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.4 }}
                     />
                  )}
               </MapContainer>

               <div className="p-4 bg-white border-t border-gray-100 relative z-[1000]">
                  <button
                     onClick={handleMapSubmit}
                     disabled={coordinates.length < 3}
                     className="w-full bg-leaf-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-leaf-200 disabled:opacity-50 disabled:bg-gray-400"
                  >
                     পরবর্তী ধাপ
                  </button>
               </div>
            </div>
         ) : null}

         {step === 'INFO' && (
            <form onSubmit={handleFinalSubmit} className="p-6 space-y-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">জমির নাম <span className="text-red-500">*</span></label>
                  <input
                     required
                     type="text"
                     value={formData.name}
                     onChange={e => setFormData({ ...formData, name: e.target.value })}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-leaf-500"
                     placeholder="যেমন: বাড়ির পাশের জমি"
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">জমির পরিমাণ (শতক/একর) <span className="text-red-500">*</span></label>
                  <input
                     required
                     type="number"
                     step="0.01"
                     value={formData.area}
                     onChange={e => setFormData({ ...formData, area: e.target.value })}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-leaf-500"
                     placeholder="১.৫"
                  />
               </div>

               {/* ... Other inputs ... */}

               <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {/* ... Crop and Harvest Time inputs ... */}
                  <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-2">ফসল (ঐচ্ছিক)</label>
                     <input
                        type="text"
                        value={formData.crop}
                        onChange={e => setFormData({ ...formData, crop: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-leaf-500 bg-white"
                        placeholder="কি চাষ করছেন?"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">ফসল তোলার সময় (ঐচ্ছিক)</label>
                     <input
                        type="date"
                        value={formData.harvestTime}
                        onChange={e => setFormData({ ...formData, harvestTime: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-leaf-500 bg-white"
                        placeholder="কবে ফসল তুলবেন?"
                     />
                  </div>
               </div>

               <button type="submit" className="w-full bg-leaf-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-leaf-200">
                  জমি সংরক্ষণ করুন
               </button>
            </form>
         )}
      </div>
   );

};

export default AddField;