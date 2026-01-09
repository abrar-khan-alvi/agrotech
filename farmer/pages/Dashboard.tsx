import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { RiskLevel, IoTReading, ExpertConsultAdvice, AIConsultation } from '../types';
import { fetchWeather, WeatherData } from '../services/weatherService';
import { farmerService } from '../services/farmer';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icon
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

// Helper to center map and fix rendering
const RecenterMap = ({ center }: { center: [number, number] }) => {
   const map = useMap();
   useEffect(() => {
      map.setView(center);
      // Fix for grey area/partial loading
      const timer = setTimeout(() => {
         try {
            map.invalidateSize();
         } catch (e) {
            // Map container might be missing if unmounted quickly
         }
      }, 200);
      return () => clearTimeout(timer);
   }, [center, map]);
   return null;
};



const Dashboard: React.FC = () => {
   const { fields, requests } = useAppContext();
   const { fieldId } = useParams();
   const navigate = useNavigate();
   // Default to first field if id not provided or not found (guard clause)
   const field = fieldId ? fields.find(f => f.id === fieldId) : fields[0];

   const [weather, setWeather] = useState<WeatherData | null>(null);
   const [iotData, setIoTData] = useState<IoTReading[]>([]);
   const [expertAdvice, setExpertAdvice] = useState<ExpertConsultAdvice[]>([]);
   const [aiAdvice, setAIAdvice] = useState<AIConsultation[]>([]);

   useEffect(() => {
      if (!field) return;

      // 1. Weather
      let lat = 23.8103;
      let lng = 90.4125;
      if (field.center) {
         lat = field.center.lat;
         lng = field.center.lng;
      } else if (field.boundary && field.boundary.length > 0) {
         lat = field.boundary[0].lat;
         lng = field.boundary[0].lng;
      }

      const loadData = async () => {
         // Weather
         const wData = await fetchWeather(lat, lng);
         if (wData) setWeather(wData);

         // IoT
         try {
            const iotResponse = await farmerService.getIoTReadings(field.id);
            if (iotResponse && iotResponse.length > 0) {
               setIoTData(iotResponse); // Store all readings
            }
         } catch (e) {
            console.error("IoT fetch error", e);
         }

         // Advice (Global/Filtered)
         try {
            // Fetch all advice and filter for this field's requests locally for now
            // Or fetch general advice. 
            // We can optimize backend later.
            const adviceRes = await farmerService.getAdvice();
            // Filter advice related to this field's requests if possible, 
            // but 'ConsultationAdvice' has 'consultation'. 
            // 'ConsultationRequest' has 'field'.
            // We'd need to join. For now, just show all User's advice.
            setExpertAdvice(adviceRes);
         } catch (e) {
            console.error("Advice fetch error", e);
         }

         // AI
         try {
            const aiRes = await farmerService.getAIConsultations(field.id);
            // Map reportId to id if necessary
            const mappedAI = aiRes.map((item: any) => ({
               ...item,
               id: item.reportId || item.id
            }));
            setAIAdvice(mappedAI);
         } catch (e) {
            console.error("AI fetch error", e);
         }
      };

      loadData();
   }, [field]);

   // Map Center
   const mapCenter: [number, number] = React.useMemo(() => {
      if (!field) return [23.8103, 90.4125];
      // Prioritize calculating center from boundary if available
      if (field.boundary && field.boundary.length > 0) {
         const latSum = field.boundary.reduce((sum, c) => sum + c.lat, 0);
         const lngSum = field.boundary.reduce((sum, c) => sum + c.lng, 0);
         return [latSum / field.boundary.length, lngSum / field.boundary.length];
      }
      if (field.center) return [field.center.lat, field.center.lng];
      return [23.8103, 90.4125];
   }, [field]);

   if (!field) return <div className="p-8 text-center text-gray-400">তথ্য পাওয়া যায়নি (মাঠ নির্বাচন করুন)</div>;

   // Map Polygon
   const polygonPositions: [number, number][] = field.boundary
      ? field.boundary.map(c => [c.lat, c.lng])
      : [];

   return (
      <div className="space-y-6 pb-20">

         {/* 1. Hero / Field Header with Map Background */}
         <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col lg:flex-row">
            {/* Details */}
            <div className="p-6 lg:p-10 lg:w-1/2 flex flex-col justify-center bg-gradient-to-br from-emerald-50 to-white">
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                     <i className="fa-solid fa-seedling text-xl"></i>
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-800">{field.name}</h1>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                     <span className="text-xs text-gray-400 block mb-1">ফসল</span>
                     <span className="font-bold text-gray-700">{field.crop_type || 'নির্ধারিত নেই'}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                     <span className="text-xs text-gray-400 block mb-1">জমির পরিমাণ</span>
                     <span className="font-bold text-gray-700">{field.area_in_acres} একর</span>
                  </div>
               </div>

               <div className="text-sm text-gray-500">
                  <i className="fa-solid fa-location-dot mr-2 text-emerald-500"></i>
                  <span className="font-bold">কেন্দ্র:</span> {mapCenter[0].toFixed(5)}, {mapCenter[1].toFixed(5)}
               </div>

               {/* Boundary Debug Info */}
               {field.boundary && field.boundary.length > 0 && (
                  <div className="mt-2">
                     <details className="text-xs text-gray-400 cursor-pointer">
                        <summary>সীমানা স্থানাঙ্ক ({field.boundary.length}টি পয়েন্ট)</summary>
                        <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-100 font-mono">
                           {field.boundary.map((p, i) => (
                              <div key={i}>P{i + 1}: {p.lat.toFixed(5)}, {p.lng.toFixed(5)}</div>
                           ))}
                        </div>
                     </details>
                  </div>
               )}
            </div>

            {/* Map */}
            <div className="lg:w-1/2 h-[300px] lg:h-[400px] relative z-0">
               <MapContainer
                  key={field.id}
                  center={mapCenter}
                  zoom={17} // Zoom in a bit more for satellite
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
               >
                  <TileLayer
                     attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                     url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                  <RecenterMap center={mapCenter} />
                  {polygonPositions.length > 2 && (
                     <Polygon
                        positions={[...polygonPositions].sort((a, b) => {
                           // Sort by angle around centroid for display
                           const centerLat = polygonPositions.reduce((sum, p) => sum + p[0], 0) / polygonPositions.length;
                           const centerLng = polygonPositions.reduce((sum, p) => sum + p[1], 0) / polygonPositions.length;
                           const angleA = Math.atan2(a[0] - centerLat, a[1] - centerLng);
                           const angleB = Math.atan2(b[0] - centerLat, b[1] - centerLng);
                           return angleA - angleB;
                        })}
                        pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#34d399', fillOpacity: 0.4 }}
                     />
                  )}
                  <Marker position={mapCenter}>
                     <Popup>{field.name} ({mapCenter[0].toFixed(5)}, {mapCenter[1].toFixed(5)})</Popup>
                  </Marker>
               </MapContainer>
            </div>
         </div>

         {/* 1.5. Core Risks & Analysis (Company Core Features) */}
         {field.risks && (
            <div>
               <h3 className="font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-rose-500"></i> ঝুঁকি বিশ্লেষণ ও পূর্বাভাস
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* Flood Prediction */}
                  <div className={`p-3 rounded-2xl border shadow-sm flex flex-col justify-between ${field.risks.flood === RiskLevel.HIGH ? 'bg-red-50 border-red-100' :
                     field.risks.flood === RiskLevel.MEDIUM ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
                     }`}>
                     <div className="flex justify-between items-start mb-1">
                        <div className={`p-1.5 rounded-lg ${field.risks.flood === RiskLevel.HIGH ? 'bg-red-100 text-red-600' :
                           field.risks.flood === RiskLevel.MEDIUM ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                           }`}>
                           <i className="fa-solid fa-house-flood-water text-lg"></i>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${field.risks.flood === RiskLevel.HIGH ? 'bg-white/50 text-red-600' :
                           field.risks.flood === RiskLevel.MEDIUM ? 'bg-white/50 text-amber-600' : 'bg-white/50 text-emerald-600'
                           }`}>Flood Risk</span>
                     </div>
                     <div>
                        <h4 className="text-gray-600 text-[10px] font-bold uppercase mb-0.5">বন্যা পূর্বাভাস</h4>
                        <p className={`text-xl font-extrabold ${field.risks.flood === RiskLevel.HIGH ? 'text-red-700' :
                           field.risks.flood === RiskLevel.MEDIUM ? 'text-amber-700' : 'text-emerald-700'
                           }`}>
                           {field.risks.flood}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                           {field.risks.flood === RiskLevel.HIGH ? 'তাৎক্ষণিক ব্যবস্থা নিন' :
                              field.risks.flood === RiskLevel.MEDIUM ? 'সতর্ক থাকুন' : 'নিরাপদ অবস্থা'}
                        </p>
                     </div>
                  </div>

                  {/* Salinity */}
                  <div className={`p-3 rounded-2xl border shadow-sm flex flex-col justify-between ${field.risks.salinity === RiskLevel.HIGH ? 'bg-red-50 border-red-100' :
                     field.risks.salinity === RiskLevel.MEDIUM ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
                     }`}>
                     <div className="flex justify-between items-start mb-1">
                        <div className={`p-1.5 rounded-lg ${field.risks.salinity === RiskLevel.HIGH ? 'bg-red-100 text-red-600' :
                           field.risks.salinity === RiskLevel.MEDIUM ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                           }`}>
                           <i className="fa-solid fa-droplet text-lg"></i>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${field.risks.salinity === RiskLevel.HIGH ? 'bg-white/50 text-red-600' :
                           field.risks.salinity === RiskLevel.MEDIUM ? 'bg-white/50 text-amber-600' : 'bg-white/50 text-emerald-600'
                           }`}>Salinity</span>
                     </div>
                     <div>
                        <h4 className="text-gray-600 text-[10px] font-bold uppercase mb-0.5">লবণাক্ততা</h4>
                        <p className={`text-xl font-extrabold ${field.risks.salinity === RiskLevel.HIGH ? 'text-red-700' :
                           field.risks.salinity === RiskLevel.MEDIUM ? 'text-amber-700' : 'text-emerald-700'
                           }`}>
                           {field.risks.salinity}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">মাটির মান পর্যবেক্ষণ করুন</p>
                     </div>
                  </div>

                  {/* Crop Disease */}
                  <div className={`p-3 rounded-2xl border shadow-sm flex flex-col justify-between ${field.risks.disease === RiskLevel.HIGH ? 'bg-red-50 border-red-100' :
                     field.risks.disease === RiskLevel.MEDIUM ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
                     }`}>
                     <div className="flex justify-between items-start mb-1">
                        <div className={`p-1.5 rounded-lg ${field.risks.disease === RiskLevel.HIGH ? 'bg-red-100 text-red-600' :
                           field.risks.disease === RiskLevel.MEDIUM ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                           }`}>
                           <i className="fa-solid fa-bug text-lg"></i>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${field.risks.disease === RiskLevel.HIGH ? 'bg-white/50 text-red-600' :
                           field.risks.disease === RiskLevel.MEDIUM ? 'bg-white/50 text-amber-600' : 'bg-white/50 text-emerald-600'
                           }`}>Disease Risk</span>
                     </div>
                     <div>
                        <h4 className="text-gray-600 text-[10px] font-bold uppercase mb-0.5">ফসলের রোগ</h4>
                        <p className={`text-xl font-extrabold ${field.risks.disease === RiskLevel.HIGH ? 'text-red-700' :
                           field.risks.disease === RiskLevel.MEDIUM ? 'text-amber-700' : 'text-emerald-700'
                           }`}>
                           {field.risks.disease}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                           {field.risks.disease === RiskLevel.HIGH ? 'বিশেষজ্ঞের পরামর্শ নিন' : 'নিয়মিত পরিদর্শন করুন'}
                        </p>
                     </div>
                  </div>

               </div>
            </div>
         )}

         {/* 2. Weather & Satellite Data */}
         <div>
            <h3 className="font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
               <i className="fa-solid fa-cloud-sun text-amber-500"></i> আবহাওয়া ও স্যাটেলাইট তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Weather Card */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                     <i className={`fa-solid ${weather?.isDay === 0 ? 'fa-moon' : 'fa-sun'} text-amber-500 text-xl`}></i>
                     <span className="text-xs font-bold text-gray-500 uppercase">আবহাওয়া</span>
                  </div>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-2xl font-extrabold text-gray-800">{weather ? `${weather.temperature}°C` : '--'}</p>
                        <p className="text-xs text-gray-400">বাতাস: {weather ? `${weather.windspeed} km/h` : '--'}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-blue-500 font-bold"><i className="fa-solid fa-cloud-rain mr-1"></i>{weather?.precipitation}mm</p>
                        <p className="text-xs text-gray-400">আর্দ্রতা: {weather?.humidity}%</p>
                     </div>
                  </div>
               </div>

               {/* Satellite Soil Moisture */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                     <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                        <i className="fa-solid fa-water"></i>
                     </div>
                     <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-500">Satellite</span>
                  </div>
                  <h4 className="text-gray-500 text-xs font-bold uppercase mb-1">মাটির আর্দ্রতা (আনুমানিক)</h4>
                  <p className="text-2xl font-extrabold text-gray-800">
                     {weather?.soilReader ? `${(weather.soilReader.moisture * 100).toFixed(0)}%` : '--'}
                  </p>
               </div>

               {/* Satellite Soil Temp */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                     <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
                        <i className="fa-solid fa-temperature-empty"></i>
                     </div>
                     <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-500">Satellite</span>
                  </div>
                  <h4 className="text-gray-500 text-xs font-bold uppercase mb-1">মাটির তাপমাত্রা (আনুমানিক)</h4>
                  <p className="text-2xl font-extrabold text-gray-800">
                     {weather?.soilReader ? `${weather.soilReader.temperature}°C` : '--'}
                  </p>
               </div>
            </div>
         </div>

         {/* 3. Live IoT Sensor Data */}
         <div>
            <h3 className="font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
               <div className="relative flex h-3 w-3">
                  {iotData.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${iotData.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
               </div>
               লাইভ সেন্সর ডেটা (IoT)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Sensor Moisture */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-8 -mt-8"></div>
                  <div className="relative z-10">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Moisture</span>
                        {iotData.length > 0 ? <i className="fa-solid fa-circle-check text-green-500"></i> : <i className="fa-solid fa-circle-xmark text-gray-300"></i>}
                     </div>
                     <p className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        {iotData.length > 0 && iotData[0].soil_moisture ? `${iotData[0].soil_moisture}%` : '--'}
                     </p>
                     <p className="text-[10px] text-gray-400 mt-1">Real-time Sensor</p>
                  </div>
               </div>

               {/* Sensor Temp */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8"></div>
                  <div className="relative z-10">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Temperature</span>
                        {iotData.length > 0 ? <i className="fa-solid fa-circle-check text-green-500"></i> : <i className="fa-solid fa-circle-xmark text-gray-300"></i>}
                     </div>
                     <p className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        {iotData.length > 0 && iotData[0].soil_temperature ? `${iotData[0].soil_temperature}°C` : '--'}
                     </p>
                     <p className="text-[10px] text-gray-400 mt-1">Real-time Sensor</p>
                  </div>
               </div>

               {/* NPK */}
               <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl shadow-sm text-white flex flex-col justify-center">
                  <div className="flex justify-between divide-x divide-gray-700">
                     <div className="px-4 text-center">
                        <span className="block text-xl font-bold text-emerald-400">{iotData.length > 0 ? iotData[0].nitrogen : '-'}</span>
                        <span className="text-[10px] uppercase text-gray-400">N</span>
                     </div>
                     <div className="px-4 text-center">
                        <span className="block text-xl font-bold text-amber-400">{iotData.length > 0 ? iotData[0].phosphorus : '-'}</span>
                        <span className="text-[10px] uppercase text-gray-400">P</span>
                     </div>
                     <div className="px-4 text-center">
                        <span className="block text-xl font-bold text-blue-400">{iotData.length > 0 ? iotData[0].potassium : '-'}</span>
                        <span className="text-[10px] uppercase text-gray-400">K</span>
                     </div>
                  </div>
                  <div className="mt-3 text-center">
                     <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">Soil Nutrients</span>
                  </div>
               </div>
            </div>
         </div>

         {/* 3.1 IoT History Table */}
         {iotData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <i className="fa-solid fa-clock-rotate-left text-blue-500"></i>
                     সেন্সর ইতিহাস (সর্বশেষ ১০টি)
                  </h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                           <th className="px-6 py-4">সময়</th>
                           <th className="px-6 py-4">তাপমাত্রা</th>
                           <th className="px-6 py-4">আর্দ্রতা</th>
                           <th className="px-6 py-4">Nutrients (N-P-K)</th>
                           <th className="px-6 py-4">অবস্থা</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {iotData.slice(0, 10).map((item, idx) => (
                           <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 text-gray-700 font-medium">
                                 {new Date(item.recorded_at).toLocaleString('bn-BD')}
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                 {item.soil_temperature}°C
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                 {item.soil_moisture}%
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex gap-2 text-xs font-bold">
                                    <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">N: {item.nitrogen}</span>
                                    <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">P: {item.phosphorus}</span>
                                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">K: {item.potassium}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 {(() => {
                                    let statusText = 'স্বাভাবিক';
                                    let statusColor = 'bg-emerald-100 text-emerald-700';
                                    let dotColor = 'bg-emerald-500';

                                    const moisture = parseFloat(item.soil_moisture as any) || 0;

                                    if (moisture < 30) {
                                       statusText = 'শুষ্ক';
                                       statusColor = 'bg-amber-100 text-amber-700';
                                       dotColor = 'bg-amber-500';
                                    } else if (moisture > 80) {
                                       statusText = 'আর্দ্র';
                                       statusColor = 'bg-blue-100 text-blue-700';
                                       dotColor = 'bg-blue-500';
                                    }
                                    return (
                                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                                          {statusText}
                                       </span>
                                    );
                                 })()}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 3. Analysis Forecast */}
         {weather && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-calendar-days text-leaf-600"></i> আগামী ৭ দিনের পূর্বাভাস
               </h3>
               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {weather.daily.time.map((t, i) => (
                     <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center text-center hover:border-leaf-200 transition-colors">
                        <span className="text-xs text-slate-500 mb-1">{new Date(t).toLocaleDateString('bn-BD', { weekday: 'short' })}</span>
                        <span className="text-xs font-bold text-gray-800 mb-2">{new Date(t).getDate()}</span>

                        <div className="mb-2">
                           {weather.daily.precipitation_sum[i] > 2
                              ? <i className="fa-solid fa-cloud-showers-heavy text-blue-500 text-lg"></i>
                              : (weather.daily.precipitation_sum[i] > 0.5
                                 ? <i className="fa-solid fa-cloud-rain text-blue-300 text-lg"></i>
                                 : <i className="fa-solid fa-sun text-amber-400 text-lg"></i>)
                           }
                        </div>

                        <div className="flex gap-2 text-xs">
                           <span className="font-bold text-gray-700">{weather.daily.temperature_2m_max[i]}°</span>
                           <span className="text-slate-400">{weather.daily.temperature_2m_min[i]}°</span>
                        </div>
                        {weather.daily.precipitation_sum[i] > 0 && (
                           <span className="text-[10px] text-blue-500 mt-1 font-medium">{weather.daily.precipitation_sum[i]}mm</span>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. Consultation & Expert Advice */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <i className="fa-solid fa-user-doctor text-emerald-600"></i>
                     বিশেষজ্ঞ পরামর্শ
                  </h3>
                  <button onClick={() => navigate('../experts')} className="text-xs text-emerald-600 font-bold hover:underline">
                     নতুন আবেদন
                  </button>
               </div>

               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {/* Active Requests */}
                  {requests.filter(r => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status)).map(req => (
                     <div key={req.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold text-slate-600">পরামর্শের আবেদন #{req.id}</span>
                           <span className={`text-[10px] px-2 py-0.5 rounded-full ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                              {req.status}
                           </span>
                        </div>
                        <p className="text-sm text-gray-800 font-medium mb-1">{req.issue_type}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{req.description}</p>
                     </div>
                  ))}

                  {/* Completed Advice */}
                  {/* Completed Advice */}
                  {expertAdvice.filter(a => a.field === parseInt(field?.id || '0')).map(advice => (
                     <div key={advice.id} className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-xs">
                                 <i className="fa-solid fa-check"></i>
                              </div>
                              <span className="text-xs font-bold text-emerald-800">পরামর্শ প্রাপ্ত</span>
                           </div>
                           <span className="text-[10px] text-emerald-600">{new Date(advice.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-2 mt-2">
                           <div>
                              <span className="text-[10px] font-bold text-emerald-700 uppercase">সমস্যা:</span>
                              <p className="text-xs text-gray-700">{advice.advice.problemSummary}</p>
                           </div>
                           <div>
                              <span className="text-[10px] font-bold text-emerald-700 uppercase">রোগ নির্ণয়:</span>
                              <p className="text-xs text-gray-700">{advice.advice.diagnosis}</p>
                           </div>
                           <div>
                              <span className="text-[10px] font-bold text-emerald-700 uppercase">পরামর্শ:</span>
                              <p className="text-sm font-semibold text-gray-800">{advice.advice.recommendation}</p>
                           </div>
                        </div>
                     </div>
                  ))}

                  {expertAdvice.length === 0 && requests.length === 0 && (
                     <div className="text-center py-10 text-gray-400">
                        <i className="fa-regular fa-comment-dots text-3xl mb-2 opacity-30"></i>
                        <p>কোনো পরামর্শ নেই</p>
                     </div>
                  )}
               </div>
            </div>

            {/* 4. AI Insights */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10">
                  <i className="fa-solid fa-robot text-6xl"></i>
               </div>
               <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 relative z-10">
                  <i className="fa-solid fa-wand-magic-sparkles text-purple-600"></i>
                  AI বিশ্লেষণ
               </h3>

               <div className="space-y-4 relative z-10">
                  {aiAdvice.length > 0 ? (
                     aiAdvice.map(ai => (
                        <div key={ai.id} className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                           <div className="flex justify-between text-xs text-purple-400 mb-2">
                              <span>স্বয়ংক্রিয় বিশ্লেষণ</span>
                              <span>{new Date(ai.created_at).toLocaleDateString()}</span>
                           </div>
                           <div className="mt-2 space-y-2">
                              {Array.isArray(ai.advice) && ai.advice.map((item: any, idx: number) => (
                                 <div key={idx} className="bg-white p-2 rounded border border-purple-100 flex items-start gap-2">
                                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${item.priority === 1 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                       {item.priority}
                                    </div>
                                    <span className="text-sm text-gray-700">{item.action}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-pulse">
                           <i className="fa-solid fa-microchip text-purple-400 text-2xl"></i>
                        </div>
                        <h4 className="text-sm font-bold text-gray-600">AI বিশ্লেষণ চালু আছে</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-[200px]">নতুন সেন্সর ডেটা পাওয়ার সাথে সাথে এখানে বিশ্লেষণ দেখা যাবে।</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default Dashboard;
